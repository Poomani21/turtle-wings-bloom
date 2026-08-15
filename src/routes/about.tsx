import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import aboutImg from "@/assets/about-story-time.jpg";
import founderImg from "@/assets/founder-neha.jpg"; // Adjust path to match your saved founder image filename
import { Reveal } from "@/components/site/Reveal";
import { founder, whoWeAre, site } from "@/lib/site-content";
import { CtaBand } from "@/components/site/Sections";

const title = "About Turtle Wings — Meet the Founder | Special Education, Bengaluru";
const description =
  "Turtle Wings was founded by Neha Choudhary, an RCI Certified Special Educator (Autism) and parent of a child with autism, to create structured learning for children with Autism Spectrum Disorder.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="Who We Are"
        title="A special education centre built around the child"
        intro="Turtle Wings is a special education centre supporting children with Autism Spectrum Disorder in Electronic City, Bengaluru."
      />

      <section className="section-pad" aria-labelledby="our-story">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <Reveal variant="left">
            <h2 id="our-story" className="text-3xl sm:text-4xl">
              Our approach
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {whoWeAre.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
          <Reveal
            variant="right"
            className="overflow-hidden rounded-3xl border border-border shadow-card"
          >
            <img
              src={aboutImg}
              alt="Educator reading a storybook to a small group of children seated on a rug"
              width={1200}
              height={912}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* <section className="section-pad bg-accent/40" aria-labelledby="founder">
        <div className="container-site max-w-4xl">
          <Reveal>
            <p className="hand-label">Meet the Founder</p>
            <h2 id="founder" className="mt-2 text-3xl sm:text-4xl">
              {founder.name}
            </h2>
            <p className="mt-2 font-bold text-muted-foreground">{founder.role}</p>
            <a
              href={`mailto:${founder.email}`}
              className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-forest-deep underline decoration-secondary decoration-2 underline-offset-4"
            >
              <Mail aria-hidden="true" className="size-4" />
              {founder.email}
            </a>
          </Reveal>
          <div className="mt-8 space-y-5">
            {founder.paragraphs.map((paragraph, i) => (
              <Reveal
                key={paragraph.slice(0, 24)}
                delay={i * 70}
                className="rounded-2xl border-l-4 border-secondary bg-card p-5 text-base leading-relaxed text-muted-foreground shadow-card sm:text-lg"
              >
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="mt-10">
            <Link
              to="/program"
              className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Explore the Evening Learning Circle
            </Link>
          </Reveal>
        </div>
      </section> */}

      <section className="section-pad bg-accent/40" aria-labelledby="founder">
  <div className="container-site max-w-5xl">
    <div className="grid items-start gap-8 lg:grid-cols-12">
      {/* Founder Image Column */}
      <Reveal variant="left" className="lg:col-span-5">
        <div className="overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-card">
          <img
            src={founderImg}
            alt={`Portrait of ${founder.name}`}
            width={600}
            height={600}
            loading="lazy"
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </div>
      </Reveal>

      {/* Founder Details Column */}
      <div className="lg:col-span-7">
        <Reveal>
          <p className="hand-label">Meet the Founder</p>
          <h2 id="founder" className="mt-2 text-3xl sm:text-4xl">
            {founder.name}
          </h2>
          <p className="mt-2 font-bold text-muted-foreground">{founder.role}</p>
          <a
            href={`mailto:${founder.email}`}
            className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-forest-deep underline decoration-secondary decoration-2 underline-offset-4"
          >
            <Mail aria-hidden="true" className="size-4" />
            {founder.email}
          </a>
        </Reveal>

        <div className="mt-6 space-y-4">
          {founder.paragraphs.map((paragraph, i) => (
            <Reveal
              key={paragraph.slice(0, 24)}
              delay={i * 70}
              className="rounded-2xl border-l-4 border-secondary bg-card p-5 text-base leading-relaxed text-muted-foreground shadow-card sm:text-lg"
            >
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-8">
          <Link
            to="/program"
            className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Explore the Evening Learning Circle
          </Link>
        </Reveal>
      </div>
    </div>
  </div>
</section>

      <CtaBand />
    </>
  );
}

export function PageHero({
  eyebrow,
  title: heading,
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
          <h1 className="mt-2 text-3xl leading-tight text-cream sm:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg">{intro}</p>
          <p className="mt-4 text-sm text-cream/70">
            {site.program} · {site.locationShort}
          </p>
        </Reveal>
      </div>
      <div className="h-3 w-full bg-leaf" aria-hidden="true" />
    </section>
  );
}
