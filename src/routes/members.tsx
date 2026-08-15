import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Loader2, Users } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, CtaBand } from "@/components/site/Sections";
import { fetchPublicMembers } from "@/lib/cms";

const title = "Our Members — Children & Families | Turtle Wings";
const description =
  "Meet the children taking part in the Turtle Wings Evening Group Program in Electronic City Phase 2, Bengaluru. Only families who have given permission are shown.";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/members" },
    ],
    links: [{ rel: "canonical", href: "/members" }],
  }),
  component: Members,
});

function formatJoined(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function Members() {
  const members = useQuery({ queryKey: ["members", "public"], queryFn: fetchPublicMembers });
  const rows = members.data ?? [];

  return (
    <>
      <PageHero
        eyebrow="Our members"
        title="The children we learn with"
        intro="A small look at the families who are part of our evening group program. Shared only with parent permission."
      />

      <section className="section-pad">
        <div className="container-site">
          {members.isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Loading members…
            </p>
          ) : members.isError ? (
            <p role="alert" className="text-sm text-muted-foreground">
              Member profiles are unavailable right now. Please check back soon.
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No member profiles have been shared yet — please check back soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rows.map((member, i) => {
                const joined = formatJoined(member.joinedDate);
                return (
                  <Reveal
                    as="li"
                    key={member.id}
                    delay={i * 70}
                    className="card-soft overflow-hidden"
                  >
                    <div className="aspect-square w-full bg-accent/50">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <Users aria-hidden="true" className="size-10 text-forest-deep/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="font-display text-lg font-bold break-words text-forest-deep">
                        {member.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[
                          Number.isFinite(member.age) && member.age ? `${member.age} years` : null,
                          member.program || null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {joined ? (
                        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
                          Joined {joined}
                        </p>
                      ) : null}
                      {member.notes ? (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {member.notes}
                        </p>
                      ) : null}
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
