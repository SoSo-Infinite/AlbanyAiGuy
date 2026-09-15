"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BOUNTIES } from "@/lib/playbooks";
import { useAppSession } from "@/lib/store";
import { validateAndCreateReferral } from "@/lib/bounty";

export default function ScoutInvite({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const display = code.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24) || "518-SCOUT";

  const [inputZip, setInputZip] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const referrals = useAppSession((s) => s.referrals);
  const addReferral = useAppSession((s) => s.addReferral);
  const scout = useAppSession((s) => s.scout) || {
    id: "scout_demo",
    name: "Capital Region Scout",
    code: display,
    verifiedZip: "12207",
    createdAt: Date.now(),
  };

  const handleClaimReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanZip = inputZip.trim();

    const res = validateAndCreateReferral(display, cleanZip, scout, referrals);
    if (res.success) {
      addReferral(res.referral);
      setFeedback({
        type: "success",
        message: `Verified in-territory ZIP ${cleanZip}. Referral bounty staged ($${res.referral.amount})!`,
      });
      setInputZip("");
    } else {
      if (res.reason === "INVALID_ZIP") {
        setFeedback({
          type: "error",
          message: `ZIP ${cleanZip} is outside the 518/838 Capital Region territory.`,
        });
      } else if (res.reason === "SELF_REFERRAL") {
        setFeedback({
          type: "error",
          message: "Self-referrals are prohibited. Scouts cannot claim bounties on their own ZIP.",
        });
      } else if (res.reason === "DUPLICATE") {
        setFeedback({
          type: "error",
          message: `A referral for ZIP ${cleanZip} with code ${display} has already been recorded.`,
        });
      }
    }
  };

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-4 py-16">
      <Badge>Scout referral</Badge>
      <h1 className="mt-4 font-display text-headline">You were routed into the 518 overlay</h1>
      <p className="mt-3 text-muted-foreground">
        A Capital Region scout minted this code. Verify a physical 518/838 ZIP to stage a system —
        Service Shield, incubator, or your own scout desk.
      </p>
      <p className="mt-5 font-mono text-lg tracking-wide text-primary">{display}</p>

      {/* Interactive In-Territory Referral Claim Form */}
      <form onSubmit={handleClaimReferral} className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4">
        <label htmlFor="referral-zip" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stage Referral in Territory (518 / 838 ZIP)
        </label>
        <div className="flex gap-2">
          <Input
            id="referral-zip"
            type="text"
            placeholder="e.g. 12180 (Troy)"
            value={inputZip}
            onChange={(e) => setInputZip(e.target.value)}
            className="font-mono text-sm"
            maxLength={5}
            required
          />
          <Button type="submit">Stage</Button>
        </div>

        {feedback && (
          <p
            className={`text-xs ${
              feedback.type === "success" ? "text-green-400" : "text-destructive"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </form>

      <ul className="mt-6 space-y-2 rounded-xl border border-border bg-card p-4">
        {BOUNTIES.map((b) => (
          <li key={b.label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{b.label}</span>
            <span className="font-mono tabular-nums">{b.amount}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/console">Open Operator Console</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">View the network</Link>
        </Button>
      </div>
    </main>
  );
}
