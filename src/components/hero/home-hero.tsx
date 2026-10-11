import type { CSSProperties } from "react";
import { HeroLoader } from "./hero-loader";
import { HeroPoster } from "./hero-poster";
import { POSTER, projectToPoster } from "./scene/albany-plaza-night";
import { getScene } from "./scene/scenes";

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

/** Server-rendered first screen: static poster, wordmark, and the one button. */
export function HomeHero() {
  return (
    <section id="home-hero" className="hero-stage">
      <div className="hero-visual">
        <div className="hero-fit" aria-hidden="true">
          <HeroPoster />
          <div className="hero-mascot" style={mascotStyle()}>
            <div className="hero-mascot-spin">
              <div className="hero-vortex" />
              <div className="hero-spin-ring" />
              {/* biome-ignore lint/performance/noImgElement: poster LCP image, explicit srcset, no optimizer */}
              <img
                className="hero-mascot-img"
                src="/mascot/mascot-whirlwind-360.webp"
                srcSet="/mascot/mascot-whirlwind-360.webp 360w, /mascot/mascot-whirlwind-709.webp 709w"
                sizes="(min-width: 768px) 210px, 140px"
                width={360}
                height={432}
                alt=""
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
        <HeroLoader />
      </div>
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-ui">
        <p className="hero-wordmark">
          <span className="hero-word-albany">Albany</span>{" "}
          <span className="hero-word-ai">AI</span>{" "}
          <span className="hero-word-guy">Guy</span>
        </p>
        <a className="hero-try" href="/try">
          Try it
        </a>
      </div>
      <a
        className="hero-scroll"
        href="#intro"
        aria-label="Scroll to introduction"
      >
        <span className="sr-only">Scroll to introduction</span>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}
