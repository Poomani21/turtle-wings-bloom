import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/Sections";
import { getPost, posts, formatDate, type Post } from "@/lib/blog-data";
import { fetchPublishedFirebasePosts } from "@/lib/blog-firebase";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    // Static posts stay authoritative; unknown slugs fall back to published
    // Firebase posts in the component (the Firebase client is browser-only).
    const post = getPost(params.slug) ?? null;
    return { post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.post) {
      return {
        meta: [{ title: "Article unavailable | Turtle Wings" }, { name: "robots", content: "noindex" }],
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
  const { post: demoPost } = Route.useLoaderData();
  const { slug } = Route.useParams();
  // Firestore always wins: a published Firebase post with this slug replaces
  // the static demo entry of the same slug.
  const { data: firebasePosts, isPending } = useQuery({
    queryKey: ["published-firebase-blogs"],
    queryFn: fetchPublishedFirebasePosts,
    staleTime: 30_000,
    retry: 1,
  });

  const firebasePost = firebasePosts?.find((p) => p.slug === slug);
  if (firebasePost) return <BlogPostView post={firebasePost} related={firebasePosts ?? []} />;
  if (demoPost) return <BlogPostView post={demoPost} related={posts} />;
  if (isPending) {
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
          <div className="container-site relative max-w-3xl py-14 lg:py-20">
            <Reveal>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                All articles
              </Link>
              <p className="mt-5">
                <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-extrabold text-secondary-foreground">
                  {post.category}
                </span>
              </p>
              <h1 className="mt-4 text-3xl leading-tight text-cream sm:text-4xl">{post.title}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cream/80">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </span>
                <span className="inline-flex items-center gap-2">
                  <User aria-hidden="true" className="size-4" />
                  {post.author}
                </span>
              </p>
            </Reveal>
          </div>
          <div className="h-3 w-full bg-leaf" aria-hidden="true" />
        </header>

        <div className="container-site max-w-3xl py-12">
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

          <div className="mt-10 space-y-8">
            {post.body.map((block, i) => (
              <Reveal key={block.heading ?? i} delay={i * 60}>
                {block.heading ? <h2 className="text-2xl">{block.heading}</h2> : null}
                <div className="mt-3 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </article>

      <section className="section-pad bg-accent/40" aria-labelledby="related">
        <div className="container-site">
          <h2 id="related" className="text-2xl sm:text-3xl">
            Related articles
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {related.map((item, i) => (
              <Reveal as="li" key={item.slug} delay={i * 80} className="card-soft overflow-hidden">
                <Link to="/blog/$slug" params={{ slug: item.slug }} className="group block">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="block p-5">
                    <span className="block font-display text-lg font-bold text-forest-deep">
                      {item.title}
                    </span>
                    <span className="mt-2 block text-sm text-muted-foreground">{item.excerpt}</span>
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
