"use client";

import Link from "next/link";
import { CalendarRange, Handshake, MessageSquare, Shield } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRACKS, type TrackId } from "@/lib/industries";
import {
  BOUNTIES,
  draftReply,
  mintScoutCode,
  seedThread,
  thirtyDayPlan,
  type ChatTurn,
} from "@/lib/playbooks";
import { useAppSession } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const ICONS = {
  service: Shield,
  creator: CalendarRange,
  scout: Handshake,
};

export function Engines() {
  const [open, setOpen] = useState<TrackId>("service");

  return (
    <section id="engines" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-micro uppercase text-primary">Automated workflows</p>
        <h2 className="mt-2 font-display text-headline">Engineered for instant deployment</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Three engines. One territory. Open a module and run it — this is the product, not a
          brochure.
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {TRACKS.map((t) => {
            const Icon = ICONS[t.id];
            const active = open === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setOpen(t.id)}
                className={cn(
                  "rounded-xl border p-5 text-left transition-[border-color,transform] duration-200 ease-out",
                  active
                    ? "border-primary/50 bg-card shadow-[var(--shadow-border-hover)]"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/30",
                )}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-accent text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-title">{t.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t.summary}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-border)] sm:p-6">
          {open === "service" ? <ShieldDemo /> : null}
          {open === "creator" ? <IncubatorDemo /> : null}
          {open === "scout" ? <ScoutDemo /> : null}
        </div>
      </div>
    </section>
  );
}

function ShieldDemo() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);
  const city = hydrated && session ? session.city : "Delmar";
  const zip = hydrated && session ? session.zip : "12054";
  const industry = hydrated && session?.track === "service" ? session.industry : "HVAC";
  const [turns, setTurns] = useState<ChatTurn[]>(() => seedThread(industry));
  const [draft, setDraft] = useState("");

  function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const reply = draftReply(industry, text, city, zip);
    setTurns((prev) => [...prev, { from: "lead", text }, { from: "shield", text: reply }]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Service Shield</Badge>
        <span className="font-mono text-xs text-muted-foreground">
          {industry} · {city} {zip} · after-hours desk
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Type a late-night inquiry. The shield answers as a Capital Region operator would — logged,
        routed, never left in voicemail.
      </p>
      <div className="mt-5 space-y-3">
        {turns.map((t, i) => (
          <div
            key={`${t.from}-${i}`}
            className={cn("flex", t.from === "lead" ? "justify-start" : "justify-end")}
          >
            <div
              className={cn(
                "max-w-2xl rounded-lg px-3 py-2 text-sm",
                t.from === "lead"
                  ? "rounded-bl-xs bg-secondary text-foreground"
                  : "rounded-br-xs bg-accent text-accent-foreground",
              )}
            >
              <p className="font-mono text-micro uppercase text-faint">
                {t.from === "lead" ? "inbound" : "shield"}
              </p>
              <p className="mt-1 leading-relaxed">{t.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Can you look at my furnace tonight?"
          aria-label="After-hours message"
        />
        <Button type="submit" variant="secondary">
          <MessageSquare />
          Send
        </Button>
      </form>
    </div>
  );
}

function IncubatorDemo() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);
  const niche =
    hydrated && session?.track === "creator" ? session.industry : "Comic / illustration";
  const [week, setWeek] = useState(1);
  const plan = useMemo(() => thirtyDayPlan(niche), [niche]);
  const days = plan.filter((d) => d.week === week);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Incubator</Badge>
        <span className="font-mono text-xs text-muted-foreground">{niche} · 30-day lock</span>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        A publishing calendar, not a mood board. Week themes stay local to how Capital Region
        creators actually ship.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((w) => (
          <Button
            key={w}
            type="button"
            size="sm"
            variant={week === w ? "default" : "outline"}
            onClick={() => setWeek(w)}
          >
            Week {w}
          </Button>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
        {days.map((d) => (
          <li key={d.day} className="grid gap-1 px-4 py-3 sm:grid-cols-[4.5rem_1fr_1fr] sm:gap-4">
            <span className="font-mono text-xs text-primary">Day {d.day}</span>
            <span className="text-sm">{d.title.replace(/^Day \d+ · /, "")}</span>
            <span className="text-sm text-muted-foreground">{d.asset}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoutDemo() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);
  const zip = hydrated && session ? session.zip : "12207";
  const city = hydrated && session ? session.city : "Albany";
  const code = mintScoutCode(zip, city);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Bounty engine</Badge>
        <span className="font-mono text-xs text-muted-foreground">no business required</span>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Mint a territory link. Hand it to a neighbor. When they stage a system, the bounty clears
        to you.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-elevated p-4">
          <p className="font-mono text-micro uppercase text-faint">Your scout code</p>
          <p className="mt-2 font-mono text-xl tracking-wide text-primary">{code}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link
              href={`/s/${code.toLowerCase()}`}
              className="text-primary hover:underline"
            >
              albanyaiguy.com/s/{code.toLowerCase()}
            </Link>
          </p>
        </div>
        <ul className="rounded-lg border border-border bg-elevated p-4 space-y-3">
          {BOUNTIES.map((b) => (
            <li key={b.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-mono tabular-nums">{b.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
