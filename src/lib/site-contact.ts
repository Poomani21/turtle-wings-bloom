import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "./cms";
import type { SiteSettings } from "./cms-types";
import { site } from "./site-content";

/**
 * Contact details resolved from Firebase `settings/site` (via the existing
 * `fetchSiteSettings()` helper) with the existing static values in
 * `site-content.ts` as safe fallbacks whenever a value is missing, empty,
 * or Firebase is unavailable.
 */
export type SiteContact = {
  address: string[];
  phone: string;
  phoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  email: string;
  website: string;
  timings: string;
  closed: string;
  mapEmbedUrl?: string | undefined;
  ageGroup?: string;
};

const clean = (value?: string) => (typeof value === "string" && value.trim() ? value.trim() : "");
const digits = (value: string) => value.replace(/[^\d]/g, "");

export function resolveSiteContact(settings?: SiteSettings | null): SiteContact {
  const address = clean(settings?.address);
  const phone = clean(settings?.phone) || site.phone;
  const whatsapp = clean(settings?.whatsapp) || site.whatsapp;
  const days = clean(settings?.days);
  const startTime = clean(settings?.startTime);
  const endTime = clean(settings?.endTime);
  const timings =
    days && startTime && endTime ? `${days}: ${startTime} – ${endTime}` : site.timings;

  return {
    address: address
      ? address
          .split(/\n|,\s*(?=\S)/)
          .map((line) => line.trim())
          .filter(Boolean)
      : [...site.address],
    phone,
    phoneHref: clean(settings?.phone) ? `tel:+${digits(phone)}` : site.phoneHref,
    whatsapp,
    whatsappHref: clean(settings?.whatsapp)
      ? `https://wa.me/${digits(whatsapp)}`
      : site.whatsappHref,
    email: clean(settings?.email) || site.email,
    website: clean(settings?.website) || site.website,
    timings,
    closed: clean(settings?.closed) || site.closed,
    mapEmbedUrl: clean(settings?.mapEmbedUrl) || site.mapEmbedUrl,
    ageGroup: clean(settings?.ageGroup) || "3–10 years",
  };
}

export function useSiteContact(): SiteContact {
  const { data } = useQuery({
    queryKey: ["settings", "site"],
    queryFn: async () => {
      try {
        return await fetchSiteSettings();
      } catch {
        return {} as SiteSettings;
      }
    },
    staleTime: 60_000,
  });

  return resolveSiteContact(data);
}
