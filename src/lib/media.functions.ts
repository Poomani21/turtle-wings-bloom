import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ALLOWED_IMAGE_EXT,
  MAX_UPLOAD_BYTES,
  commitImage,
  normaliseFolder,
  removeImage,
  repoPathFromPublicPath,
  requireAdmin,
} from "./media.server";

const uploadInput = z.object({
  idToken: z.string().min(20),
  folder: z.string().min(1).max(40),
  ext: z.enum(ALLOWED_IMAGE_EXT),
  /** Raw base64 (no data: prefix) of the already-optimised image. */
  base64: z.string().min(32).max(Math.ceil((MAX_UPLOAD_BYTES * 4) / 3) + 1024),
});

export const uploadAdminImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => uploadInput.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(data.idToken);
    const bytes = Math.floor((data.base64.length * 3) / 4);
    if (bytes > MAX_UPLOAD_BYTES) throw new Error("This image is too large. Please choose a smaller file.");
    const url = await commitImage({
      folder: normaliseFolder(data.folder),
      base64: data.base64,
      ext: data.ext,
    });
    return { url };
  });

const deleteInput = z.object({
  idToken: z.string().min(20),
  path: z.string().min(3).max(200),
});

export const deleteAdminImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deleteInput.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(data.idToken);
    if (!repoPathFromPublicPath(data.path)) return { deleted: false as boolean };
    const deleted = await removeImage(data.path);
    return { deleted };
  });
