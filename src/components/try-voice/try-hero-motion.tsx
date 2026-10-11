"use client";

import { useEffect } from "react";

/**
 * Sets data-motion on the try hero. Still, phone, or desk.
 * The poster is already painted. This does not load WebGL.
 */
export function TryHeroMotion() {
  useEffect(() => {
    const stage = document.getElementById("try-hero");
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      if (reduce.matches) stage.dataset.motion = "still";
      else if (narrow.matches) stage.dataset.motion = "phone";
      else stage.dataset.motion = "desk";
    };
    apply();
    reduce.addEventListener("change", apply);
    narrow.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      reduce.removeEventListener("change", apply);
      narrow.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);
  return null;
}
