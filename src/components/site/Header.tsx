import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import mascot from "@/assets/turtle-mascot.png";
import { navLinks, site } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/95 shadow-[0_6px_24px_-20px_var(--forest-deep)] backdrop-blur"
          : "bg-background",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="container-site grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 lg:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={mascot}
            alt=""
            width={912}
            height={912}
            className={cn(
              "shrink-0 transition-all duration-300",
              scrolled ? "h-10 w-10" : "h-12 w-12",
            )}
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-xl leading-none font-extrabold text-forest-deep sm:text-2xl">
              {site.name}
            </span>
            <span className="hand-label block truncate text-base sm:text-lg">{site.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-full px-4 py-2 text-sm font-bold text-foreground/80 transition-colors hover:bg-accent/70 hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-extrabold text-secondary-foreground shadow-sun transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Phone aria-hidden="true" className="size-4" />
            Enquire Now
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-11 place-items-center rounded-full border border-border bg-card text-forest-deep xl:hidden"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-background xl:hidden"
      >
        <nav aria-label="Mobile" className="container-site flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-xl px-4 py-3 text-base font-bold text-foreground/85"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-secondary px-5 font-extrabold text-secondary-foreground shadow-sun"
          >
            <Phone aria-hidden="true" className="size-4" />
            Enquire Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
