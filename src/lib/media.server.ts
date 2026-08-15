/**
 * Server-only helpers for admin image uploads.
 *
 * Supports both Cloudflare R2 object storage (deployed) and Node.js static filesystem (localhost).
 */
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { FIREBASE_PROJECT_ID, FIREBASE_WEB_API_KEY } from "./firebase-project";

export const MEDIA_FOLDERS = ["programs", "members", "blogs", "other"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB after client-side compression

/**
 * STATIC R2 BASE URL
 * Replace with "https://media.turtlewings.in" when your custom domain is connected.
 */
const R2_PUBLIC_BASE_URL = "https://pub-697898424e3a4c4fa8dd35b5a8de37e3.r2.dev";

/**
 * Automatically retrieves the Cloudflare R2 bucket binding without requiring `env` arguments.
 */
function getBucket(): any {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any;
    if (g.MEDIA_BUCKET) return g.MEDIA_BUCKET;
    if (g.env?.MEDIA_BUCKET) return g.env.MEDIA_BUCKET;
    if (g.__env__?.MEDIA_BUCKET) return g.__env__.MEDIA_BUCKET;
    if (typeof process !== "undefined" && (process as any).env?.MEDIA_BUCKET) {
      return (process as any).env.MEDIA_BUCKET;
    }
  }
  return null;
}

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

/** Parses image path/URL and returns the repository path for local disk. */
export function repoPathFromPublicPath(publicPath: string): string | null {
  const match = /(?:^\/images\/|(?:\/[^\/]+)*\/)(programs|members|blogs|other)\/([A-Za-z0-9._-]+)$/.exec(publicPath);
  if (!match) return null;
  const file = match[2]!;
  if (file.includes("..")) return null;
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  if (!(ALLOWED_IMAGE_EXT as readonly string[]).includes(ext)) return null;
  return `public/images/${match[1]}/${file}`;
}

/** Extracts the R2 key (e.g., "members/member-abc123.webp") from local or public URLs. */
function r2KeyFromPublicPath(publicPath: string): string | null {
  const match = /(?:^\/images\/|(?:\/[^\/]+)*\/)(programs|members|blogs|other)\/([A-Za-z0-9._-]+)$/.exec(publicPath);
  if (!match) return null;
  const file = match[2]!;
  if (file.includes("..")) return null;
  return `${match[1]}/${file}`;
}

/* ------------------------------ authorisation ------------------------------ */

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

/* ------------------------------- filesystem & R2 -------------------------------- */

function publicRoot(): string {
  return path.join(process.cwd(), "public", "images");
}

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
 * Adds / Uploads an image.
 * - On Cloudflare R2: Uploads object to R2 and returns full URL (`https://pub-....r2.dev/members/file.webp`).
 * - On Localhost: Saves file directly to `./public/images/<folder>/file.webp`.
 */
export async function commitImage(args: {
  folder: MediaFolder;
  base64: string;
  ext: string;
}): Promise<string> {
  const id = await contentId(args.base64);
  const name = fileNameFor(args.folder, id, args.ext);
  const key = `${args.folder}/${name}`;
  const imageBytes = base64ToBytes(args.base64);
  const bucket = getBucket();

  // 1. CLOUDFLARE R2 ENVIRONMENT (Dev Cloud & Production)
  if (bucket) {
    await bucket.put(key, imageBytes, {
      httpMetadata: { contentType: `image/${args.ext}` },
    });
    return `${R2_PUBLIC_BASE_URL}/${key}`;
  }

  // 2. LOCALHOST FALLBACK (Node.js File System)
  const dir = path.join(publicRoot(), args.folder);
  const filePath = path.join(dir, name);
  const publicPath = `/images/${args.folder}/${name}`;

  try {
    const existing = await stat(filePath).catch(() => null);
    if (existing?.isFile()) return publicPath;
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, imageBytes);
    const written = await readFile(filePath).catch(() => null);
    if (!written || written.length === 0) throw new Error("empty");
    return publicPath;
  } catch {
    throw new Error("Unable to save image locally.");
  }
}

/**
 * Removes / Deletes an image.
 * - On Cloudflare R2: Deletes object from R2 bucket.
 * - On Localhost: Unlinks file from local filesystem.
 */
export async function removeImage(publicPath: string): Promise<boolean> {
  const bucket = getBucket();

  // 1. CLOUDFLARE R2 ENVIRONMENT
  if (bucket) {
    const key = r2KeyFromPublicPath(publicPath);
    if (!key) return false;
    try {
      await bucket.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  // 2. LOCALHOST FALLBACK
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