import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";
import mascot from "@/assets/turtle-mascot.png";
import whatsappQr from "@/assets/whatsapp-qr.png";
import { navLinks, site } from "@/lib/site-content";
import { useSiteContact } from "@/lib/site-contact";

export function Footer() {
  const contact = useSiteContact();

  return (
    <footer className="mt-4 bg-forest-deep text-cream">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex min-w-0 items-center gap-3">
            <img src={mascot} alt="" width={912} height={912} loading="lazy" className="h-12 w-12 shrink-0" />
            <span className="min-w-0">
              <span className="block font-display text-xl font-extrabold text-cream">{site.name}</span>
              <span className="hand-label block text-base text-secondary">{site.tagline}</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/80">
            A special education centre supporting children with Autism Spectrum Disorder through a
            structured Evening Group Program in Electronic City, Bengaluru.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h2 className="font-display text-lg text-secondary">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks
            .filter((link) => link.label !== "Members")
            .map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-block text-cream/85 transition-colors hover:text-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg text-secondary">Program</h2>
          <ul className="mt-4 space-y-3 text-sm text-cream/85">
            <li>Evening Learning Circle</li>
            {/* <li>Age Group: 3–10 years</li> */}
            <li>Age Group: {contact.ageGroup}</li>
            <li>Small group · Limited seats</li>
            <li className="flex gap-2">
              <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
              <span>
                {contact.timings}
                <br />
                {contact.closed}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg text-secondary">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-cream/85">
            <li className="flex gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
              <span>{contact.address.join(" ")}</span>
            </li>
            <li className="flex gap-2">
              <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
              <a className="hover:text-secondary" href={contact.phoneHref}>
                {contact.phone}
              </a>
            </li>
            {/* <li className="flex gap-2">
              <MessageCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
              <a
                className="hover:text-secondary"
                href={contact.whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp {contact.whatsapp}
              </a>
            </li> */}
            <li className="flex min-w-0 gap-2">
              <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
              <a className="break-all hover:text-secondary" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
          </ul>
        </div>

        {/* QR Codes Column */}
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg text-secondary">Scan QR</h2>
          <div className="flex flex-col gap-3">

            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl  p-2 backdrop-blur-sm transition-opacity hover:opacity-90"
            >
              <img
                src={whatsappQr}
                alt="WhatsApp QR Code"
                className="size-24 shrink-0 rounded-lg bg-white p-2 object-contain image-rendering-pixelated"
              />
              <span className="text-xs font-semibold text-cream/90">Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>{contact.website}</p>
        </div>
      </div>
    </footer>
  );
}
