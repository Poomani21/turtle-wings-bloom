import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PlayCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, CtaBand } from "@/components/site/Sections";
import { fetchPublishedVideos } from "@/lib/cms";

const title = "Videos — Activities & Parent Guidance | Turtle Wings";
const description =
  "Watch short videos from the Turtle Wings Evening Group Program in Electronic City Phase 2, Bengaluru — activities, centre tours and guidance for parents.";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/videos" },
    ],
    links: [{ rel: "canonical", href: "/videos" }],
  }),
  component: Videos,
});

function embedUrl(url: string): string | null {
  const youtube = url.match(/(?:youtu\.be\/|\/shorts\/|\/embed\/|[?&]v=)([\w-]{6,})/);
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
  return null;
}

function Videos() {
  const videos = useQuery({ queryKey: ["videos", "published"], queryFn: fetchPublishedVideos });

  return (
    <>
      <PageHero
        eyebrow="Video gallery"
        title="A look inside our sessions"
        intro="Short clips of activities, learning moments and guidance for parents."
      />

      <section className="section-pad">
        <div className="container-site">
          {videos.isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Loading videos…
            </p>
          ) : videos.isError ? (
            <p role="alert" className="text-sm text-muted-foreground">
              Videos are unavailable right now. Please check back soon.
            </p>
          ) : (videos.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              New videos are on the way — please check back soon.
            </p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {(videos.data ?? []).map((video, i) => {
                const embed = embedUrl(video.videoUrl);
                return (
                  <Reveal as="li" key={video.id} delay={i * 80} className="card-soft overflow-hidden">
                    <div className="aspect-video w-full bg-forest-deep/10">
                      {embed ? (
                        <iframe
                          src={embed}
                          title={video.title}
                          loading="lazy"
                          allowFullScreen
                          className="size-full"
                        />
                      ) : video.videoUrl ? (
                        <video
                          src={video.videoUrl}
                          poster={video.thumbnailUrl || undefined}
                          controls
                          preload="none"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <PlayCircle aria-hidden="true" className="size-10 text-forest-deep/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {video.category ? (
                        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
                          {video.category}
                        </span>
                      ) : null}
                      <h2 className="mt-3 font-display text-lg font-bold text-forest-deep">
                        {video.title}
                      </h2>
                      {video.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {video.description}
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
