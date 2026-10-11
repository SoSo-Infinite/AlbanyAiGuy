import {
  arcControl,
  clamp01,
  dashSeconds,
  distance3,
  easeInOutCubic,
  pauseSeconds,
  pickNextSpot,
  type Vec3,
  writeQuadBezier,
} from "./motion";

/** Mascot path. Plain data so tests can step it without three.js. */
export type Ride = {
  phase: "pause" | "dash";
  elapsed: number;
  hold: number;
  dashLen: number;
  from: number;
  to: number;
  /** Start of the current or previous dash. Kept so the trail can fade. */
  origin: Vec3;
  control: Vec3;
  target: Vec3;
  position: Vec3;
  landings: number;
};

function copyVec(out: Vec3, v: Vec3) {
  out.x = v.x;
  out.y = v.y;
  out.z = v.z;
}

export function createRide(
  spots: readonly Vec3[],
  random: () => number = Math.random,
): Ride {
  const first = spots[0];
  if (!first) throw new Error("ride needs a spot");
  const origin = { x: first.x, y: first.y, z: first.z };
  return {
    phase: "pause",
    elapsed: 0,
    hold: pauseSeconds(random),
    dashLen: 0,
    from: 0,
    to: 0,
    origin,
    control: { x: origin.x, y: origin.y, z: origin.z },
    target: { x: origin.x, y: origin.y, z: origin.z },
    position: { x: origin.x, y: origin.y, z: origin.z },
    landings: 0,
  };
}

/**
 * Advance the ride by `dt` seconds. Returns true on the frame he arrives.
 * The next spot is never the one he just left when there is more than one.
 */
export function stepRide(
  ride: Ride,
  spots: readonly Vec3[],
  dt: number,
  random: () => number = Math.random,
): boolean {
  ride.elapsed += Math.max(0, dt);
  if (ride.phase === "pause") {
    if (ride.elapsed < ride.hold) return false;
    const next = pickNextSpot(spots.length, ride.from, random);
    const spot = spots[next];
    if (!spot) return false;
    copyVec(ride.origin, ride.position);
    copyVec(ride.target, spot);
    copyVec(ride.control, arcControl(ride.origin, ride.target, random));
    ride.dashLen = dashSeconds(distance3(ride.origin, ride.target));
    ride.to = next;
    ride.phase = "dash";
    ride.elapsed = 0;
    return false;
  }

  const t = clamp01(ride.dashLen <= 0 ? 1 : ride.elapsed / ride.dashLen);
  writeQuadBezier(
    ride.position,
    ride.origin,
    ride.control,
    ride.target,
    easeInOutCubic(t),
  );
  if (t < 1) return false;
  copyVec(ride.position, ride.target);
  ride.from = ride.to;
  ride.landings += 1;
  ride.phase = "pause";
  ride.elapsed = 0;
  ride.hold = pauseSeconds(random);
  return true;
}
