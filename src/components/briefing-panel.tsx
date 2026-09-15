"use client";

import { LoaderCircle, ScrollText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppSession } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

function renderBrief(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-2" />;
    if (trimmed.startsWith("### "))
      return (
        <h4 key={i} className="mt-4 font-medium text-foreground">
          {trimmed.slice(4)}
        </h4>
      );
    if (trimmed.startsWith("## "))
      return (
        <h3 key={i} className="mt-5 font-display text-title">
          {trimmed.slice(3)}
        </h3>
      );
    if (trimmed.startsWith("# "))
      return (
        <h3 key={i} className="mt-5 font-display text-title">
          {trimmed.slice(2)}
        </h3>
      );
    if (trimmed.startsWith("- ") || trimmed.startsWith("* "))
      return (
        <li key={i} className="ml-4 list-disc text-sm text-muted-foreground">
          {trimmed.slice(2)}
        </li>
      );
    const numbered = trimmed.match(/^\d+\.\s+(.*)/);
    if (numbered)
      return (
        <li key={i} className="ml-4 list-decimal text-sm text-muted-foreground">
          {numbered[1]}
        </li>
      );
    const bold = trimmed.replace(/\*\*(.*?)\*\*/g, "$1");
    return (
      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
        {bold}
      </p>
    );
  });
}

export function BriefingPanel() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [brief, setBrief] = useState("");

  if (!hydrated || !session) {
    return (
      <section id="briefing" className="border-t border-border py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-mono text-micro uppercase text-primary">Intelligence desk</p>
          <h2 className="mt-2 font-display text-headline">Commission a 14-day brief</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The desk will not write a plan for a ZIP it cannot verify. Pass the territory gate
            first — then this panel unlocks.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <a href="#gate">Verify ZIP</a>
          </Button>
        </div>
      </section>
    );
  }

  const node = session;

  async function run() {
    setBusy(true);
    setError("");
    try {
      const result = (await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: node.track,
          industry: node.industry,
          zip: node.zip,
          city: node.city,
          county: node.county,
          notes,
        }),
      }).then((r) => r.json())) as { ok: true; text: string } | { ok: false; error: string };
      if (!result.ok) setError(result.error);
      else setBrief(result.text);
    } catch {
      setError("The desk could not be reached. Retry once.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="briefing" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-micro uppercase text-primary">Intelligence desk</p>
        <h2 className="mt-2 font-display text-headline">Commission a 14-day execution brief</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Real Capital Region intelligence, written for {node.city} {node.zip} · {node.industry}.
          User-initiated. One desk, not a chatbot toy.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-xs text-faint">
              {node.nodeId} · {node.track}
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-muted-foreground">
                Optional notes for the desk
              </span>
              <Textarea
                className="mt-1.5"
                maxLength={400}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shop size, hours, what’s broken, who you serve…"
              />
            </label>
            <Button className="mt-4" onClick={run} disabled={busy}>
              {busy ? <LoaderCircle className="animate-spin" /> : <ScrollText />}
              {busy ? "Writing brief" : "Commission brief"}
            </Button>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="min-h-56 rounded-xl border border-border bg-card p-5">
            {brief ? (
              <div>{renderBrief(brief)}</div>
            ) : (
              <p className="text-sm text-faint">
                Brief lands here. The model is instructed as Albany AI Guy — local, specific, no
                invented shop names.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
