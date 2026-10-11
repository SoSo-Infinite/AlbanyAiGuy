"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  arcControl,
  clamp,
  distance3,
  easeOutBack,
  easeOutCubic,
  pickNextSpot,
  writeQuadBezier,
} from "@/lib/hero/motion";
import { getScene } from "./scenes";
import type { CitySim } from "./sim";
import { glowMaterial, type HeroTextures } from "./textures";

const POOL = 3;
const TRAIL = 6;
const SPARKS = 20;

type Slot = {
  on: boolean;
  age: number;
  dur: number;
  from: THREE.Vector3;
  ctrl: THREE.Vector3;
  to: THREE.Vector3;
  ring: number;
};

type Life = {
  group: THREE.Group;
  tick: (sim: CitySim, dt: number) => void;
  dispose: () => void;
};

function buildLife(textures: HeroTextures): Life {
  const group = new THREE.Group();
  group.name = "city-life";
  const mats: THREE.Material[] = [];
  const roofs = getScene().roofs.map(
    (roof) =>
      new THREE.Vector3(roof.position.x, roof.position.y, roof.position.z),
  );
  const slots: Slot[] = Array.from({ length: POOL }, () => ({
    on: false,
    age: 0,
    dur: 1,
    from: new THREE.Vector3(),
    ctrl: new THREE.Vector3(),
    to: new THREE.Vector3(),
    ring: -1,
  }));
  const heads: THREE.Sprite[] = [];
  const bits: THREE.Sprite[] = [];
  const rings: THREE.Sprite[] = [];
  for (let i = 0; i < POOL; i++) {
    const head = new THREE.Sprite(glowMaterial(textures.glow, "#f4feff", 0));
    const ring = new THREE.Sprite(glowMaterial(textures.ring, "#d8fbff", 0));
    mats.push(head.material, ring.material);
    head.visible = false;
    ring.visible = false;
    ring.renderOrder = 4;
    head.renderOrder = 4;
    group.add(head, ring);
    heads.push(head);
    rings.push(ring);
    for (let t = 0; t < TRAIL; t++) {
      const bit = new THREE.Sprite(glowMaterial(textures.glow, "#9af6ff", 0));
      mats.push(bit.material);
      bit.visible = false;
      bit.renderOrder = 3;
      group.add(bit);
      bits.push(bit);
    }
  }

  const sparkPos = new Float32Array(SPARKS * 3);
  const sparkVel = new Float32Array(SPARKS * 3);
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: "#ffe1a8",
    map: textures.glow,
    size: 0.16,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    fog: false,
    premultipliedAlpha: true,
  });
  mats.push(sparkMat);
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  sparks.visible = false;
  group.add(sparks);
  let sparkAge = -1;

  const phone = new THREE.Sprite(glowMaterial(textures.phone, "#e8fbff", 0));
  const check = new THREE.Sprite(glowMaterial(textures.check, "#d8ffe8", 0));
  const shake = new THREE.Sprite(glowMaterial(textures.shake, "#d8fbff", 0));
  mats.push(phone.material, check.material, shake.material);
  phone.visible = false;
  check.visible = false;
  shake.visible = false;
  group.add(phone, check, shake);
  let phoneAge = -1;
  let seenLanding = 0;
  let ambient = 1.2;
  let roofCursor = 0;
  const scratch = { x: 0, y: 0, z: 0 };
  const tmp = new THREE.Vector3();

  const place = (
    sprite: THREE.Sprite,
    v: { x: number; y: number; z: number },
  ) => {
    sprite.position.set(v.x, v.y, v.z);
  };

  const launch = (from: THREE.Vector3, to: THREE.Vector3) => {
    const slot = slots.find((item) => !item.on && item.ring < 0);
    if (!slot) return;
    slot.on = true;
    slot.age = 0;
    slot.ring = -1;
    slot.from.copy(from);
    slot.to.copy(to);
    const ctrl = arcControl(
      { x: from.x, y: from.y, z: from.z },
      { x: to.x, y: to.y, z: to.z },
    );
    slot.ctrl.set(ctrl.x, ctrl.y, ctrl.z);
    const dist = distance3(from, to);
    slot.dur = clamp(0.55 + dist * 0.06, 0.72, 1.35);
  };

  const launchBetweenRoofs = (fromIndex: number) => {
    if (roofs.length < 2) return;
    const from = roofs[fromIndex];
    if (!from) return;
    const next = pickNextSpot(roofs.length, fromIndex);
    const to = roofs[next];
    if (!to) return;
    roofCursor = next;
    launch(from, to);
  };

  group.traverse((obj) => {
    obj.raycast = () => {};
  });

  return {
    group,
    tick: (sim, dt) => {
      if (sim.landingId !== seenLanding) {
        seenLanding = sim.landingId;
        if (sim.landingEffect === "sparks") {
          sparkAge = 0;
          sparks.visible = true;
          for (let i = 0; i < SPARKS; i++) {
            const dir = (i / SPARKS) * Math.PI * 2;
            const speed = 1.4 + (i % 5) * 0.45;
            sparkPos[i * 3] = sim.landingPos.x;
            sparkPos[i * 3 + 1] = sim.landingPos.y;
            sparkPos[i * 3 + 2] = sim.landingPos.z;
            sparkVel[i * 3] = Math.cos(dir) * speed;
            sparkVel[i * 3 + 1] = 1.2 + (i % 4) * 0.35;
            sparkVel[i * 3 + 2] = Math.sin(dir) * speed;
          }
          (
            sparkGeo.getAttribute("position") as THREE.BufferAttribute
          ).needsUpdate = true;
        } else if (sim.landingEffect === "pulse") {
          let nearest = 0;
          let best = Number.POSITIVE_INFINITY;
          for (let i = 0; i < roofs.length; i++) {
            const roof = roofs[i];
            if (!roof) continue;
            const d = roof.distanceTo(sim.landingPos);
            if (d < best) {
              best = d;
              nearest = i;
            }
          }
          launchBetweenRoofs(nearest);
        } else if (sim.landingEffect === "phone") {
          phoneAge = 0;
        }
      }

      ambient += dt;
      if (ambient > 4.8) {
        ambient = 0;
        launchBetweenRoofs(roofCursor);
      }

      for (let i = 0; i < POOL; i++) {
        const slot = slots[i];
        const head = heads[i];
        const ring = rings[i];
        if (!slot || !head || !ring) continue;
        if (slot.on) {
          slot.age += dt;
          const p = clamp(slot.age / slot.dur, 0, 1);
          const eased = easeOutCubic(p);
          writeQuadBezier(scratch, slot.from, slot.ctrl, slot.to, eased);
          place(head, scratch);
          head.visible = true;
          head.material.opacity = 0.95;
          head.scale.setScalar(0.2);
          for (let t = 0; t < TRAIL; t++) {
            const bit = bits[i * TRAIL + t];
            if (!bit) continue;
            const behind = Math.max(0, eased - (t + 1) * 0.06);
            writeQuadBezier(scratch, slot.from, slot.ctrl, slot.to, behind);
            place(bit, scratch);
            bit.visible = true;
            bit.material.opacity = (1 - t / TRAIL) * 0.45;
            bit.scale.setScalar(0.1 * (1 - t / (TRAIL + 1)));
          }
          if (p >= 1) {
            slot.on = false;
            slot.ring = 0;
            head.visible = false;
            ring.position.copy(slot.to);
          }
        } else {
          head.visible = false;
          for (let t = 0; t < TRAIL; t++) {
            const bit = bits[i * TRAIL + t];
            if (bit) bit.visible = false;
          }
        }
        if (slot.ring >= 0) {
          slot.ring += dt;
          const p = clamp(slot.ring / 0.7, 0, 1);
          ring.visible = true;
          ring.scale.setScalar(0.2 + p * 1.15);
          ring.material.opacity = (1 - p) * 0.85;
          if (p >= 1) {
            slot.ring = -1;
            ring.visible = false;
          }
        }
      }

      if (sparkAge >= 0) {
        sparkAge += dt;
        const fade = 1 - clamp(sparkAge / 0.8, 0, 1);
        for (let i = 0; i < SPARKS; i++) {
          const vx = sparkVel[i * 3] ?? 0;
          const vy = sparkVel[i * 3 + 1] ?? 0;
          const vz = sparkVel[i * 3 + 2] ?? 0;
          sparkPos[i * 3] = (sparkPos[i * 3] ?? 0) + vx * dt;
          sparkPos[i * 3 + 1] = (sparkPos[i * 3 + 1] ?? 0) + vy * dt;
          sparkPos[i * 3 + 2] = (sparkPos[i * 3 + 2] ?? 0) + vz * dt;
          sparkVel[i * 3 + 1] = vy - 2.4 * dt;
        }
        (
          sparkGeo.getAttribute("position") as THREE.BufferAttribute
        ).needsUpdate = true;
        sparkMat.opacity = fade;
        sparks.visible = fade > 0.02;
        if (sparkAge > 0.8) sparkAge = -1;
      }

      if (phoneAge >= 0) {
        phoneAge += dt;
        const pop = easeOutBack(clamp(phoneAge / 0.28, 0, 1));
        tmp.copy(sim.landingPos);
        tmp.y += 1.05;
        phone.position.copy(tmp);
        check.position.copy(tmp);
        shake.position.copy(tmp);
        const showPhone = phoneAge < 1.15;
        const showCheck = phoneAge >= 0.9 && phoneAge < 1.85;
        phone.visible = showPhone;
        check.visible = showCheck;
        phone.scale.setScalar(0.95 * pop);
        check.scale.setScalar(0.95 * pop);
        phone.material.opacity = showPhone
          ? phoneAge < 0.9
            ? 1
            : 1 - (phoneAge - 0.9) / 0.25
          : 0;
        check.material.opacity = showCheck
          ? clamp((phoneAge - 0.9) / 0.2, 0, 1) *
            (phoneAge < 1.45 ? 1 : 1 - (phoneAge - 1.45) / 0.4)
          : 0;
        const shaking = phoneAge > 0.12 && phoneAge < 0.92;
        shake.visible = shaking;
        shake.material.opacity = shaking ? 0.85 : 0;
        shake.material.rotation = shaking
          ? Math.sin(phoneAge * Math.PI * 2 * 2.2) * 0.08
          : 0;
        phone.material.rotation = shaking
          ? Math.sin(phoneAge * Math.PI * 2 * 2.2) * 0.12
          : 0;
        if (phoneAge > 1.9) {
          phoneAge = -1;
          phone.visible = false;
          check.visible = false;
          shake.visible = false;
        }
      }
    },
    dispose: () => {
      sparkGeo.dispose();
      for (const mat of mats) mat.dispose();
    },
  };
}

export function CityLife({
  sim,
  textures,
}: {
  sim: CitySim;
  textures: HeroTextures;
}) {
  const life = useMemo(() => buildLife(textures), [textures]);
  useEffect(() => () => life.dispose(), [life]);
  useFrame((_, delta) => {
    life.tick(sim, Math.min(delta, 0.05));
  });
  return <primitive object={life.group} />;
}
