import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { site } from "@/lib/site-content";
import { useSiteContact } from "@/lib/site-contact";

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="relative overflow-hidden bg-forest-deep">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
      <div className="container-site relative py-14 lg:py-20">
        <Reveal className="max-w-3xl">
          <p className="hand-label text-secondary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl leading-tight text-cream sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-cream/70">
            {site.program} · {site.locationShort}
          </p>
        </Reveal>
      </div>
      <div className="h-3 w-full bg-leaf" aria-hidden="true" />
    </section>
  );
}

export function CtaBand() {
  const contact = useSiteContact();

  return (
    <section className="section-pad" aria-labelledby="cta">
      <div className="container-site">
        <Reveal
          variant="scale"
          className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-center shadow-card sm:px-12"
        >
          <h2 id="cta" className="text-3xl sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-secondary-foreground/85 sm:text-lg">
            Contact us today to schedule your complimentary Parent Consultation and take the first
            step towards your child's learning journey.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center rounded-full bg-forest-deep px-6 font-extrabold text-cream transition-transform hover:-translate-y-0.5"
            >
              Book a Parent Consultation
            </Link>
            <a
              href={contact.phoneHref}
              className="inline-flex min-h-12 items-center rounded-full border-2 border-forest-deep/40 px-6 font-bold text-forest-deep transition-colors hover:border-forest-deep"
            >
              Call {contact.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
