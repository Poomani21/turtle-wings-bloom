import {
  addDoc,
  collection,
  deleteDoc as fsDeleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { deleteManagedImage, isManagedImagePath } from "./media-upload";
import type {
  BlogDoc,
  EnquiryDoc,
  MemberDoc,
  ProgramDoc,
  SiteSettings,
  VideoDoc,
} from "./cms-types";

export type CollectionName = "programs" | "members" | "blogs" | "videos" | "enquiries";

const MEDIA_COLLECTIONS: CollectionName[] = ["programs", "members", "blogs", "videos"];
/** Fields that may hold a managed `/images/...` path. */
const IMAGE_FIELDS = ["image", "thumbnailUrl", "coverImage"] as const;

function normalise<T>(id: string, data: Record<string, unknown>): T {
  const out: Record<string, unknown> = { id };
  for (const [key, value] of Object.entries(data)) {
    out[key] =
      value && typeof value === "object" && "toDate" in (value as object)
        ? (value as { toDate: () => Date }).toDate().toISOString()
        : value;
  }
  return out as T;
}

async function readAll<T>(name: CollectionName, filter?: [string, unknown]): Promise<T[]> {
  const db = await getDb();
  const base = collection(db, name);
  const snap = await getDocs(filter ? query(base, where(filter[0], "==", filter[1])) : base);
  return snap.docs.map((d) => normalise<T>(d.id, d.data()));
}

/* ---------------------------------- public --------------------------------- */

export async function fetchActivePrograms(): Promise<ProgramDoc[]> {
  const rows = await readAll<ProgramDoc>("programs", ["status", "active"]);
  return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));
}

export async function fetchPublishedBlogs(): Promise<BlogDoc[]> {
  const rows = await readAll<BlogDoc>("blogs", ["isPublished", true]);
  return rows.sort((a, b) =>
    (b.publishedDate ?? b.createdAt ?? "").localeCompare(a.publishedDate ?? a.createdAt ?? ""),
  );
}

export async function fetchPublishedVideos(): Promise<VideoDoc[]> {
  const rows = await readAll<VideoDoc>("videos", ["isPublished", true]);
  return rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/** Members explicitly marked public by an administrator. Never returns private records. */
export async function fetchPublicMembers(): Promise<MemberDoc[]> {
  const rows = await readAll<MemberDoc>("members", ["isPublic", true]);
  return rows
    .filter((m) => m.isPublic)
    .sort(
      (a, b) =>
        (a.joinedDate ?? "").localeCompare(b.joinedDate ?? "") || a.name.localeCompare(b.name),
    );
}

/**
 * Admin allowlist check: the signed-in UID must have an `admins/{uid}` doc.
 * Mirrors the Firestore `isAdmin()` rule, so the panel only opens for accounts
 * that can actually write. Any error resolves to false.
 */
export async function isAdminUser(uid: string): Promise<boolean> {
  try {
    const db = await getDb();
    const snap = await getDoc(doc(db, "admins", uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const db = await getDb();
  const snap = await getDoc(doc(db, "settings", "site"));
  return snap.exists() ? (snap.data() as SiteSettings) : {};
}

export async function submitEnquiry(
  data: Omit<EnquiryDoc, "id" | "status" | "createdAt">,
): Promise<void> {
  const db = await getDb();
  await addDoc(collection(db, "enquiries"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
}

/* ---------------------------------- admin ---------------------------------- */

export async function adminList<T>(name: CollectionName): Promise<T[]> {
  const rows = await readAll<T & { createdAt?: string; title?: string; name?: string }>(name);
  return rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")) as unknown as T[];
}

export async function adminSave(
  name: CollectionName,
  id: string | null,
  data: Record<string, unknown>,
): Promise<void> {
  const db = await getDb();
  if (id) {
    await updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, name), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function adminDelete(name: CollectionName, id: string): Promise<void> {
  const db = await getDb();
  await fsDeleteDoc(doc(db, name, id));
}

/** Managed image paths held by a record. */
export function imagePathsOf(row: Record<string, unknown>): string[] {
  const found = IMAGE_FIELDS.map((field) => row[field]).filter(isManagedImagePath);
  return [...new Set(found)];
}

/**
 * True when any *other* record (in any collection) still points at `path`.
 * Used so deleting one entry never removes an image shared by another record.
 */
export async function isImageReferencedAnywhere(path: string): Promise<boolean> {
  return isImageReferencedElsewhere(path, { name: "programs", id: "__none__" });
}

/**
 * After an edit, removes image files the record no longer points at — but only
 * when no other record (including the just-saved one) still references them.
 * Never throws: a failed cleanup must not break saving.
 */
export async function cleanupReplacedImages(
  name: CollectionName,
  previous: Record<string, unknown> | null,
  next: Record<string, unknown>,
): Promise<void> {
  if (!previous) return;
  const keep = imagePathsOf(next);
  const stale = imagePathsOf(previous).filter((path) => !keep.includes(path));
  for (const path of stale) {
    try {
      if (!(await isImageReferencedAnywhere(path))) await deleteManagedImage(path);
    } catch {
      /* keep the file rather than risk removing one still in use */
    }
  }
}

export async function isImageReferencedElsewhere(
  path: string,
  skip: { name: CollectionName; id: string },
): Promise<boolean> {
  for (const name of MEDIA_COLLECTIONS) {
    const rows = await readAll<Record<string, unknown> & { id: string }>(name);
    const hit = rows.some(
      (row) => !(name === skip.name && row.id === skip.id) && imagePathsOf(row).includes(path),
    );
    if (hit) return true;
  }
  return false;
}

/**
 * Deletes a record and, when safe, the images it owned.
 * Images still referenced by another record are kept. The Firestore document is
 * removed first so a failed image cleanup can never leave a broken record.
 */
export async function adminDeleteWithMedia(
  name: CollectionName,
  row: Record<string, unknown> & { id: string },
): Promise<{ imagesDeleted: number; imageWarning?: string }> {
  const paths = imagePathsOf(row);
  const orphans: string[] = [];
  for (const path of paths) {
    try {
      if (!(await isImageReferencedElsewhere(path, { name, id: row.id }))) orphans.push(path);
    } catch {
      /* if we cannot verify, keep the file rather than risk deleting a shared image */
    }
  }

  await adminDelete(name, row.id);

  let imagesDeleted = 0;
  let imageWarning: string | undefined;
  for (const path of orphans) {
    try {
      if (await deleteManagedImage(path)) imagesDeleted += 1;
    } catch (error) {
      imageWarning = (error as Error).message || "The image file could not be removed.";
    }
  }
  return imageWarning ? { imagesDeleted, imageWarning } : { imagesDeleted };
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  const db = await getDb();
  await setDoc(
    doc(db, "settings", "site"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
