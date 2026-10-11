"use client";

import { ConsoleLocked, ConsoleView } from "@/components/console-view";
import { PageTransition } from "@/components/motion/page-transition";
import { useAppSession } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function ConsolePage() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);

  if (!hydrated) {
    return (
      <PageTransition>
        <main className="site-main mx-auto max-w-6xl px-4 py-16">
          <p className="font-mono text-sm text-muted-foreground">
            Loading node…
          </p>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="site-main">
        {session ? <ConsoleView session={session} /> : <ConsoleLocked />}
      </main>
    </PageTransition>
  );
}
