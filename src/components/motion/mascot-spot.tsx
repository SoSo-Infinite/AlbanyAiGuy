"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative cutout. The whole image moves (translate, rotate, scale, opacity).
 * Hidden from assistive tech. Not a form control.
 */
export function MascotSpot({
  pose = "present",
  className,
}: {
  pose?: "present" | "lost";
  className?: string;
}) {
  const [spinning, setSpinning] = useState(false);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "mascot-spot",
        pose === "lost" && "mascot-pose-lost",
        className,
      )}
    >
      <div className="mascot-arrive">
        <div className="mascot-idle">
          <span className="mascot-glow" />
          <span className="mascot-trail" />
          {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative figure, the parent is aria-hidden */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: tap spins the whole image; it is not in the tab order */}
          <span
            className={cn("mascot-hit", spinning && "is-spinning")}
            onClick={() => setSpinning(true)}
            onAnimationEnd={() => setSpinning(false)}
          >
            {/* biome-ignore lint/performance/noImgElement: decorative cutout, explicit size, lazy, no optimizer */}
            <img
              src="/mascot/mascot-whirlwind-360.webp"
              alt=""
              width={160}
              height={192}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
