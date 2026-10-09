"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/mobile-menu";
import { Button } from "@/components/ui/button";
import { useAppSession } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

const LINKS = [
  { href: "/trunk-line", label: "Trunk line" },
  { href: "/#receptionist", label: "AI receptionist" },
  { href: "/shop-line", label: "Demo" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

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
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden lg:inline font-mono text-xs tabular-nums text-muted-foreground">
      518 {now}
    </span>
  );
}

export function SiteHeader() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);
  const live = hydrated && session;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
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
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Clock />
          {live ? (
            <Button asChild size="sm">
              <Link href="/console">Console</Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
            >
              <a href="/#pilot">Join the pilot</a>
            </Button>
          )}

          <MobileMenu links={LINKS} showConsole={Boolean(live)} />
        </div>
      </div>
    </header>
  );
}
