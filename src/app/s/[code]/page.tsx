import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Referral link",
  robots: { index: false, follow: false },
};

/**
 * Old scout/referral links land here. The referral program is private and not
 * paying out, so this page makes no offer and shows no amounts.
 */
export default function ReferralLinkPage() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-4 py-16">
      <Badge>Referral link</Badge>
      <h1 className="mt-4 font-display text-headline">
        Referral links aren&apos;t active yet
      </h1>
      <p className="mt-3 text-muted-foreground">
        Albany AI Guy doesn&apos;t have a public referral program right now, so
        this link doesn&apos;t earn or pay anything. If you run an Albany-area
        shop, you can still join the pilot.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/#pilot">Join the pilot</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
