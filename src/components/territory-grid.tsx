"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { MUNICIPALITIES, PREFIX_GUIDE } from "@/lib/territory";
import { cn } from "@/lib/utils";

const STATUS: Record<string, string> = {
  core: "Core node",
  live: "Live",
  edge: "Edge overlay",
};

export function TerritoryGrid() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MUNICIPALITIES;
    return MUNICIPALITIES.filter(
      (m) => m.name.toLowerCase().includes(s) || m.county.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <section id="territory" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-micro uppercase text-primary">Coverage</p>
        <h2 className="mt-2 font-display text-headline">The overlay, municipality by municipality</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          518 is the native code. 838 is the overlay — same dirt, same ZIPs. If your porch is in
          this grid, the gate opens. If it isn’t, this desk will not pretend.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PREFIX_GUIDE.map((p) => (
            <div
              key={p.label}
              className="rounded-lg border border-border bg-card px-4 py-3 font-mono text-xs text-muted-foreground"
            >
              {p.label}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter towns or counties"
            aria-label="Filter municipalities"
            className="max-w-sm"
          />
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((m) => (
            <li
              key={`${m.name}-${m.county}`}
              className="rounded-lg border border-border bg-card px-3 py-3"
            >
              <p className="text-sm font-medium">{m.name}</p>
              <p className="mt-0.5 flex items-center justify-between gap-2 font-mono text-micro uppercase text-faint">
                <span>{m.county}</span>
                <span
                  className={cn(
                    m.status === "core"
                      ? "text-primary"
                      : m.status === "live"
                        ? "text-ok"
                        : "text-muted-foreground",
                  )}
                >
                  {STATUS[m.status]}
                </span>
              </p>
            </li>
          ))}
        </ul>
        {list.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No municipality matches that filter.</p>
        ) : null}
      </div>
    </section>
  );
}
