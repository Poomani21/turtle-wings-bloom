import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/Sections";
import { getPost, posts as staticPosts, formatDate, type Post } from "@/lib/blog-data";
import { mergePostsBySlug, usePublishedFirebasePosts } from "@/lib/blog-firebase";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    // Static posts render immediately (also on a hard refresh / direct URL).
    // Unknown slugs are resolved against published Firebase posts in the
    // component, because the Firebase client is browser-only.
    const post = getPost(params.slug) ?? null;
    return { post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.post) {
      return {
        meta: [
          { title: "Article | Turtle Wings Blog" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const post = loaderData.post;
    const pageTitle = `${post.title} | Turtle Wings Blog`;
    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { "@type": "Person", name: post.author },
            publisher: { "@type": "Organization", name: "Turtle Wings" },
          }),
        },
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { post: staticPost } = Route.useLoaderData();
  const { slug } = Route.useParams();

  const { posts: firebasePosts, isLoading } = usePublishedFirebasePosts();

  const all = mergePostsBySlug(staticPosts, firebasePosts);
  // An admin post with the same slug is the newer edit of that article, so it
  // takes precedence; otherwise the static article is used.
  const firebasePost = firebasePosts.find((p) => p.slug === slug);
  const post = firebasePost ?? staticPost;

  if (post) return <BlogPostView post={post} related={all} />;
  if (isLoading) {
    return (
      <div className="container-site py-24 text-sm text-muted-foreground">Loading article…</div>
    );
  }
  throw notFound();
}

function BlogPostView({ post, related: pool }: { post: Post; related: Post[] }) {
  const related = pool.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article>
        <header className="relative overflow-hidden bg-forest-deep">
          <div
            className="dot-grid pointer-events-none absolute inset-0 opacity-20"
            aria-hidden="true"
          />
          <div className="container-site relative max-w-3xl py-12 lg:py-20">
            <Reveal>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                All articles
              </Link>
              {post.category ? (
                <p className="mt-5">
                  <span className="inline-flex max-w-full rounded-full bg-secondary px-3 py-1 text-xs font-extrabold break-words text-secondary-foreground">
                    {post.category}
                  </span>
                </p>
              ) : null}
              <h1 className="mt-4 text-2xl leading-tight break-words text-cream sm:text-3xl lg:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cream/80">
                {post.date ? (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </span>
                ) : null}
                {post.author ? (
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <User aria-hidden="true" className="size-4 shrink-0" />
                    <span className="break-words">{post.author}</span>
                  </span>
                ) : null}
              </p>
            </Reveal>
          </div>
          <div className="h-3 w-full bg-leaf" aria-hidden="true" />
        </header>

        <div className="container-site max-w-3xl py-10 sm:py-12">
          {post.image ? (
            <Reveal
              variant="scale"
              className="overflow-hidden rounded-3xl border border-border shadow-card"
            >
              <img
                src={post.image}
                alt={post.imageAlt}
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover"
              />
            </Reveal>
          ) : null}

          <div className="mt-8 space-y-8 sm:mt-10">
            {post.body.map((block, i) => (
              <Reveal key={block.heading ?? i} delay={i * 60} className="min-w-0">
                {block.heading ? (
                  <h2 className="text-xl break-words sm:text-2xl">{block.heading}</h2>
                ) : null}
                <div className="prose-body mt-3 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="section-pad bg-accent/40" aria-labelledby="related">
          <div className="container-site">
            <h2 id="related" className="text-2xl sm:text-3xl">
              Related articles
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
              {related.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.slug}
                  delay={i * 80}
                  className="card-soft min-w-0 overflow-hidden"
                >
                  <Link
                    to="/blog/$slug"
                    params={{ slug: item.slug }}
                    className="group block min-w-0"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        width={1200}
                        height={800}
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                    <span className="block p-5">
                      <span className="block font-display text-lg font-bold break-words text-forest-deep">
                        {item.title}
                      </span>
                      <span className="mt-2 block text-sm break-words text-muted-foreground">
                        {item.excerpt}
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
