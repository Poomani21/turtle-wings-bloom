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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { getDb, getFirebase } from "./firebase";
import type {
  BlogDoc,
  EnquiryDoc,
  MemberDoc,
  ProgramDoc,
  SiteSettings,
  VideoDoc,
} from "./cms-types";


export type CollectionName = "programs" | "members" | "blogs" | "videos" | "enquiries";

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
    .sort((a, b) => (a.joinedDate ?? "").localeCompare(b.joinedDate ?? "") || a.name.localeCompare(b.name));
}


/**
 * Admin allowlist check: the signed-in UID must have an `admins/{uid}` doc.
 * Mirrors the Firestore/Storage `isAdmin()` rule, so the panel only opens for
 * accounts that can actually write. Any error (including permission-denied for
 * non-admins) resolves to false.
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
  return rows.sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  ) as unknown as T[];
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

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  const db = await getDb();
  await setDoc(doc(db, "settings", "site"), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB

const legacyFolders = new Set(["blogs", "videos", "programs", "members"]);

/**
 * Storage folder for a media field, e.g. ("blogs", video) -> "videos/blog".
 * Existing short folder names ("blogs") keep working for legacy records.
 */
export function storageFolder(folder: string, file: File): string {
  if (folder.includes("/")) return folder;
  const kind = file.type.startsWith("video/") ? "videos" : "images";
  if (!legacyFolders.has(folder)) return `${kind}/general`;
  const leaf = folder === "blogs" ? "blog" : folder;
  return `${kind}/${leaf}`;
}

function humanSize(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/** Validates type + size. Throws a readable message when the file is rejected. */
export function validateUpload(file: File, accept?: string): void {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (accept?.startsWith("video") && !isVideo) throw new Error("Please choose a video file.");
  if (accept?.startsWith("image") && !isImage) throw new Error("Please choose an image file.");
  if (!isVideo && !isImage) throw new Error("Only image and video files can be uploaded.");
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    throw new Error(
      `This file is ${humanSize(file.size)}. Please choose a file under ${humanSize(limit)}.`,
    );
  }
}

/**
 * Uploads to Firebase Storage and returns the public download URL.
 * `onProgress` receives 0–100 while the file transfers.
 */
export async function uploadFile(
  folder: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { storage } = await getFirebase();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const path = `${storageFolder(folder, file)}/${Date.now()}-${safe}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) =>
        onProgress?.(
          snap.totalBytes ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0,
        ),
      (error) => reject(new Error(error.message || "Upload failed. Please try again.")),
      () => resolve(),
    );
  });
  return getDownloadURL(task.snapshot.ref);
}

