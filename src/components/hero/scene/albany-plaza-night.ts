import type { Vec3 } from "@/lib/hero/motion";

/**
 * One Albany night, laid out in world units (y up, +z toward the camera).
 * The poster and the WebGL scene both read this. No three.js imports, so a
 * later scene can be added beside it without touching the renderer.
 *
 * Arrangement matches the river view of the Empire State Plaza: the Egg in
 * front-left, the four Agency towers and Corning Tower behind them, the
 * Alfred E. Smith building just beyond Corning, and the Capitol on the right.
 */

export type LandmarkKind = "egg" | "agency" | "corning" | "smith" | "capitol";

export type Landmark = {
  id: string;
  kind: LandmarkKind;
  /** Center of the footprint on the deck. y is the deck (0). */
  position: Vec3;
  /** Width (x), height (y), depth (z) of the main mass. */
  size: { w: number; h: number; d: number };
};

export type Anchor = {
  id: string;
  landmarkId: string;
  position: Vec3;
};

export const SCENE_ID = "albany-plaza-night" as const;

export const POSTER = {
  w: 1600,
  h: 1000,
  /** World x units to poster pixels, before the depth scale. */
  xScale: 56,
  /** World y units to poster pixels, before the depth scale. */
  yScale: 42,
  originX: 760,
  groundY: 808,
} as const;

/** Orthographic-ish poster projection. Closer (+z) reads slightly larger. */
export function projectToPoster(p: Vec3): { x: number; y: number; s: number } {
  const s = 1 + p.z * 0.026;
  const x = POSTER.originX + p.x * POSTER.xScale * s;
  const y = POSTER.groundY - p.y * POSTER.yScale * s + p.z * 4;
  return { x, y, s };
}

const AGENCY_SIZE = { w: 1.16, h: 7.05, d: 1.16 } as const;

function agency(id: string, x: number): Landmark {
  return {
    id,
    kind: "agency",
    position: { x, y: 0, z: -0.45 },
    size: AGENCY_SIZE,
  };
}

const agencyTowers: Landmark[] = [
  agency("agency-1", -4.85),
  agency("agency-2", -2.7),
  agency("agency-3", -0.55),
  agency("agency-4", 1.6),
];

const corning: Landmark = {
  id: "corning",
  kind: "corning",
  position: { x: 4.05, y: 0, z: -2.75 },
  size: { w: 1.28, h: 12.7, d: 1.28 },
};

const smith: Landmark = {
  id: "smith",
  kind: "smith",
  position: { x: 6.45, y: 0, z: -1.45 },
  size: { w: 1.52, h: 8.35, d: 1.32 },
};

const capitol: Landmark = {
  id: "capitol",
  kind: "capitol",
  position: { x: 9.85, y: 0, z: 0.7 },
  size: { w: 5.5, h: 2.7, d: 3.15 },
};

const egg: Landmark = {
  id: "egg",
  kind: "egg",
  position: { x: -6.4, y: 0, z: 0.55 },
  size: { w: 3.15, h: 3.55, d: 2.25 },
};

export const landmarks: Landmark[] = [
  egg,
  ...agencyTowers,
  corning,
  smith,
  capitol,
];

function roof(lm: Landmark, lift = 0.28): Anchor {
  return {
    id: `${lm.id}-roof`,
    landmarkId: lm.id,
    position: {
      x: lm.position.x,
      y: lm.position.y + lm.size.h + lift,
      z: lm.position.z,
    },
  };
}

function anchor(id: string, landmarkId: string, position: Vec3): Anchor {
  return { id, landmarkId, position };
}

const roofs: Anchor[] = [
  ...agencyTowers.map((lm) => roof(lm, 0.22)),
  roof(corning, 0.15),
  roof(smith, 0.2),
  anchor("capitol-roof", "capitol", {
    x: capitol.position.x,
    y: 5.15,
    z: capitol.position.z,
  }),
  anchor("egg-roof", "egg", {
    x: egg.position.x,
    y: 3.85,
    z: egg.position.z,
  }),
];

const spots: Anchor[] = [
  ...roofs.filter((item) => item.landmarkId.startsWith("agency")),
  roofs.find((item) => item.id === "corning-roof") as Anchor,
  roofs.find((item) => item.id === "smith-roof") as Anchor,
  anchor("between-agencies-a", "agency-2", {
    x: (-4.85 + -2.7) / 2,
    y: 5.55,
    z: -0.15,
  }),
  anchor("between-agencies-b", "agency-3", {
    x: (-0.55 + 1.6) / 2,
    y: 6.15,
    z: -0.1,
  }),
  anchor("egg-side", "egg", {
    x: egg.position.x + 2.15,
    y: 4.85,
    z: egg.position.z - 0.25,
  }),
  anchor("capitol-west", "capitol", {
    x: capitol.position.x - 2.25,
    y: 4.95,
    z: capitol.position.z + 0.35,
  }),
  anchor("capitol-east", "capitol", {
    x: capitol.position.x + 2.25,
    y: 4.95,
    z: capitol.position.z + 0.35,
  }),
  anchor("corning-gap", "corning", {
    x: (4.05 + 1.6) / 2,
    y: 8.5,
    z: -1.5,
  }),
];

/** Five poster perches. The lite layer hops the mascot through these, in order. */
export const posterSpotIds = [
  "agency-2-roof",
  "corning-roof",
  "egg-side",
  "capitol-west",
  "between-agencies-b",
] as const;

export type AlbanyScene = {
  id: typeof SCENE_ID;
  name: string;
  landmarks: readonly Landmark[];
  spots: readonly Anchor[];
  roofs: readonly Anchor[];
  posterSpotIds: readonly string[];
};

export const albanyPlazaNight: AlbanyScene = {
  id: SCENE_ID,
  name: "Empire State Plaza at night",
  landmarks,
  spots,
  roofs,
  posterSpotIds,
};
