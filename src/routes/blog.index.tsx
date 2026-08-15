import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, CtaBand } from "@/components/site/Sections";
import { posts as staticPosts, formatDate } from "@/lib/blog-data";
import { mergePostsBySlug, usePublishedFirebasePosts } from "@/lib/blog-firebase";

const title = "Blog — Autism Support, Parenting & Early Learning | Turtle Wings";
const description =
  "Practical notes on routines, communication, play and early learning for children with Autism Spectrum Disorder, written by the team at Turtle Wings, Bengaluru.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  // The static articles are always rendered (also during SSR and on a hard
  // refresh). Published Firebase posts are merged in as soon as they arrive; if
  // Firestore is unavailable the query resolves to an empty list instead of
  // failing, so the page never blanks out.
  const { posts: firebasePosts } = usePublishedFirebasePosts();

  const allPosts = mergePostsBySlug(staticPosts, firebasePosts);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes for parents and families"
        intro="Short, practical articles on routines, communication, play and early learning."
      />

      <section className="section-pad">
        <div className="container-site">
          <ul className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {allPosts.map((post, i) => (
              <Reveal
                as="li"
                key={post.slug}
                delay={i * 80}
                className="card-soft flex min-w-0 flex-col overflow-hidden"
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex h-full min-w-0 flex-col focus-visible:outline-none"
                >
                  {post.image ? (
                    <span className="block overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        width={1200}
                        height={800}
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                    {post.category ? (
                      <span className="inline-flex max-w-full self-start rounded-full bg-accent px-3 py-1 text-xs font-extrabold break-words text-accent-foreground">
                        {post.category}
                      </span>
                    ) : null}
                    {post.date ? (
                      <span className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </span>
                    ) : null}
                    <span className="mt-2 block font-display text-lg font-bold break-words text-forest-deep sm:text-xl">
                      {post.title}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed break-words text-muted-foreground">
                      {post.excerpt}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-2 self-start pt-4 text-sm font-extrabold text-forest-deep">
                      Read more
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
