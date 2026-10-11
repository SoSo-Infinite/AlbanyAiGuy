"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  decideHeroMode,
  type HeroCapability,
  type HeroMode,
} from "@/lib/hero/motion";
import { HeroLite } from "./hero-lite";

const HeroCanvas = dynamic(
  () => import(/* webpackChunkName: "hero-webgl" */ "./scene/hero-canvas"),
  { ssr: false, loading: () => null },
);

function readCapability(webgl2: boolean): HeroCapability {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    viewportWidth: window.innerWidth,
    saveData: nav.connection?.saveData === true,
    deviceMemory:
      typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    hardwareConcurrency:
      typeof nav.hardwareConcurrency === "number"
        ? nav.hardwareConcurrency
        : null,
    webgl2,
  };
}

function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

/**
 * Decides still / lite / webgl, listens for reduced-motion and viewport
 * changes, and loads the WebGL scene only after window load plus an idle
 * callback. three.js stays out of the initial bundle.
 */
export function HeroLoader() {
  const [mode, setMode] = useState<HeroMode | null>(null);
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let webgl2 = false;
    try {
      webgl2 = detectWebGL2();
    } catch {
      webgl2 = false;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setMode(decideHeroMode(readCapability(webgl2)));
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

  useEffect(() => {
    const stage = document.getElementById("home-hero");
    if (!stage || !mode) return;
    const shown = blocked && mode === "webgl" ? "lite" : mode;
    stage.dataset.mode = shown;
    if (shown !== "webgl" || !ready) delete stage.dataset.webgl;
    else stage.dataset.webgl = "on";
  }, [mode, ready, blocked]);

  useEffect(() => {
    if (mode !== "webgl" || blocked) {
      setIdle(false);
      setReady(false);
      return;
    }
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const start = () => {
      if (cancelled) return;
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        idleId = ric(
          () => {
            if (!cancelled) setIdle(true);
          },
          { timeout: 1800 },
        );
      } else {
        timeoutId = window.setTimeout(() => {
          if (!cancelled) setIdle(true);
        }, 250);
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [mode, blocked]);

  useEffect(() => {
    const stage = document.getElementById("home-hero");
    if (!stage) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / Math.max(rect.height, 1)),
      );
      stage.style.setProperty("--hero-scroll", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const onFirstFrame = useCallback(() => {
    setReady(true);
  }, []);
  const onFail = useCallback(() => {
    setBlocked(true);
    setReady(false);
    setIdle(false);
  }, []);

  const showWebGL = mode === "webgl" && idle && !blocked;
  const showLite = mode === "lite" || (blocked && mode === "webgl");

  return (
    <>
      <HeroLite active={showLite} />
      {showWebGL ? (
        <div
          className={ready ? "hero-webgl is-ready" : "hero-webgl"}
          aria-hidden="true"
        >
          <HeroCanvas onFirstFrame={onFirstFrame} onFail={onFail} />
        </div>
      ) : null}
    </>
  );
}
