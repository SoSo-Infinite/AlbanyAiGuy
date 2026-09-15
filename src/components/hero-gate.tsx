"use client";

import Link from "next/link";
import { Check, LoaderCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { RegionMesh } from "@/components/region-mesh";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRACKS, industriesFor, type TrackId } from "@/lib/industries";
import { useAppSession } from "@/lib/store";
import { EXAMPLE_ZIPS, formatNodeId, lookupZip } from "@/lib/territory";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const STEPS = [
  "Parsing ZIP",
  "Resolving 518 / 838 overlay",
  "Mapping municipality",
  "Allocating staging node",
];

export function HeroGate() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);
  const verify = useAppSession((s) => s.verify);
  const live = hydrated && session;

  const [track, setTrack] = useState<TrackId>("service");
  const [industry, setIndustry] = useState<string>(industriesFor("service")[0]);
  const [zip, setZip] = useState("");
  const [phase, setPhase] = useState<"idle" | "checking" | "denied" | "ok">("idle");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const industries = useMemo(() => industriesFor(track), [track]);

  useEffect(() => {
    setIndustry(industries[0] ?? "");
  }, [industries]);

  useEffect(() => {
    if (phase !== "checking") return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(STEPS.length);
      return;
    }
    setStep(0);
    const timers: number[] = [];
    STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i + 1), 380 * (i + 1)));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = zip.replace(/\D/g, "").slice(0, 5);
    setZip(cleaned);
    const place = lookupZip(cleaned);
    if (!place) {
      setPhase("denied");
      setError(
        "Outside the overlay. Albany AI Guy does not deploy past 518/838 — Capital Region, Greene/Columbia pockets, and the North Country.",
      );
      return;
    }
    setError("");
    setPhase("checking");
    const wait =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 80
        : 380 * STEPS.length + 180;
    window.setTimeout(() => {
      verify({
        zip: place.zip,
        city: place.city,
        county: place.county,
        node: place.node,
        nodeId: formatNodeId(place.zip, place.city),
        track,
        industry,
        verifiedAt: Date.now(),
      });
      setPhase("ok");
      toast.success(`${place.city} ${place.zip} verified. Staging node allocated.`);
    }, wait);
  }

  return (
    <section id="gate" className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <div className="enter-1 mb-5 inline-flex items-center gap-2">
            <Badge>
              <span className="pulse-dot size-1.5 rounded-full bg-primary" />
              Capital Region · locked to 518/838
            </Badge>
          </div>
          <h1 className="enter-2 font-display text-display text-foreground">
            AI infrastructure, locked to the <em className="text-primary">518</em>.
          </h1>
          <p className="enter-3 mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Turnkey lead capture, after-hours response, and channel engines for Capital
            Region operators, creators, and scouts. Fourteen days to a running system.
            No outside-area access.
          </p>

          <div className="enter-4 mt-8">
            {live ? (
              <VerifiedCard />
            ) : (
              <form
                onSubmit={onSubmit}
                className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-border)] sm:p-5"
              >
                <p className="font-mono text-micro uppercase text-faint">Territory gate</p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {TRACKS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTrack(t.id)}
                      className={cn(
                        "rounded-lg border px-3 py-3 text-left transition-[border-color,background-color] duration-150",
                        track === t.id
                          ? "border-primary/50 bg-accent"
                          : "border-border bg-elevated hover:border-primary/30",
                      )}
                    >
                      <span className="block font-mono text-micro uppercase text-faint">
                        {t.kicker}
                      </span>
                      <span className="mt-1 block text-sm font-medium leading-snug">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
                  <div className="grid gap-1.5 md:col-span-2">
                    <Label htmlFor="industry">Template</Label>
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="h-11 w-full rounded-md border border-input bg-elevated px-3 text-sm shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      {industries.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={5}
                      placeholder="12207"
                      value={zip}
                      onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={phase === "checking"} className="h-11">
                    {phase === "checking" ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Verifying
                      </>
                    ) : (
                      "Deploy system"
                    )}
                  </Button>
                </div>

                {phase === "checking" ? (
                  <ol className="mt-4 space-y-1.5 font-mono text-xs text-muted-foreground">
                    {STEPS.map((s, i) => (
                      <li key={s} className="flex items-center gap-2">
                        {step > i ? (
                          <Check className="size-3.5 text-ok" />
                        ) : (
                          <LoaderCircle className="size-3.5 animate-spin text-primary" />
                        )}
                        {s}
                      </li>
                    ))}
                  </ol>
                ) : null}

                {phase === "denied" ? (
                  <p className="mt-4 flex items-start gap-2 text-sm text-destructive">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </p>
                ) : (
                  <p className="mt-4 text-xs text-faint">
                    Strictly gated to physical 518/838 locations. Free 14-day execution.
                    Try {EXAMPLE_ZIPS.map((z) => z.zip).join(", ")}.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="relative hidden min-h-96 lg:block">
          <div className="absolute inset-0 rounded-2xl border border-border bg-card/40">
            <RegionMesh className="h-full w-full p-4" />
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-border bg-background/80 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm">
            <span>topology · 518 overlay</span>
            <span className="text-primary">hub Albany</span>
          </div>
        </div>
        <div className="relative mt-8 h-56 overflow-hidden rounded-2xl border border-border bg-card/40 lg:hidden">
          <RegionMesh className="h-full w-full p-3" />
        </div>
      </div>
    </section>
  );
}

function VerifiedCard() {
  const session = useAppSession((s) => s.session);
  if (!session) return null;
  return (
    <div className="rounded-xl border border-primary/30 bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-ok">
          <ShieldCheck className="size-4" />
          <span className="font-mono text-xs uppercase">Territory verified</span>
        </div>
        <Badge variant="ok">14-day staging</Badge>
      </div>
      <p className="mt-3 font-display text-headline">
        {session.city}
        <span className="text-muted-foreground"> · {session.zip}</span>
      </p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {session.nodeId} · {session.county} County · {session.industry}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/console">Open staging console</Link>
        </Button>
        <Button asChild variant="outline">
          <a href="#engines">Inspect engines</a>
        </Button>
      </div>
    </div>
  );
}
