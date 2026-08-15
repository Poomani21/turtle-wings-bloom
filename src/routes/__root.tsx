import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { site } from "@/lib/site-content";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-extrabold text-forest-deep">404</h1>
        <h2 className="mt-4 text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-5 font-extrabold text-secondary-foreground shadow-sun"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-5 font-extrabold text-secondary-foreground shadow-sun"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-input px-5 font-bold hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "google-site-verification",
        content: "L-Z3AQS1Fh7OwjKBFafS7N6akfThacqx95Tb4JxfCxA",
      },

      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.name },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "turtlewings" },
      { property: "og:title", content: "turtlewings" },
      { name: "twitter:title", content: "turtlewings" },
      { name: "description", content: "Turtle Wings is a special education centre in Electronic City, Bengaluru offering a structured Evening Group Program (5–7 PM) for children with Autism Spectrum Disorder aged 3–10 years." },
      { property: "og:description", content: "Turtle Wings is a special education centre in Electronic City, Bengaluru offering a structured Evening Group Program (5–7 PM) for children with Autism Spectrum Disorder aged 3–10 years." },
      { name: "twitter:description", content: "Turtle Wings is a special education centre in Electronic City, Bengaluru offering a structured Evening Group Program (5–7 PM) for children with Autism Spectrum Disorder aged 3–10 years." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/kc5hf7lJxON3Y0pR8WArIkSfce52/social-images/social-1786530359215-social-image.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/kc5hf7lJxON3Y0pR8WArIkSfce52/social-images/social-1786530359215-social-image.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700&family=Caveat:wght@600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      { children: "document.documentElement.classList.add('js')" },
      {
        type: "application/ld+json",
        children: JSON.stringify({

          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: site.name,
          description:
            "Special education centre supporting children with Autism Spectrum Disorder through a structured Evening Group Program.",
          email: site.email,
          telephone: site.phone,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Hall #3, Club House, Concorder Wish Rush Apartments",
            addressLocality: "Electronic City, Phase 2, Bengaluru",
            addressRegion: "Karnataka",
            addressCountry: "IN",
          },
          openingHours: "Mo-Fr 17:00-19:00",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // The content manager has its own chrome, so the public header/footer are
  // hidden on /admin to keep the admin panel focused.
  const isAdmin = useRouterState({
    select: (s) => s.location.pathname.startsWith("/admin"),
  });

  return (
    <QueryClientProvider client={queryClient}>
      {isAdmin ? null : <Header />}
      <main id="main">
        {/* Required: nested routes render here. */}
        <Outlet />
      </main>
      {isAdmin ? null : <Footer />}
    </QueryClientProvider>
  );
}

