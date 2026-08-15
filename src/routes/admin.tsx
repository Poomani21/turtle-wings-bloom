import { useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarRange,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Settings,
  Users,
  Video,
} from "lucide-react";
import type { ComponentType } from "react";
import mascot from "@/assets/turtle-mascot.png";
import { adminSignIn, adminSignOut, useAdminAuth } from "@/hooks/useAdminAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Content Manager | Turtle Wings" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private content manager for the Turtle Wings website." },
    ],
  }),
  component: AdminLayout,
});

const adminLinks: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/programs", label: "Programs", icon: CalendarRange },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/blog", label: "Blog", icon: BookOpen },
  { to: "/admin/videos", label: "Videos", icon: Video },
  { to: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { to: "/admin/settings", label: "Site settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="container-site flex min-h-[60vh] items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Checking your session…
        </p>
      </div>
    );
  }

  if (!user) return <SignIn initialError={error} />;
  if (!isAdmin) return <NotAuthorised email={user.email} uid={user.uid} />;

  return (
    <div className="min-h-screen bg-accent/25">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-forest-deep text-cream">
        <div className="container-site grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={mascot}
              alt=""
              width={912}
              height={912}
              className="size-9 shrink-0"
              loading="lazy"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-extrabold text-cream sm:text-lg">
                Turtle Wings
              </span>
              <span className="block truncate text-xs text-cream/70">Content manager</span>
            </span>
          </Link>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[16rem] truncate text-sm text-cream/75 md:block">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => void adminSignOut()}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-cream/30 px-3 text-sm font-bold text-cream transition-colors hover:bg-cream/10"
            >
              <LogOut aria-hidden="true" className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container-site py-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:py-10">
        {/* Nav: horizontal scroller on mobile, sidebar on desktop */}
        <nav aria-label="Content manager" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {adminLinks.map((link) => (
              <li key={link.to} className="shrink-0 lg:shrink">
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/admin" }}
                  activeProps={{
                    className: "bg-forest-deep text-cream border-forest-deep shadow-card",
                  }}
                  className="inline-flex min-h-10 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-bold transition-colors hover:bg-accent/60"
                >
                  <link.icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="mt-6 min-w-0 lg:mt-0">
          <div className="rounded-3xl border border-border bg-background p-5 shadow-card sm:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NotAuthorised({ email, uid }: { email: string | null; uid: string }) {
  return (
    <div className="container-site max-w-md py-16">
      <h1 className="font-display text-2xl font-extrabold text-forest-deep">
        This account cannot manage content
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {email ?? "This account"} is signed in but is not on the administrator allowlist, so the
        content manager stays locked. Ask the site owner to add this user ID to the allowlist in
        Firebase.
      </p>
      <p className="mt-4 rounded-xl border border-border bg-card p-3 font-mono text-xs break-all">
        {uid}
      </p>
      <button
        type="button"
        onClick={() => void adminSignOut()}
        className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-input px-4 font-bold"
      >
        <LogOut aria-hidden="true" className="size-3.5" /> Sign out
      </button>
    </div>
  );
}

function SignIn({ initialError }: { initialError: string | null }) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState<string | null>(initialError);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage(null);
    try {
      await adminSignIn(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
    } catch {
      setMessage("We could not sign you in. Please check your email and password.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="grid min-h-[80vh] place-items-center bg-accent/25 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <img src={mascot} alt="" width={912} height={912} className="size-11 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold text-forest-deep">
              Content manager
            </h1>
            <p className="hand-label text-base text-leaf">Turtle Wings</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Sign in with the Turtle Wings administrator account to manage programs, members, blog
          posts, videos and enquiries.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card"
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base"
            />
          </div>
          {message ? (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-extrabold text-primary-foreground disabled:opacity-70"
          >
            {status === "loading" ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : null}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
