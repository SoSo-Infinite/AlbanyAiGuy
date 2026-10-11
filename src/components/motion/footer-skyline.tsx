import { SkylineStrip } from "@/components/motion/skyline-strip";

/** Silhouette line that sits on top of the footer. */
export function FooterSkyline() {
  return (
    <div className="footer-skyline" aria-hidden="true">
      <SkylineStrip idPrefix="foot" variant="line" />
    </div>
  );
}
