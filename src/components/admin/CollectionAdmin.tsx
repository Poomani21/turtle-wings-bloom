import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  adminDeleteWithMedia,
  cleanupReplacedImages,
  adminList,
  adminSave,
  type CollectionName,
} from "@/lib/cms";
import { MediaUpload } from "@/components/admin/MediaUpload";


export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "switch" | "date" | "upload" | "list";
  options?: readonly string[];
  accept?: string;
  folder?: string;
  help?: string;
  required?: boolean;
};

type Row = Record<string, unknown> & { id: string };

export function CollectionAdmin({
  name,
  heading,
  intro,
  fields,
  defaults,
  primary,
  secondary,
  details,
  actions,
  allowCreate = true,
}: {
  name: CollectionName;
  heading: string;
  intro?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  primary: (row: Row) => string;
  secondary?: (row: Row) => string;
  details?: (row: Row) => ReactNode;
  actions?: (row: Row) => ReactNode;
  allowCreate?: boolean;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Row | null>(null);
  // The record as it was when the editor opened, so a replaced image file can be
  // cleaned up after a successful save.
  const [original, setOriginal] = useState<Row | null>(null);
  

  const list = useQuery({ queryKey: ["admin", name], queryFn: () => adminList<Row>(name) });

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const { id, ...rest } = row;
      await adminSave(name, id || null, rest);
      await cleanupReplacedImages(name, original, rest);
    },
    onSuccess: async () => {
      setDraft(null);
      setOriginal(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", name] });
    },
  });

  // Deleting a record also removes the images it owned, unless another record
  // still points at the same file.
  const remove = useMutation({
    mutationFn: (row: Row) => adminDeleteWithMedia(name, row),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", name] }),
  });

  function set(field: string, value: unknown) {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  }


  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-forest-deep">{heading}</h1>
          {intro ? <p className="mt-1 text-sm text-muted-foreground">{intro}</p> : null}
        </div>
        {allowCreate ? (
          <button
            type="button"
            onClick={() => {
              setOriginal(null);
              setDraft({ id: "", ...defaults });
            }}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-extrabold text-secondary-foreground"
          >
            <Plus aria-hidden="true" className="size-4" /> New
          </button>
        ) : null}
      </div>

      {draft ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(draft);
          }}
          className="mt-6 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-forest-deep">
              {draft.id ? "Edit entry" : "New entry"}
            </h2>
            <button type="button" onClick={() => {
              setDraft(null);
              setOriginal(null);
            }} aria-label="Close editor">
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const value = draft[field.name];
              const id = `field-${field.name}`;
              const inputClass =
                "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base";
              return (
                <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={id}
                      rows={6}
                      required={field.required}
                      value={String(value ?? "")}
                      onChange={(e) => set(field.name, e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-3 text-base"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={id}
                      value={String(value ?? "")}
                      onChange={(e) => set(field.name, e.target.value)}
                      className={inputClass}
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "switch" ? (
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        id={id}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => set(field.name, e.target.checked)}
                        className="size-4"
                      />
                      {field.help ?? "Enabled"}
                    </label>
                  ) : field.type === "upload" ? (
                    <MediaUpload
                      id={id}
                      value={String(value ?? "")}
                      accept={field.accept ?? "image/*"}
                      folder={field.folder ?? name}
                      onChange={(url) => set(field.name, url)}
                    />

                  ) : field.type === "list" ? (
                    <textarea
                      id={id}
                      rows={3}
                      value={Array.isArray(value) ? (value as string[]).join("\n") : String(value ?? "")}
                      onChange={(e) =>
                        set(
                          field.name,
                          e.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        )
                      }
                      className="w-full rounded-xl border border-input bg-background p-3 text-base"
                    />
                  ) : (
                    <input
                      id={id}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      required={field.required}
                      value={String(value ?? "")}
                      onChange={(e) =>
                        set(
                          field.name,
                          field.type === "number" ? Number(e.target.value) : e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  )}
                  {field.help && field.type !== "switch" ? (
                    <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {save.isError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {(save.error as Error).message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={save.isPending}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-extrabold text-primary-foreground disabled:opacity-70"
          >
            {save.isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
            Save
          </button>
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        {list.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Loading…
          </p>
        ) : list.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {(list.error as Error).message}
          </p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          (list.data ?? []).map((row) => (
            <div key={row.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="font-display font-bold break-words text-forest-deep">{primary(row)}</p>
                  {secondary ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{secondary(row)}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {actions?.(row)}
                  <button
                    type="button"
                    onClick={() => {
                      setOriginal(row);
                      setDraft({ ...defaults, ...row });
                    }}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-input px-3 text-sm font-bold"
                  >
                    <Pencil aria-hidden="true" className="size-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this entry? This cannot be undone.")) remove.mutate(row);
                    }}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-destructive/40 px-3 text-sm font-bold text-destructive"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" /> Delete
                  </button>
                </div>
              </div>
              {details ? <div className="mt-3 text-sm">{details(row)}</div> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
