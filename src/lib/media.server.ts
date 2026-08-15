/**
 * Server-only helpers for admin image uploads.
 *
 * Images are committed into the repository's `public/images/...` folder through
 * the GitHub Contents API. The GitHub write token lives only in the server
 * environment (`GITHUB_TOKEN`) and is never sent to the browser.
 *
 * Firebase Cloud Storage is intentionally NOT used. Firebase Authentication and
 * Firestore keep working exactly as before.
 */
import { FIREBASE_PROJECT_ID, FIREBASE_WEB_API_KEY } from "./firebase-project";

export const MEDIA_FOLDERS = ["programs", "members", "blogs", "other"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
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
  const ext = match[2]!.split(".").pop()?.toLowerCase() ?? "";
  if (!(ALLOWED_IMAGE_EXT as readonly string[]).includes(ext)) return null;
  return `public/images/${match[1]}/${match[2]}`;
}

export function uniqueFileName(folder: MediaFolder, ext: string): string {
  const prefix = folder === "other" ? "image" : folder.replace(/s$/, "");
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${id}.${ext}`;
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

/* --------------------------------- GitHub --------------------------------- */

type GitHubEnv = { token: string; repo: string; branch: string };

function githubEnv(): GitHubEnv {
  const token = process.env["GITHUB_TOKEN"];
  if (!token) {
    throw new Error(
      "Image uploads are not configured yet: the server is missing its GitHub token.",
    );
  }
  return {
    token,
    repo: process.env["GITHUB_REPO"] ?? "Poomani21/turtle-wings-admin-ff914d93",
    branch: process.env["GITHUB_BRANCH"] ?? "main",
  };
}

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "content-type": "application/json",
  };
}

/** Commits a file and returns the site-relative public path. */
export async function commitImage(args: {
  folder: MediaFolder;
  base64: string;
  ext: string;
}): Promise<string> {
  const { token, repo, branch } = githubEnv();
  const name = uniqueFileName(args.folder, args.ext);
  const repoPath = `public/images/${args.folder}/${name}`;

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${repoPath}`, {
    method: "PUT",
    headers: ghHeaders(token),
    body: JSON.stringify({
      message: `chore(media): add ${repoPath}`,
      content: args.base64,
      branch,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Upload failed (${res.status}). ${detail.slice(0, 180)}`);
  }
  return `/images/${args.folder}/${name}`;
}

/** Deletes a single committed image. Returns false when the file was not found. */
export async function removeImage(publicPath: string): Promise<boolean> {
  const repoPath = repoPathFromPublicPath(publicPath);
  if (!repoPath) return false;
  const { token, repo, branch } = githubEnv();

  const head = await fetch(
    `https://api.github.com/repos/${repo}/contents/${repoPath}?ref=${branch}`,
    { headers: ghHeaders(token) },
  );
  if (head.status === 404) return false;
  if (!head.ok) throw new Error(`Could not read the image from the repository (${head.status}).`);
  const { sha } = (await head.json()) as { sha?: string };
  if (!sha) return false;

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${repoPath}`, {
    method: "DELETE",
    headers: ghHeaders(token),
    body: JSON.stringify({ message: `chore(media): remove ${repoPath}`, sha, branch }),
  });
  if (!res.ok) throw new Error(`Could not delete the image (${res.status}).`);
  return true;
}
