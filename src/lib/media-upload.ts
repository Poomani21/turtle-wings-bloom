/**
 * Client side of the admin image pipeline.
 *
 * 1. Validate MIME type, extension and size.
 * 2. Resize + re-encode to WebP in the browser (keeps the repository small).
 * 3. Send the bytes to the authenticated server function, which commits the file
 *    into `public/images/...` and returns the public path (e.g.
 *    `/images/blogs/blog-abc.webp`). No Firebase Storage, no GitHub token here.
 */
import { getFirebaseAuth } from "./firebase";
import { uploadAdminImage, deleteAdminImage } from "./media.functions";

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];
export const MAX_SOURCE_BYTES = 12 * 1024 * 1024; // 12 MB picked file
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB after optimisation
const MAX_EDGE = 1600;

export function validateImageFile(file: File): void {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG or WebP image.");
  }
  if (!ALLOWED_IMAGE_EXT.includes(ext)) {
    throw new Error("Please choose a file ending in .jpg, .jpeg, .png or .webp.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(
      `This image is ${Math.round(file.size / (1024 * 1024))} MB. Please choose one under 12 MB.`,
    );
  }
}

async function loadBitmap(file: File): Promise<{ width: number; height: number; source: CanvasImageSource }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { width: bitmap.width, height: bitmap.height, source: bitmap };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This image could not be read."));
      element.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight, source: img };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Resizes to fit MAX_EDGE and encodes as WebP. Falls back to the original bytes. */
async function optimise(file: File): Promise<{ blob: Blob; ext: string }> {
  try {
    const { width, height, source } = await loadBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/webp", 0.85),
    );
    if (blob && blob.size > 0) return { blob, ext: "webp" };
  } catch {
    /* fall through to the original file */
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  return { blob: file, ext: ext === "jpeg" ? "jpg" : ext };
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("This image could not be read."));
    reader.readAsDataURL(blob);
  });
}

async function currentIdToken(): Promise<string> {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  return user.getIdToken();
}

/**
 * Uploads an admin image and resolves with its public path
 * (e.g. `/images/programs/program-abc.webp`).
 */
export async function uploadImage(
  folder: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  validateImageFile(file);
  onProgress?.(10);
  const { blob, ext } = await optimise(file);
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("This image is too large even after optimisation. Please choose a smaller one.");
  }
  onProgress?.(45);
  const base64 = await toBase64(blob);
  const idToken = await currentIdToken();
  onProgress?.(70);
  const result = await uploadAdminImage({ data: { idToken, folder, ext, base64 } });
  onProgress?.(100);
  return result.url;
}

/** True when the value is an image this app manages inside `public/images`. */
export function isManagedImagePath(value: unknown): value is string {
  return typeof value === "string" && /^\/images\/(programs|members|blogs|other)\//.test(value);
}

/** Removes a managed image from the repository. Ignores anything else. */
export async function deleteManagedImage(path: string): Promise<boolean> {
  if (!isManagedImagePath(path)) return false;
  const idToken = await currentIdToken();
  const result = await deleteAdminImage({ data: { idToken, path } });
  return result.deleted;
}
