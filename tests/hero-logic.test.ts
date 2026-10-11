import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dashSeconds,
  decideHeroMode,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  type HeroCapability,
  landingEffectAt,
  mulberry32,
  pauseSeconds,
  pickNextSpot,
  writeQuadBezier,
  yawToward,
} from "@/lib/hero/motion";
import { createRide, stepRide } from "@/lib/hero/ride";

const capable: HeroCapability = {
  reducedMotion: false,
  viewportWidth: 1280,
  saveData: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  webgl2: true,
};

describe("hero capability", () => {
  it("stays still when reduced motion is requested", () => {
    assert.equal(
      decideHeroMode({
        ...capable,
        reducedMotion: true,
        viewportWidth: 390,
        saveData: true,
        deviceMemory: 2,
        webgl2: false,
      }),
      "still",
    );
  });

  it("stays lite on a phone, Save-Data, low memory, low CPU, or no WebGL2", () => {
    assert.equal(decideHeroMode({ ...capable, viewportWidth: 767 }), "lite");
    assert.equal(decideHeroMode({ ...capable, viewportWidth: 768 }), "webgl");
    assert.equal(decideHeroMode({ ...capable, saveData: true }), "lite");
    assert.equal(decideHeroMode({ ...capable, deviceMemory: 3 }), "lite");
    assert.equal(decideHeroMode({ ...capable, deviceMemory: 4 }), "webgl");
    assert.equal(decideHeroMode({ ...capable, deviceMemory: null }), "webgl");
    assert.equal(
      decideHeroMode({ ...capable, hardwareConcurrency: 2 }),
      "lite",
    );
    assert.equal(
      decideHeroMode({ ...capable, hardwareConcurrency: 4 }),
      "webgl",
    );
    assert.equal(
      decideHeroMode({ ...capable, hardwareConcurrency: null }),
      "webgl",
    );
    assert.equal(decideHeroMode({ ...capable, webgl2: false }), "lite");
  });

  it("uses WebGL when the machine can take it", () => {
    assert.equal(decideHeroMode(capable), "webgl");
  });
});

describe("hero motion helpers", () => {
  it("never repeats a spot and stays in bounds", () => {
    for (let count = 2; count <= 12; count++) {
      let previous = -1;
      for (let i = 0; i < 80; i++) {
        const next = pickNextSpot(
          count,
          previous,
          () => ((i * 17) % 100) / 100,
        );
        assert.equal(Number.isInteger(next), true);
        assert.ok(next >= 0 && next < count);
        assert.notEqual(next, previous);
        previous = next;
      }
    }
    assert.equal(
      pickNextSpot(1, 0, () => 0.5),
      0,
    );
    assert.equal(
      pickNextSpot(5, -1, () => 0),
      0,
    );
    assert.equal(
      pickNextSpot(5, 99, () => 0.99),
      4,
    );
    assert.throws(() => pickNextSpot(0, 0));
  });

  it("keeps pauses, dashes, and easing inside their ranges", () => {
    assert.equal(
      pauseSeconds(() => 0),
      2,
    );
    assert.ok(pauseSeconds(() => 1) < 4);
    assert.equal(dashSeconds(0), 0.48);
    assert.equal(dashSeconds(100), 1.15);
    assert.equal(easeInOutCubic(0), 0);
    assert.equal(easeInOutCubic(1), 1);
    assert.ok(Math.abs(easeOutCubic(1) - 1) < 1e-9);
    assert.equal(easeOutBack(0), 0);
    assert.equal(easeOutBack(1), 1);
    const end = writeQuadBezier(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 4, z: 0 },
      { x: 2, y: 0, z: 2 },
      1,
    );
    assert.deepEqual(end, { x: 2, y: 0, z: 2 });
    assert.deepEqual(
      [0, 1, 2, 3, 4].map((index) => landingEffectAt(index)),
      ["sparks", "windows", "pulse", "phone", "sparks"],
    );
  });

  it("rides to a new spot and never lands on the same one twice", () => {
    const spots = Array.from({ length: 8 }, (_, index) => ({
      x: index * 2,
      y: 3,
      z: -1,
    }));
    const random = mulberry32(11);
    const ride = createRide(spots, random);
    assert.ok(ride.hold >= 2 && ride.hold <= 4);
    let last = -1;
    let landings = 0;
    for (let step = 0; step < 500; step++) {
      const landed = stepRide(ride, spots, 0.05, random);
      assert.ok(Number.isFinite(ride.position.x));
      assert.ok(Number.isFinite(ride.position.y));
      assert.ok(Number.isFinite(ride.position.z));
      if (ride.phase === "pause") {
        const parked = spots.some(
          (spot) =>
            Math.hypot(
              spot.x - ride.position.x,
              spot.y - ride.position.y,
              spot.z - ride.position.z,
            ) < 1e-6,
        );
        assert.equal(parked, true);
      }
      if (landed) {
        assert.notEqual(ride.from, last);
        assert.ok(ride.from >= 0 && ride.from < spots.length);
        last = ride.from;
        landings += 1;
        assert.ok(ride.dashLen >= 0.48 && ride.dashLen <= 1.15);
      }
    }
    assert.ok(landings > 4);
  });

  it("faces a +z-fronted billboard toward the camera", () => {
    const from = { x: 0, y: 5, z: 0 };
    assert.equal(yawToward(from, { x: 0, y: 5, z: 12 }), 0);
    assert.ok(
      Math.abs(yawToward(from, { x: 9, y: 1, z: 0 }) - Math.PI / 2) < 1e-9,
    );
  });
});
