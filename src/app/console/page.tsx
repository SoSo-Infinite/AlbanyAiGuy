"use client";

import { ConsoleLocked, ConsoleView } from "@/components/console-view";
import { useAppSession } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function ConsolePage() {
  const hydrated = useHydrated();
  const session = useAppSession((s) => s.session);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="font-mono text-sm text-muted-foreground">Loading node…</p>
      </main>
    );
  }

  return <main>{session ? <ConsoleView session={session} /> : <ConsoleLocked />}</main>;
}
