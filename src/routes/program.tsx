import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import programImg from "@/assets/program-sensory.jpg";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { learningDomains, programFacts, programObjectives } from "@/lib/site-content";
import { fetchActivePrograms, fetchSiteSettings } from "@/lib/cms";
import { PageHero } from "./about";
import { CtaBand } from "@/components/site/Sections";

const title = "Evening Learning Circle — Our Signature Program | Turtle Wings";
const description =
  "The Evening Learning Circle is a structured small-group program for children with Autism Spectrum Disorder aged 3–10 years, covering nine learning domains from 5:00 PM to 7:00 PM.";

export const Route = createFileRoute("/program")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/program" },
    ],
    links: [{ rel: "canonical", href: "/program" }],
  }),
  component: Program,
});

function Program() {
  const programs = useQuery({ queryKey: ["programs", "active"], queryFn: fetchActivePrograms });
  const settings = useQuery({ queryKey: ["settings", "site"], queryFn: fetchSiteSettings });

  const s = settings.data ?? {};
  const list = programs.data ?? [];
  const first = list[0];

  // Schedule facts come from Site settings / the first active program when
  // available; the static copy stays as the fallback.
  const ageGroup = s.ageGroup ?? first?.ageGroup;
  const timing =
    s.startTime && s.endTime
      ? `${s.startTime} – ${s.endTime}`
      : first?.startTime && first.endTime
        ? `${first.startTime} – ${first.endTime}`
        : undefined;
  const seats = s.maxChildren ?? first?.maxChildren;
  const facts = programFacts.map((fact) =>
    fact.label === "Age Group" && ageGroup
      ? { ...fact, value: ageGroup }
      : fact.label === "Timing" && timing
        ? { ...fact, value: timing }
        : fact.label === "Seats" && seats
          ? { ...fact, value: `${seats} children` }
          : fact,
  );

  return (
    <>
      <PageHero
        eyebrow="Our Signature Program"
        title="Evening Learning Circle"
        intro="A structured after-school group program that combines movement, play, communication, sensory experiences and foundational academics."
      />

      <section className="section-pad" aria-labelledby="at-a-glance">
        <div className="container-site grid items-start gap-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 id="at-a-glance" className="text-3xl sm:text-4xl">
                At a glance
              </h2>
            </Reveal>
            <Reveal delay={80} className="mt-6 grid grid-cols-2 gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    {fact.label}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-forest-deep">{fact.value}</p>
                </div>
              ))}
            </Reveal>
            <Reveal delay={140}>
              <h3 className="mt-10 text-xl">Program Objectives</h3>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {programObjectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-2 text-sm sm:text-base">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-leaf" />
                    {objective}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal
            variant="right"
            className="overflow-hidden rounded-3xl border border-border shadow-card"
          >
            <img
              src={programImg}
              alt="Children taking part in sensory play, balance and hands-on activities with an educator"
              width={1200}
              height={912}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      {list.length > 0 ? (
        <section className="section-pad" aria-labelledby="schedule">
          <div className="container-site">
            <SectionHeading
              eyebrow="Current schedule"
              title={<span id="schedule">Programs running now</span>}
              intro="Group timings and age bands as scheduled at the centre."
            />
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((program, i) => (
                <Reveal as="li" key={program.id} delay={i * 60} className="card-soft overflow-hidden">
                  {program.image ? (
                    <img
                      src={program.image}
                      alt={program.title}
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-6">
                    <h3 className="text-lg">{program.title}</h3>
                    {program.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {program.description}
                      </p>
                    ) : null}
                    <dl className="mt-4 grid gap-1.5 text-sm">
                      {program.ageGroup ? (
                        <div className="flex gap-2">
                          <dt className="font-bold">Age group:</dt>
                          <dd className="text-muted-foreground">{program.ageGroup}</dd>
                        </div>
                      ) : null}
                      {program.days ? (
                        <div className="flex gap-2">
                          <dt className="font-bold">Days:</dt>
                          <dd className="text-muted-foreground">{program.days}</dd>
                        </div>
                      ) : null}
                      {program.startTime && program.endTime ? (
                        <div className="flex gap-2">
                          <dt className="font-bold">Timing:</dt>
                          <dd className="text-muted-foreground">
                            {program.startTime} – {program.endTime}
                          </dd>
                        </div>
                      ) : null}
                      {program.maxChildren ? (
                        <div className="flex gap-2">
                          <dt className="font-bold">Group size:</dt>
                          <dd className="text-muted-foreground">
                            Up to {program.maxChildren} children
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    {program.activities?.length ? (
                      <ul className="mt-4 grid gap-2">
                        {program.activities.map((activity) => (
                          <li key={activity} className="flex items-start gap-2 text-sm">
                            <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-leaf" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section-pad bg-accent/40" aria-labelledby="domains">
        <div className="container-site">
          <SectionHeading
            eyebrow="What we cover"
            title={<span id="domains">The 9 Learning Domains</span>}
            intro="Every session is carefully planned to support not just academic learning, but the overall development of the child."
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learningDomains.map((domain, i) => (
              <Reveal as="li" key={domain.title} delay={i * 60} className="card-soft p-6">
                <span className="grid size-11 place-items-center rounded-full bg-secondary font-display text-lg font-extrabold text-secondary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg">{domain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{domain.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad" aria-labelledby="admission">
        <div className="container-site max-w-3xl">
          <SectionHeading
            align="left"
            eyebrow="Joining us"
            title={<span id="admission">The admission process</span>}
          />
          <ol className="mt-8 space-y-4">
            {[
              {
                step: "Parent Consultation",
                body: "The admission process begins with a complimentary Parent Consultation.",
              },
              {
                step: "Admission Assessment",
                body: "A 45-minute Admission Assessment conducted by an RCI Certified Special Educator determines whether the Evening Group Program is the right fit for your child. This session is chargeable.",
              },
              {
                step: "Observation & guidance",
                body: "We observe attention, sitting tolerance, following instructions, communication, behaviour, learning readiness, and comfort in a small group — then discuss the most appropriate next steps with you.",
              },
            ].map((item, i) => (
              <Reveal
                as="li"
                key={item.step}
                delay={i * 80}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display font-extrabold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-bold text-forest-deep">
                    {item.step}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </span>
                </span>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={120} className="mt-8 rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
            <p>
              Please note: Turtle Wings is a special education centre focused on structured learning
              and developmental support. We do not currently provide Speech Therapy, Occupational
              Therapy, or ABA Therapy.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
