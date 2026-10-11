import * as THREE from "three";
import type { LandingEffect } from "@/lib/hero/motion";

/** Mutable per-frame state shared inside the canvas. Not React state. */
export type CitySim = {
  time: number;
  wave: number;
  waveOrigin: THREE.Vector3;
  landingId: number;
  landingEffect: LandingEffect | null;
  landingPos: THREE.Vector3;
  spin: number;
};

export function createSim(): CitySim {
  return {
    time: 0,
    wave: -1,
    waveOrigin: new THREE.Vector3(),
    landingId: 0,
    landingEffect: null,
    landingPos: new THREE.Vector3(),
    spin: -1,
  };
}
