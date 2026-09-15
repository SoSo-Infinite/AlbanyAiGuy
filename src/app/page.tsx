import { BriefingPanel } from "@/components/briefing-panel";
import { Doctrine } from "@/components/doctrine";
import { Engines } from "@/components/engines";
import { HeroGate } from "@/components/hero-gate";
import { LiveLedger } from "@/components/live-ledger";
import { TerritoryGrid } from "@/components/territory-grid";
import { Ticker } from "@/components/ticker";

export default function Home() {
  return (
    <main>
      <HeroGate />
      <Ticker />
      <LiveLedger />
      <Engines />
      <TerritoryGrid />
      <Doctrine />
      <BriefingPanel />
    </main>
  );
}
