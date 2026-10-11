import type { CSSProperties, ReactNode } from "react";
import { HeroPoster } from "@/components/hero/hero-poster";
import {
  POSTER,
  projectToPoster,
} from "@/components/hero/scene/albany-plaza-night";
import { getScene } from "@/components/hero/scene/scenes";
import { MascotSpot } from "@/components/motion/mascot-spot";
import { TryHeroMotion } from "./try-hero-motion";

function mascotStyle(): CSSProperties {
  const scene = getScene();
  const points = scene.posterSpotIds.map((id) => {
    const spot = scene.spots.find((item) => item.id === id);
    if (!spot) throw new Error(`Missing poster spot ${id}`);
    return projectToPoster(spot.position);
  });
  const origin = points[0];
  if (!origin) throw new Error("Missing poster origin");
  const style: CSSProperties = {
    left: `${(origin.x / POSTER.w) * 100}%`,
    top: `${(origin.y / POSTER.h) * 100}%`,
  };
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    const dx = ((point.x - origin.x) / POSTER.w) * 100;
    const dy = ((point.y - origin.y) / POSTER.h) * 100;
    (style as Record<string, string>)[`--hop-${i}x`] = `${dx}cqw`;
    (style as Record<string, string>)[`--hop-${i}y`] = `${dy}cqh`;
  }
  return style;
}

/** Albany night poster for /try. CSS and SVG only. No WebGL. */
export function TryHero({ children }: { children: ReactNode }) {
  return (
    <section id="try-hero" className="try-hero hero-stage">
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-fit">
          <HeroPoster />
          <div className="try-moon" />
          <div className="try-streaks">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-mascot" style={mascotStyle()}>
            <MascotSpot className="try-hero-mascot" />
          </div>
        </div>
      </div>
      <div className="hero-scrim" aria-hidden="true" />
      <TryHeroMotion />
      <div className="try-hero-copy">{children}</div>
    </section>
  );
}
