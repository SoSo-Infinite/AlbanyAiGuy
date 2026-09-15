"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TRACKS } from "@/lib/industries";
import { eventAt } from "@/lib/ledger";
import { mintScoutCode, STAGING_BEATS, thirtyDayPlan } from "@/lib/playbooks";
import { stagingDay, useAppSession, type Session } from "@/lib/store";

export function ConsoleView({ session }: { session: Session }) {
  const clear = useAppSession((s) => s.clear);
  const day = stagingDay(session.verifiedAt);
  const pct = Math.round((day / 14) * 100);
  const track = TRACKS.find((t) => t.id === session.track);
  const beats = STAGING_BEATS[session.track];
  const code = mintScoutCode(session.zip, session.city);
  const week1 = useMemo(
    () => thirtyDayPlan(session.industry).filter((d) => d.week === 1).slice(0, 5),
    [session.industry],
  );
  const log = useMemo(
    () => Array.from({ length: 5 }, (_, i) => eventAt(i + session.zip.charCodeAt(0))),
    [session.zip],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-micro uppercase text-primary">Staging console</p>
          <h1 className="mt-2 font-display text-headline">
            {session.city} node
            <span className="text-muted-foreground"> · {session.zip}</span>
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {session.nodeId} · {session.county} County · {session.node}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="ok">Day {day} of 14</Badge>
          <Badge variant="muted">{session.industry}</Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Execution window</p>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-3" />
          <ol className="mt-5 grid gap-2 sm:grid-cols-2">
            {beats.map((b) => (
              <li
                key={b.day}
                className="rounded-lg border border-border bg-elevated px-3 py-3 text-sm"
              >
                <p className="font-mono text-micro uppercase text-primary">{b.day}</p>
                <p className="mt-1 text-muted-foreground">{b.item}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Radio className="size-4 text-primary" />
            Engine
          </p>
          <p className="mt-3 font-display text-title">{track?.label}</p>
          <p className="mt-2 text-sm text-muted-foreground">{track?.summary}</p>
          <p className="mt-4 font-mono text-xs text-faint">status · armed</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {session.track === "scout" ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-micro uppercase text-faint">Scout code</p>
            <p className="mt-2 font-mono text-2xl tracking-wide text-primary">{code}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Share{" "}
              <Link
                href={`/s/${code.toLowerCase()}`}
                className="text-primary hover:underline"
              >
                albanyaiguy.com/s/{code.toLowerCase()}
              </Link>{" "}
              with a neighbor operator.
            </p>
          </div>
        ) : session.track === "creator" ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-micro uppercase text-faint">Week 1 lock</p>
            <ul className="mt-3 space-y-2">
              {week1.map((d) => (
                <li key={d.day} className="flex gap-3 text-sm">
                  <span className="font-mono text-xs text-primary">D{d.day}</span>
                  <span className="text-muted-foreground">
                    {d.title.replace(/^Day \d+ · /, "")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-micro uppercase text-faint">After-hours desk</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Intake is live for {session.industry} in {session.city}. Late-night inquiries land
              here first — not a personal cell, not a forgotten Gmail filter.
            </p>
            <p className="mt-4 font-mono text-xs text-primary">capture · armed · 24/7</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="font-mono text-micro uppercase text-faint">Local ops log</p>
          <ul className="mt-3 space-y-2">
            {log.map((e) => (
              <li key={e.id} className="font-mono text-xs text-muted-foreground">
                <span className="text-primary">{e.zip}</span> {e.place} · {e.signal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild>
          <a href="/#briefing">Commission brief</a>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to network</Link>
        </Button>
        <Button variant="ghost" onClick={() => clear()}>
          Release node
        </Button>
      </div>
    </div>
  );
}

export function ConsoleLocked() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-4 py-16">
      <p className="font-mono text-micro uppercase text-primary">Console locked</p>
      <h1 className="mt-2 font-display text-headline">No staging node on this device</h1>
      <p className="mt-3 text-muted-foreground">
        The console only opens after a 518/838 ZIP clears the territory gate. Verify from the
        network home, then come back.
      </p>
      <Button asChild className="mt-6 w-fit">
        <Link href="/#gate">
          Verify ZIP
        </Link>
      </Button>
    </div>
  );
}
