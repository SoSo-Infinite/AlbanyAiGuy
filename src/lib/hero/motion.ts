/**
 * Pure hero helpers. No three.js and no Next.js, so node:test can import this
 * file directly. The WebGL scene and the lite poster both call these.
 */

export type HeroMode = "still" | "lite" | "webgl";

export type HeroCapability = {
  reducedMotion: boolean;
  /** CSS viewport width in pixels. */
  viewportWidth: number;
  saveData: boolean;
  /** null when the browser does not report the value. */
  deviceMemory: number | null;
  /** null when the browser does not report the value. */
  hardwareConcurrency: number | null;
  webgl2: boolean;
};

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export const LANDING_EFFECTS = ["sparks", "windows", "pulse", "phone"] as const;

export type LandingEffect = (typeof LANDING_EFFECTS)[number];

/** Reduced motion wins. Phones, Save-Data, low memory, low CPU, or no WebGL2 stay on the lite poster. */
export function decideHeroMode(input: HeroCapability): HeroMode {
  if (input.reducedMotion) return "still";
  if (input.viewportWidth < 768) return "lite";
  if (input.saveData) return "lite";
  if (input.deviceMemory != null && input.deviceMemory < 4) return "lite";
  if (input.hardwareConcurrency != null && input.hardwareConcurrency < 4) {
    return "lite";
  }
  if (!input.webgl2) return "lite";
  return "webgl";
}

/**
 * Next index in `[0, count)`. Never equal to `previous` when there is more
 * than one spot. `previous` of -1 (or anything outside the range) means there
 * is no prior spot.
 */
export function pickNextSpot(
  count: number,
  previous: number,
  random: () => number = Math.random,
): number {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("spot count must be a positive integer");
  }
  const u = clamp(random(), 0, 0.999999);
  if (count === 1) return 0;
  const hasPrev = previous >= 0 && previous < count;
  if (!hasPrev) return Math.floor(u * count);
  const slot = Math.floor(u * (count - 1));
  return slot >= previous ? slot + 1 : slot;
}

/** Hold still on a rooftop for 2 to 4 seconds. */
export function pauseSeconds(random: () => number = Math.random): number {
  return 2 + clamp(random(), 0, 0.999999) * 2;
}

/** Fast dash. Longer gaps take a little longer, but he never strolls. */
export function dashSeconds(distance: number): number {
  return clamp(0.42 + Math.max(0, distance) * 0.055, 0.48, 1.15);
}

export function landingEffectAt(index: number): LandingEffect {
  const n = LANDING_EFFECTS.length;
  const i = ((Math.floor(index) % n) + n) % n;
  return LANDING_EFFECTS[i] ?? "sparks";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function clamp01(t: number): number {
  return clamp(t, 0, 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Slow start, slow settle. Used for rooftop dashes. */
export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** Arrivals and the click-spin. */
export function easeOutCubic(t: number): number {
  const x = 1 - clamp01(t);
  return 1 - x * x * x;
}

/** Small overshoot for the phone pop. */
export function easeOutBack(t: number): number {
  const x = clamp01(t);
  const c = 1.35;
  const u = x - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
}

export function distance3(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function quadBezier(a: number, b: number, c: number, t: number): number {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

export function quadBezierVec(a: Vec3, b: Vec3, c: Vec3, t: number): Vec3 {
  const out = { x: 0, y: 0, z: 0 };
  return writeQuadBezier(out, a, b, c, t);
}

/** Writes the quadratic bezier into `out` so the animation loop can reuse it. */
export function writeQuadBezier(
  out: Vec3,
  a: Vec3,
  b: Vec3,
  c: Vec3,
  t: number,
): Vec3 {
  const u = 1 - t;
  const w0 = u * u;
  const w1 = 2 * u * t;
  const w2 = t * t;
  out.x = w0 * a.x + w1 * b.x + w2 * c.x;
  out.y = w0 * a.y + w1 * b.y + w2 * c.y;
  out.z = w0 * a.z + w1 * b.z + w2 * c.z;
  return out;
}

/**
 * Yaw for a mesh whose front is local +z, so that +z points at `target`.
 * Camera on +z and the mesh at the origin: atan2(0, +z) = 0, and local +z
 * stays world +z, which is the direction toward the camera.
 */
export function yawToward(from: Vec3, target: Vec3): number {
  return Math.atan2(target.x - from.x, target.z - from.z);
}

/** A lifted midpoint so dashes and call-pulses arc instead of cutting straight. */
export function arcControl(
  a: Vec3,
  b: Vec3,
  random: () => number = Math.random,
): Vec3 {
  const lift = 0.85 + clamp(random(), 0, 0.999999) * 1.5;
  const sway = clamp(random(), 0, 0.999999) - 0.5;
  return {
    x: (a.x + b.x) / 2 + sway * 1.6,
    y: Math.max(a.y, b.y) + lift + Math.abs(b.x - a.x) * 0.06,
    z: (a.z + b.z) / 2 + (clamp(random(), 0, 0.999999) - 0.5) * 0.8,
  };
}

/** Deterministic 0..1 hash for stable poster stars and window colors. */
export function hashUnit(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
