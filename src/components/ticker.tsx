"use client";

import { tickerCopy } from "@/lib/ledger";

export function Ticker() {
  const items = tickerCopy();
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border bg-card/80">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="ticker-track flex w-max gap-8 py-2.5">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="whitespace-nowrap font-mono text-xs text-muted-foreground"
          >
            <span className="mr-2 inline-block size-1.5 rounded-full bg-primary align-middle" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
