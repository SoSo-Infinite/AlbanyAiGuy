"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/mobile-menu";
import { NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

function Clock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () => {
      setNow(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    // The clock is only shown at lg+; don't re-render every second on phones.
    const wide = window.matchMedia("(min-width: 1024px)");
    let id: number | undefined;
    const sync = () => {
      window.clearInterval(id);
      id = undefined;
      if (wide.matches) {
        tick();
        id = window.setInterval(tick, 1000);
      }
    };
    sync();
    wide.addEventListener("change", sync);
    return () => {
      window.clearInterval(id);
      wide.removeEventListener("change", sync);
    };
  }, []);
  return (
    <span className="hidden lg:inline font-mono text-xs tabular-nums text-muted-foreground">
      518 {now}
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [overHero, setOverHero] = useState(isHome);

  useEffect(() => {
    if (!isHome) return;
    const hero = document.getElementById("home-hero");
    if (!hero) return;
    const update = () => {
      const next = hero.getBoundingClientRect().bottom > 64;
      setOverHero((prev) => (prev === next ? prev : next));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={cn(
        "top-0 z-40 motion-safe:transition-[background-color,border-color,backdrop-filter] motion-safe:duration-300",
        isHome
          ? overHero
            ? "fixed inset-x-0 border-b border-transparent bg-transparent"
            : "fixed inset-x-0 border-b border-border bg-background/80 backdrop-blur-md"
          : "sticky border-b border-border bg-background/80 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 min-w-0">
          <span className="grid size-7 place-items-center rounded-sm bg-primary text-primary-foreground font-mono text-xs font-medium">
            518
          </span>
          <span className="truncate text-sm font-medium tracking-tight">
            Albany AI Guy
            <span className="text-muted-foreground">.com</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="nav-link rounded-sm text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Clock />

          <MobileMenu links={[...NAV_LINKS]} showConsole={false} />
        </div>
      </div>
    </header>
  );
}
