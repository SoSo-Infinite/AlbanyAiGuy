import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BOUNTIES } from "@/lib/playbooks";

export default async function ScoutInvite({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const display = code.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24) || "518-SCOUT";

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-4 py-16">
      <Badge>Scout referral</Badge>
      <h1 className="mt-4 font-display text-headline">You were routed into the 518 overlay</h1>
      <p className="mt-3 text-muted-foreground">
        A Capital Region scout minted this code. Verify a physical 518/838 ZIP to stage a system —
        Service Shield, incubator, or your own scout desk.
      </p>
      <p className="mt-5 font-mono text-lg tracking-wide text-primary">{display}</p>
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
          <Link href="/#gate">Verify ZIP</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">View the network</Link>
        </Button>
      </div>
    </main>
  );
}
