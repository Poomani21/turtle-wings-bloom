import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Loader2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, CtaBand } from "@/components/site/Sections";
import { posts as demoPosts, formatDate } from "@/lib/blog-data";
import { fetchPublishedFirebasePosts, resolvePosts } from "@/lib/blog-firebase";


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
  // Firestore is the source of truth for the public blog. No initialData: an
  // empty array must never be cached as a "fresh" result, otherwise a reload
  // can leave the page stuck on demo content.
  const {
    data: firebasePosts,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["published-firebase-blogs"],
    queryFn: fetchPublishedFirebasePosts,
    staleTime: 30_000,
    retry: 1,
  });

  const allPosts = resolvePosts(firebasePosts ?? [], demoPosts);


  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes for parents and families"
        intro="Short, practical articles on routines, communication, play and early learning."
      />

      <section className="section-pad">
        <div className="container-site">
          {isPending ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Loading articles…
            </p>
          ) : isError ? (
            <p role="alert" className="text-sm text-destructive">
              We couldn't load the articles right now. {(error as Error)?.message}
            </p>
          ) : allPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No articles have been published yet. Please check back soon.
            </p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {allPosts.map((post, i) => (
                <Reveal as="li" key={post.slug} delay={i * 80} className="card-soft overflow-hidden">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group block h-full focus-visible:outline-none"
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
                    <span className="block p-6">
                      {post.category ? (
                        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
                          {post.category}
                        </span>
                      ) : null}
                      {post.date ? (
                        <span className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays aria-hidden="true" className="size-3.5" />
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                        </span>
                      ) : null}
                      <span className="mt-2 block font-display text-xl font-bold text-forest-deep">
                        {post.title}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </span>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-forest-deep">
                        Read more
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>


      <CtaBand />
    </>
  );
}
