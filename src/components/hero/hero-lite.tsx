"use client";

import { useEffect } from "react";

/**
 * Phone / low-power layer. The poster SVG and mascot image are already in
 * the server HTML. This only binds the decorative tap-to-spin. Motion itself
 * is CSS (transform and opacity) gated on data-mode="lite".
 */
export function HeroLite({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const spin = document.querySelector<HTMLElement>(
      "#home-hero .hero-mascot-spin",
    );
    if (!spin) return;
    const onClick = () => {
      spin.classList.remove("is-spinning");
      // Restart the keyframe if he is tapped again mid-spin.
      void spin.offsetWidth;
      spin.classList.add("is-spinning");
    };
    const onEnd = () => {
      spin.classList.remove("is-spinning");
    };
    spin.addEventListener("click", onClick);
    spin.addEventListener("animationend", onEnd);
    return () => {
      spin.removeEventListener("click", onClick);
      spin.removeEventListener("animationend", onEnd);
      spin.classList.remove("is-spinning");
    };
  }, [active]);

  return null;
}
