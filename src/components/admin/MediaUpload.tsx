import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { uploadFile, validateUpload } from "@/lib/cms";

/**
 * Media field for the admin forms: pick a local file, upload it to Firebase
 * Storage and store the resulting download URL. Existing HTTPS URLs keep
 * working — the URL box below stays editable.
 */
export function MediaUpload({
  id,
  value,
  accept = "image/*",
  folder,
  onChange,
}: {
  id: string;
  value: string;
  accept?: string;
  folder: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isVideoField = accept.startsWith("video");
  const busy = progress !== null;

  async function handleFile(file: File) {
    setError(null);
    setDone(false);
    setFileName(file.name);
    try {
      validateUpload(file, accept);
    } catch (err) {
      setError((err as Error).message);
      setProgress(null);
      return;
    }
    setProgress(0);
    try {
      const url = await uploadFile(folder, file, setProgress);
      onChange(url);
      setDone(true);
    } catch (err) {
      setError((err as Error).message || "Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-dashed border-input bg-background/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-extrabold text-secondary-foreground disabled:opacity-60"
          >
            <Upload aria-hidden="true" className="size-4" />
            {value ? (isVideoField ? "Replace video" : "Replace image") : isVideoField ? "Choose video" : "Choose image"}
          </button>
          {fileName ? (
            <span className="min-w-0 truncate text-xs text-muted-foreground">{fileName}</span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {isVideoField ? "MP4 up to 200 MB" : "JPG, PNG or WebP up to 8 MB"}
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />

        {busy ? (
          <div className="mt-3">
            <p className="flex items-center gap-2 text-xs font-bold text-forest-deep">
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> Uploading… {progress}%
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-leaf transition-all"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-3 flex items-start gap-2 text-xs text-destructive">
            <X aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /> {error}
          </p>
        ) : null}

        {done && !busy ? (
          <p role="status" className="mt-3 flex items-center gap-2 text-xs font-bold text-leaf">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            {isVideoField ? "Video uploaded successfully" : "Image uploaded successfully"}
          </p>
        ) : null}

        {value && !busy ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
            {isVideoField ? (
              <video src={value} controls preload="metadata" className="aspect-video w-full object-cover" />
            ) : (
              <img src={value} alt="" loading="lazy" className="aspect-[3/2] w-full object-cover" />
            )}
          </div>
        ) : null}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an https:// link"
        className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
      />
    </div>
  );
}
