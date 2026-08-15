import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { uploadImage, validateImageFile } from "@/lib/media-upload";

/**
 * Image field for the admin forms: pick a local file, it is optimized in the
 * browser and uploaded by the server function. Firestore stores the resulting 
 * image path/URL. Existing https:// URLs keep working — the URL box below stays editable.
 */
export function MediaUpload({
  id,
  value,
  accept = "image/jpeg,image/png,image/webp",
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

  const busy = progress !== null;

  async function handleFile(file: File) {
    setError(null);
    setDone(false);
    setFileName(file.name);
    try {
      validateImageFile(file);
    } catch (err) {
      setError((err as Error).message);
      setProgress(null);
      return;
    }
    setProgress(0);
    try {
      const url = await uploadImage(folder, file, setProgress);
      onChange(url);
      setDone(true);
    } catch (err) {
      setError((err as Error).message || "Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="rounded-2xl border border-dashed border-input bg-background/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-extrabold text-secondary-foreground disabled:opacity-60"
          >
            <Upload aria-hidden="true" className="size-4" />
            {value ? "Replace image" : "Choose image"}
          </button>
          {fileName ? (
            <span className="min-w-0 truncate text-xs text-muted-foreground">{fileName}</span>
          ) : (
            <span className="text-xs text-muted-foreground">JPG, PNG or WebP up to 12 MB</span>
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
          <p role="alert" className="mt-3 flex items-start gap-2 text-xs break-words text-destructive">
            <X aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /> {error}
          </p>
        ) : null}

        {done && !busy ? (
          <p role="status" className="mt-3 flex items-center gap-2 text-xs font-bold text-leaf">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Image saved to the website
          </p>
        ) : null}

        {value && !busy ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={value}
              alt=""
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
        ) : null}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image path / https:// link"
        className="min-h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-sm"
      />
    </div>
  );
}