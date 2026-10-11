import { SkylineStrip } from "@/components/motion/skyline-strip";

/** Slim decorative plaza band. No text. CSS motion only. */
export function PageBand() {
  return (
    <div className="page-band" aria-hidden="true">
      <SkylineStrip idPrefix="band" variant="band" />
    </div>
  );
}
