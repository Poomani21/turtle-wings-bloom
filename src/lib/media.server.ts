/**
 * Server-only helpers for admin image uploads.
 *
 * Images are written as ordinary static assets into the project's
 * `public/images/...` folder, so the deployed site serves them from
 * `/images/<folder>/<file>` with no external storage service involved.
 *
 * NOTE ON HOSTING: a deployed site (Cloudflare) has a read-only filesystem, so
 * writing new images only works while the project runs locally / in the Lovable
 * dev environment. In production the upload is refused with a clear message
 * instead of pretending to have saved the file. After uploading locally the
 * project is rebuilt/redeployed and the images ship as static assets.
 *
 * No GitHub token, no GitHub API and no Firebase Cloud Storage are used.
 * Firebase Authentication and Firestore keep working exactly as before.
 */
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { FIREBASE_PROJECT_ID, FIREBASE_WEB_API_KEY } from "./firebase-project";

export const MEDIA_FOLDERS = ["programs", "members", "blogs", "other"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB after client-side compression

export function normaliseFolder(folder: string): MediaFolder {
  const leaf = folder.split("/").pop()?.toLowerCase() ?? "other";
  const map: Record<string, MediaFolder> = {
    programs: "programs",
    program: "programs",
    members: "members",
    member: "members",
    blogs: "blogs",
    blog: "blogs",
  };
  return map[leaf] ?? "other";
}

/** `/images/blogs/blog-abc123.webp` -> `public/images/blogs/blog-abc123.webp` */
export function repoPathFromPublicPath(publicPath: string): string | null {
  const match = /^\/images\/(programs|members|blogs|other)\/([A-Za-z0-9._-]+)$/.exec(publicPath);
  if (!match) return null;
  const file = match[2]!;
  if (file.includes("..")) return null;
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  if (!(ALLOWED_IMAGE_EXT as readonly string[]).includes(ext)) return null;
  return `public/images/${match[1]}/${file}`;
}

/* ------------------------------ authorisation ------------------------------ */

/**
 * Verifies a Firebase ID token and confirms the user is on the Firestore
 * `admins/{uid}` allowlist. Both checks use Google's REST APIs with the
 * caller's own token — no service account and no privileged key required.
 */
export async function requireAdmin(idToken: string): Promise<string> {
  if (!idToken || idToken.length < 20) throw new Error("Not signed in.");

  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );
  if (!lookup.ok) throw new Error("Your session has expired. Please sign in again.");
  const data = (await lookup.json()) as { users?: { localId?: string }[] };
  const uid = data.users?.[0]?.localId;
  if (!uid) throw new Error("Your session has expired. Please sign in again.");

  const adminDoc = await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/admins/${uid}`,
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
  if (!adminDoc.ok) throw new Error("This account is not allowed to manage content.");
  return uid;
}

/* ------------------------------- filesystem -------------------------------- */

const NOT_WRITABLE =
  "Images can only be added while the site is running in the development environment " +
  "(the published site's files are read-only). Please upload the image in the editor/preview, " +
  "then publish the site again.";

function publicRoot(): string {
  return path.join(process.cwd(), "public", "images");
}

/** Short, content-based id so re-uploading the same image reuses the same file. */
async function contentId(base64: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(base64));
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fileNameFor(folder: MediaFolder, id: string, ext: string): string {
  const prefix = folder === "other" ? "image" : folder.replace(/s$/, "");
  return `${prefix}-${id}.${ext}`;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Writes the image into `public/images/<folder>/` and returns the site-relative
 * public path. Identical bytes reuse the existing file (no duplicates).
 */
export async function commitImage(args: {
  folder: MediaFolder;
  base64: string;
  ext: string;
}): Promise<string> {
  const id = await contentId(args.base64);
  const name = fileNameFor(args.folder, id, args.ext);
  const dir = path.join(publicRoot(), args.folder);
  const filePath = path.join(dir, name);
  const publicPath = `/images/${args.folder}/${name}`;

  try {
    const existing = await stat(filePath).catch(() => null);
    if (existing?.isFile()) return publicPath; // same image already saved
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, base64ToBytes(args.base64));
    // Confirm the write really landed before reporting success.
    const written = await readFile(filePath).catch(() => null);
    if (!written || written.length === 0) throw new Error("empty");
  } catch {
    throw new Error(NOT_WRITABLE);
  }
  return publicPath;
}

/** Deletes a single managed image. Returns false when the file was not found. */
export async function removeImage(publicPath: string): Promise<boolean> {
  const repoPath = repoPathFromPublicPath(publicPath);
  if (!repoPath) return false;
  const filePath = path.join(process.cwd(), repoPath);
  try {
    const existing = await stat(filePath).catch(() => null);
    if (!existing?.isFile()) return false;
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
