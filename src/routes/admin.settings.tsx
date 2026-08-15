import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fetchSiteSettings, saveSiteSettings } from "@/lib/cms";
import type { SiteSettings } from "@/lib/cms-types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const textFields: { name: keyof SiteSettings; label: string; help?: string }[] = [
  { name: "phone", label: "Phone number" },
  { name: "whatsapp", label: "WhatsApp number" },
  { name: "email", label: "Email address" },
  { name: "website", label: "Website" },
  { name: "days", label: "Days open", help: "e.g. Monday – Friday" },
  { name: "startTime", label: "Start time" },
  { name: "endTime", label: "End time" },
  { name: "ageGroup", label: "Age group" },
  { name: "closed", label: "Closed on" },
];

function AdminSettings() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings", "site"], queryFn: fetchSiteSettings });
  const [draft, setDraft] = useState<SiteSettings>({});

  useEffect(() => {
    if (settings.data) setDraft(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: (data: SiteSettings) => saveSiteSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "site"] }),
  });

  function set(field: keyof SiteSettings, value: string | number) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  const inputClass = "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base";

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-forest-deep">Site settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Contact details, timings and the map shown on the Contact page.
      </p>

      {settings.isLoading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Loading…
        </p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(draft);
          }}
          className="mt-6 rounded-2xl border border-border bg-card p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {textFields.map((field) => (
              <div key={field.name}>
                <label htmlFor={`s-${field.name}`} className="mb-1.5 block text-sm font-bold">
                  {field.label}
                </label>
                <input
                  id={`s-${field.name}`}
                  value={String(draft[field.name] ?? "")}
                  onChange={(e) => set(field.name, e.target.value)}
                  className={inputClass}
                />
                {field.help ? (
                  <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
                ) : null}
              </div>
            ))}
            <div>
              <label htmlFor="s-maxChildren" className="mb-1.5 block text-sm font-bold">
                Maximum children per batch
              </label>
              <input
                id="s-maxChildren"
                type="number"
                value={String(draft.maxChildren ?? "")}
                onChange={(e) => set("maxChildren", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="s-address" className="mb-1.5 block text-sm font-bold">
                Address
              </label>
              <textarea
                id="s-address"
                rows={4}
                value={String(draft.address ?? "")}
                onChange={(e) => set("address", e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-base"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="s-map" className="mb-1.5 block text-sm font-bold">
                Google Maps embed URL
              </label>
              <input
                id="s-map"
                value={String(draft.mapEmbedUrl ?? "")}
                onChange={(e) => set("mapEmbedUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=…"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                In Google Maps choose Share → Embed a map and paste the src URL here.
              </p>
            </div>
            <div>
              <label htmlFor="s-facebook" className="mb-1.5 block text-sm font-bold">
                Facebook URL
              </label>
              <input
                id="s-facebook"
                value={String(draft.facebook ?? "")}
                onChange={(e) => set("facebook", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="s-instagram" className="mb-1.5 block text-sm font-bold">
                Instagram URL
              </label>
              <input
                id="s-instagram"
                value={String(draft.instagram ?? "")}
                onChange={(e) => set("instagram", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {save.isError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {(save.error as Error).message}
            </p>
          ) : null}
          {save.isSuccess ? (
            <p role="status" className="mt-4 text-sm text-leaf">
              Settings saved.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={save.isPending}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-extrabold text-primary-foreground disabled:opacity-70"
          >
            {save.isPending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
            Save settings
          </button>
        </form>
      )}
    </div>
  );
}
