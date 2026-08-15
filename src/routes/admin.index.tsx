import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarRange, ExternalLink, Mail, Users, Video } from "lucide-react";
import type { ComponentType } from "react";
import { adminList } from "@/lib/cms";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const cards = [
  {
    name: "programs",
    label: "Programs",
    to: "/admin/programs",
    icon: CalendarRange,
    hint: "Active programs show on the website",
  },
  {
    name: "members",
    label: "Members",
    to: "/admin/members",
    icon: Users,
    hint: "Only public members appear on /members",
  },
  { name: "blogs", label: "Blog posts", to: "/admin/blog", icon: BookOpen, hint: "Published posts go live instantly" },
  { name: "videos", label: "Videos", to: "/admin/videos", icon: Video, hint: "Published videos go live instantly" },
  { name: "enquiries", label: "Enquiries", to: "/admin/enquiries", icon: Mail, hint: "Messages from the contact form" },
] as const;

function AdminDashboard() {
  return (
    <div>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-forest-deep sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you publish here appears on the website straight away.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-input px-4 text-sm font-bold"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">View site</span>
        </a>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <CountCard key={card.name} {...card} />
        ))}
      </div>
    </div>
  );
}

function CountCard({
  name,
  label,
  to,
  icon: Icon,
  hint,
}: {
  name: (typeof cards)[number]["name"];
  label: string;
  to: (typeof cards)[number]["to"];
  icon: ComponentType<{ className?: string }>;
  hint: string;
}) {
  const query = useQuery({
    queryKey: ["admin", name],
    queryFn: () => adminList<{ id: string }>(name),
  });

  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-leaf/60 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/70 text-forest-deep">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-forest-deep">
        {query.isLoading ? "…" : query.isError ? "—" : (query.data ?? []).length}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </Link>
  );
}
