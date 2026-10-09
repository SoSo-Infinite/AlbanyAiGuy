"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";

type NavLink = { href: string; label: string };

/**
 * Phone menu on the native <dialog> element (focus containment, Esc to close,
 * inert page behind it) instead of a Radix Sheet — same look, ~20 KB less JS
 * on every page.
 */
export function MobileMenu({
  links,
  showConsole,
}: {
  links: NavLink[];
  showConsole: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  function open() {
    ref.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  }
  function close() {
    ref.current?.close();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={open}
      >
        <Menu />
      </Button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse/touch convenience; Esc and the Close button cover keyboard users */}
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={() => {
          document.documentElement.style.overflow = "";
        }}
        onClick={(e) => {
          // Clicks on the ::backdrop land on the <dialog> itself.
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-full w-80 max-w-[85vw] border-0 border-l border-border bg-card p-0 text-foreground shadow-[var(--shadow-border)] outline-none backdrop:bg-background/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative flex h-full flex-col gap-6 p-6">
          <div className="flex flex-col gap-1.5 pr-8">
            <h2 id={titleId} className="font-display text-title">
              Menu
            </h2>
          </div>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            {showConsole ? (
              <Link
                href="/console"
                onClick={close}
                className="rounded-md px-3 py-3 text-sm text-primary hover:bg-secondary"
              >
                Staging console
              </Link>
            ) : null}
          </nav>
          <button
            type="button"
            onClick={close}
            className="absolute right-2 top-2 grid size-11 place-items-center rounded-sm text-muted-foreground transition-opacity duration-150 hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </dialog>
    </>
  );
}
