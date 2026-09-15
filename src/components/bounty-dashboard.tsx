"use client";

import { useAppSession } from "@/lib/store";
import { processStripeConnectPayout } from "@/lib/bounty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BountyDashboard() {
  const referrals = useAppSession((s) => s.referrals);
  const updateReferral = useAppSession((s) => s.updateReferral);

  const handlePayout = (id: string) => {
    const target = referrals.find((r) => r.id === id);
    if (!target) return;
    const updated = processStripeConnectPayout(target, "payout");
    updateReferral(id, updated);
  };

  const handleClawback = (id: string) => {
    const target = referrals.find((r) => r.id === id);
    if (!target) return;
    const updated = processStripeConnectPayout(target, "clawback");
    updateReferral(id, updated);
  };

  const totalOpen = referrals.filter((r) => r.status === "open").length;
  const totalPaid = referrals.filter((r) => r.status === "paid").length;
  const totalClawed = referrals.filter((r) => r.status === "clawed_back").length;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-display text-lg font-bold">518 Bounty Engine — Operator Console</h2>
          <p className="text-xs text-muted-foreground">
            Track scout codes, verify in-territory referrals, and process Stripe Connect test payouts.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <span className="rounded bg-primary/10 px-2 py-1 text-primary">Open: {totalOpen}</span>
          <span className="rounded bg-green-500/10 px-2 py-1 text-green-400">Paid: {totalPaid}</span>
          <span className="rounded bg-destructive/10 px-2 py-1 text-destructive">Clawed: {totalClawed}</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2">Scout Code</th>
              <th className="py-2">Target ZIP</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
              <th className="py-2">Payout ID</th>
              <th className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {referrals.map((r) => (
              <tr key={r.id} className="font-mono text-xs">
                <td className="py-3 font-semibold text-primary">{r.code}</td>
                <td className="py-3">{r.zip}</td>
                <td className="py-3">${r.amount}</td>
                <td className="py-3">
                  <Badge
                    variant={
                      r.status === "paid"
                        ? "default"
                        : r.status === "open"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {r.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3 text-muted-foreground">{r.stripePayoutId || "—"}</td>
                <td className="py-3 text-right">
                  {r.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handlePayout(r.id)}
                    >
                      Process Payout
                    </Button>
                  )}
                  {r.status === "paid" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => handleClawback(r.id)}
                    >
                      Claw Back
                    </Button>
                  )}
                  {r.status === "clawed_back" && (
                    <span className="text-muted-foreground text-xs">Clawed Back</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
