import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, CtaBand } from "@/components/site/Sections";
import { faqs } from "@/lib/site-content";

const title = "Frequently Asked Questions | Turtle Wings, Electronic City Bengaluru";
const description =
  "Answers about the Turtle Wings Evening Group Program: timings, batch size, age group, admission process, assessments and what children learn.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <>
      <PageHero
        eyebrow="Parent Information"
        title="Frequently Asked Questions"
        intro="Everything parents most often ask us about the Evening Group Program, admissions and daily routine."
      />

      <section className="section-pad">
        <div className="container-site max-w-3xl">
          <Reveal>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${i}`}
                  className="mb-3 overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-card data-[state=open]:border-secondary"
                >
                  <AccordionTrigger className="py-4 text-left font-display text-base font-bold text-forest-deep hover:no-underline sm:text-lg">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
