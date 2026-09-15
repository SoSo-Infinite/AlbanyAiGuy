"use client";

import { useEffect, useState } from "react";
import { eventAt, LEDGER_STATS, type LedgerEvent } from "@/lib/ledger";
import { cn } from "@/lib/utils";

function useCountUp(target: number, play: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!play) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, play]);
  return value;
}

function Stat({
  value,
  label,
  suffix,
  play,
}: {
  value: number;
  label: string;
  suffix: string;
  play: boolean;
}) {
  const n = useCountUp(value, play);
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-6 shadow-[var(--shadow-border)]">
      <p className="font-display text-headline tabular-nums text-foreground">
        {n.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function LiveLedger() {
  const [play, setPlay] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [feed, setFeed] = useState<LedgerEvent[]>(() =>
    Array.from({ length: 6 }, (_, i) => eventAt(i)),
  );

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setPlay(true);
      },
      { threshold: 0.2 },
    );
    const el = document.getElementById("ledger");
    if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCursor((c) => {
        const next = c + 1;
        setFeed((prev) => [eventAt(next + 5), ...prev].slice(0, 8));
        return next;
      });
    }, 3400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="ledger" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-micro uppercase text-primary">Public network command center</p>
        <h2 className="mt-2 font-display text-headline">The 518 live ledger</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Mapped operators, staging nodes, and bounty scouts across the overlay. Telemetry is
          anonymized. The desk does not leak a neighbor’s name onto the public board.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {LEDGER_STATS.map((s) => (
            <Stat key={s.key} value={s.value} label={s.label} suffix={s.suffix} play={play} />
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-mono text-xs text-muted-foreground">ops log · rolling</p>
            <p className="font-mono text-xs text-faint">tick {cursor.toString().padStart(4, "0")}</p>
          </div>
          <ul>
            {feed.map((ev, i) => (
              <li
                key={ev.id}
                className={cn(
                  "grid grid-cols-[4.5rem_7rem_1fr] gap-3 border-b border-border/70 px-4 py-2.5 font-mono text-xs last:border-0 sm:grid-cols-[5.5rem_9rem_1fr]",
                  i === 0 ? "bg-accent/50 text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="text-primary">{ev.zip}</span>
                <span className="truncate">{ev.place}</span>
                <span className="truncate">{ev.signal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
