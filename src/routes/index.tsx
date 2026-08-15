import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/lib/cms";
import {
  Award,
  Blocks,
  CalendarCheck,
  Check,
  Clock,
  Heart,
  MapPin,
  Puzzle,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import type { ComponentType } from "react";
import mascot from "@/assets/turtle-mascot.png";
import aboutImg from "@/assets/about-story-time.jpg";
import programImg from "@/assets/program-sensory.jpg";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/Sections";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  learningDomains,
  programFacts as staticProgramFacts,
  programObjectives,
  site,
  whoWeAre,
  whyChooseUs,
} from "@/lib/site-content";

const title = "Turtle Wings — Special Education Centre for Children with Autism, Bengaluru";
const description =
  "Turtle Wings is a special education centre in Electronic City, Bengaluru offering a structured Evening Group Program (5–7 PM) for children with Autism Spectrum Disorder aged 3–10 years.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const icons: Record<string, ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  puzzle: Puzzle,
  users: Users,
  blocks: Blocks,
  heart: Heart,
  sparkles: Sparkles,
  award: Award,
  calendar: CalendarCheck,
};

function Home() {
  const settings = useQuery({ queryKey: ["settings", "site"], queryFn: fetchSiteSettings });
  const s = settings.data;

  const programFacts = staticProgramFacts.map((fact) => {
    if (!s) return fact;

    if (fact.label === "Age Group" && s.ageGroup) {
      return { ...fact, value: s.ageGroup };
    }
    if (fact.label === "Timing" && s.startTime && s.endTime) {
      return { ...fact, value: `${s.startTime} – ${s.endTime}` };
    }
    if (fact.label === "Seats" && s.maxChildren) {
      return { ...fact, value: `${s.maxChildren} children` };
    }
    return fact;
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest-deep">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-leaf/15 blur-2xl"
          aria-hidden="true"
        />
        <div className="container-site relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <Reveal variant="fade">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-extrabold text-secondary-foreground">
                <Sparkles aria-hidden="true" className="size-4" />
                Admission Open
              </span>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-5 text-3xl leading-[1.15] text-cream sm:text-4xl lg:text-[3.25rem]">
                {site.headline}
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="hand-label mt-4 text-2xl text-secondary sm:text-3xl">
                {site.subheadline}
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
                A special education centre supporting children with Autism Spectrum Disorder through
                movement, play, communication, sensory experiences and foundational academics.
              </p>
            </Reveal>
            <Reveal delay={340} className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-secondary px-6 font-extrabold text-secondary-foreground shadow-sun transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Book a Parent Consultation
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                to="/program"
                className="inline-flex min-h-12 items-center rounded-full border-2 border-cream/40 px-6 font-bold text-cream transition-colors hover:border-secondary hover:text-secondary"
              >
                Explore the Program
              </Link>
            </Reveal>
            <Reveal delay={420} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/85">
              <span className="inline-flex items-center gap-2">
                <Clock aria-hidden="true" className="size-4 text-secondary" />
                {site.program}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4 text-secondary" />
                {site.locationShort}
              </span>
            </Reveal>
          </div>

          <Reveal variant="scale" delay={120} className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="absolute inset-6 rounded-full bg-leaf/20 blur-xl" aria-hidden="true" />
            <img
              src={mascot}
              alt="Turtle Wings mascot: a smiling turtle with colourful wings waving hello"
              width={912}
              height={912}
              className="float-slow relative mx-auto w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
            />
          </Reveal>
        </div>
        <div className="h-3 w-full bg-leaf" aria-hidden="true" />
      </section>

      {/* WHO WE ARE */}
      <section className="section-pad" aria-labelledby="who-we-are">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <Reveal variant="left" className="order-2 lg:order-1">
            <p className="hand-label">Who We Are</p>
            <h2 id="who-we-are" className="mt-2 text-3xl sm:text-4xl">
              A calm, structured place to learn and grow
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {whoWeAre.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Meet the Founder
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Reveal>

          <Reveal variant="right" className="order-1 overflow-hidden rounded-3xl border border-border shadow-card lg:order-2">
            <img
              src={aboutImg}
              alt="Special educator reading a storybook to a small group of young children in a bright learning room"
              width={1200}
              height={912}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </Reveal>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section-pad bg-accent/40" aria-labelledby="why-choose">
        <div className="container-site">
          <SectionHeading
            eyebrow="Our approach"
            title={<span id="why-choose">Why Choose Turtle Wings</span>}
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((item, i) => {
              const Icon = icons[item.icon] ?? Sparkles;
              return (
                <Reveal as="li" key={item.title} delay={i * 70} className="card-soft p-6">
                  <span className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-forest-deep">
                    <Icon aria-hidden={true} className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* SIGNATURE PROGRAM */}
      <section className="section-pad" aria-labelledby="signature-program">
        <div className="container-site grid items-start gap-10 lg:grid-cols-2">
          <Reveal variant="left" className="overflow-hidden rounded-3xl border border-border shadow-card">
            <img
              src={programImg}
              alt="Children taking part in sensory play, balance and hands-on learning activities with an educator"
              width={1200}
              height={912}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
          <div>
            <Reveal>
              <p className="hand-label">Our Signature Program</p>
              <h2 id="signature-program" className="mt-2 text-3xl sm:text-4xl">
                Evening Learning Circle
              </h2>
            </Reveal>
            <Reveal delay={80} className="mt-6 grid grid-cols-2 gap-3">
              {programFacts.map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    {fact.label}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-forest-deep">{fact.value}</p>
                </div>
              ))}
            </Reveal>
            <Reveal delay={160}>
              <h3 className="mt-8 text-xl">Program Objectives</h3>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {programObjectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-2 text-sm sm:text-base">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-leaf" />
                    {objective}
                  </li>
                ))}
              </ul>
              <Link
                to="/program"
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                See the 9 Learning Domains
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* LEARNING DOMAINS */}
      <section className="section-pad bg-forest-deep" aria-labelledby="domains">
        <div className="container-site">
          <SectionHeading
            tone="dark"
            eyebrow="Every session, every child"
            title={<span id="domains">The 9 Learning Domains at Turtle Wings</span>}
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {learningDomains.map((domain, i) => (
              <Reveal
                as="li"
                key={domain.title}
                delay={i * 60}
                className="group rounded-2xl border border-cream/15 bg-cream/[0.06] p-6 transition-colors hover:border-secondary/70 hover:bg-cream/10"
              >
                <span className="font-display text-sm font-extrabold text-secondary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg text-cream">{domain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/80">{domain.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}