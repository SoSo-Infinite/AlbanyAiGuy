"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppSession } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#gate", label: "Deploy" },
  { href: "/#ledger", label: "Ledger" },
  { href: "/#engines", label: "Engines" },
  { href: "/#territory", label: "Territory" },
  { href: "/#doctrine", label: "Doctrine" },
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
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
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
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <a href="/#gate">Verify ZIP</a>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6">
              <SheetHeader>
                <SheetTitle>Network</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {l.label}
                  </a>
                ))}
                {live ? (
                  <Link
                    href="/console"
                    className="rounded-md px-3 py-3 text-sm text-primary hover:bg-secondary"
                  >
                    Staging console
                  </Link>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
