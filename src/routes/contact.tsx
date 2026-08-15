import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Globe } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/Sections";
import { InquiryForm } from "@/components/site/InquiryForm";
import { site } from "@/lib/site-content";
import { useSiteContact } from "@/lib/site-contact";
import mapQr from "@/assets/turtlewings-map-qr-code.png";

const title = "Contact & Enquiry — Book a Parent Consultation | Turtle Wings";
const description =
  "Enquire about the Turtle Wings Evening Group Program in Electronic City Phase 2, Bengaluru. Book a complimentary Parent Consultation by form, phone, WhatsApp or email.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const contact = useSiteContact();

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Book a Parent Consultation"
        intro="Share a few details about your child and we will get back to you to schedule your complimentary Parent Consultation."
      />

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.25fr]">
          <Reveal variant="left" className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl">Centre details</h2>
              <ul className="mt-5 space-y-4 text-sm sm:text-base">
                <li className="flex gap-3">
                  <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-leaf" />
                  <span className="min-w-0">
                    {contact.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </li>
                <li className="flex gap-3">
                  <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-leaf" />
                  <a className="font-bold hover:underline" href={contact.phoneHref}>
                    {contact.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <MessageCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-leaf" />
                  <a
                    className="font-bold hover:underline"
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp {contact.whatsapp}
                  </a>
                </li>
                <li className="flex min-w-0 gap-3">
                  <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-leaf" />
                  <a
                    className="font-bold break-all hover:underline"
                    href={`mailto:${contact.email}`}
                  >
                    {contact.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Globe aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-leaf" />
                  <span>{contact.website}</span>
                </li>
                <li className="flex gap-3">
                  <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-leaf" />
                  <span>
                    {contact.timings}
                    <span className="mt-1 block text-muted-foreground">{contact.closed}</span>
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-accent/50 p-5 text-sm leading-relaxed text-accent-foreground">
              <p>
                The Parent Consultation is complimentary. The child's 45-minute Admission Assessment
                is a chargeable session conducted by an RCI Certified Special Educator.
              </p>
              
            </div>
            
           {/* Centered QR Code Card */}
<div className="flex flex-col">
  <p className="mb-2 font-display text-sm font-bold text-foreground">Scan for Location</p>
  <a
    href={mapQr}
    target="_blank"
    rel="noreferrer"
    className="inline-block transition-transform hover:scale-105"
  >
    <img
      src={mapQr}
      alt="Location Map QR Code"
      className="size-28 rounded-xl border border-border bg-white p-2 object-contain shadow-sm"
    />
  </a>
  <span className="mt-2 text-[11px] text-muted-foreground">Click or scan to open in Maps</span>
</div>

          </Reveal>

          <Reveal variant="right">
            <h2 className="sr-only">Enquiry form</h2>
            <InquiryForm />
          </Reveal>
        </div>
      </section>

      {contact.mapEmbedUrl ? (
        <section className="section-pad pt-0" aria-labelledby="find-us">
          <div className="container-site">
            <h2 id="find-us" className="text-2xl sm:text-3xl">
              Find us on the map
            </h2>
            <p className="mt-2 text-sm break-words text-muted-foreground">
              {contact.address.map((line) => line.replace(/,\s*$/, "")).join(", ")}
            </p>
            <div className="mt-6 w-full max-w-full overflow-hidden rounded-2xl border border-border shadow-card">
              <iframe
                src={contact.mapEmbedUrl}
                title="Turtle Wings location map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="block h-[320px] w-full border-0 sm:h-[380px] lg:h-[440px]"
              />
            </div>
            <a
              href={site.mapLinkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-input px-4 text-sm font-bold"
            >
              <MapPin aria-hidden="true" className="size-4" /> Open in Google Maps
            </a>
          </div>
        </section>
      ) : null}
    </>
  );
}
