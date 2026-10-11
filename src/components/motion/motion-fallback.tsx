"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One IntersectionObserver for every .reveal on the page. Browsers that
 * understand animation-timeline: view() never get this class, so the CSS
 * timeline does the work and this effect stays idle.
 */
export function MotionFallback() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    if (CSS.supports("animation-timeline: view()")) return;

    const root = document.documentElement;
    root.classList.add("motion-io");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.remove("reveal-wait");
          el.classList.add("reveal-in");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    for (const node of document.querySelectorAll(".reveal")) {
      const el = node as HTMLElement;
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) {
        el.classList.add("reveal-shown");
      } else {
        el.classList.add("reveal-wait");
        io.observe(el);
      }
    }

    return () => {
      io.disconnect();
      root.classList.remove("motion-io");
    };
  }, [pathname]);

  return null;
}
