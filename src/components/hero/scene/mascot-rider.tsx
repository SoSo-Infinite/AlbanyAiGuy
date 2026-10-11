"use client";

import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  clamp,
  easeInOutCubic,
  easeOutCubic,
  landingEffectAt,
  writeQuadBezier,
  yawToward,
} from "@/lib/hero/motion";
import { createRide, type Ride, stepRide } from "@/lib/hero/ride";
import { getScene } from "./scenes";
import type { CitySim } from "./sim";
import { glowMaterial, type HeroTextures } from "./textures";

const MASCOT_H = 2.35;
const MASCOT_W = MASCOT_H * (709 / 851);
const TRAIL = 8;

/**
 * The billboard faces the camera because its art front is local +z.
 * yawToward uses atan2(camera.x - obj.x, camera.z - obj.z). A click adds
 * a full turn on Y, which is the vertical axis.
 */
export function MascotRider({
  sim,
  textures,
}: {
  sim: CitySim;
  textures: HeroTextures;
}) {
  const gl = useThree((state) => state.gl);
  const spots = useMemo(
    () => getScene().spots.map((spot) => spot.position),
    [],
  );
  const ride = useRef<Ride | null>(null);
  if (ride.current === null) ride.current = createRide(spots);

  const root = useRef<THREE.Group>(null);
  const lean = useRef<THREE.Group>(null);
  const yaw = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Sprite>(null);
  const trails = useRef<(THREE.Sprite | null)[]>([]);
  const prev = useRef(new THREE.Vector3());
  const scratch = useRef({ x: 0, y: 0, z: 0 });
  const spinStart = useRef(-1);
  const trailAlpha = useRef(0);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: textures.mascot,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [textures.mascot],
  );
  const orbMat = useMemo(
    () => glowMaterial(textures.glow, "#f4fbff", 0.8),
    [textures.glow],
  );
  const ringMat = useMemo(
    () => glowMaterial(textures.ring, "#d8fbff", 0),
    [textures.ring],
  );
  const trailMats = useMemo(
    () =>
      Array.from({ length: TRAIL }, () =>
        glowMaterial(textures.glow, "#bff7ff", 0),
      ),
    [textures.glow],
  );
  const vortex = useMemo(() => buildVortex(), []);

  useEffect(() => {
    const canvas = gl.domElement;
    const clear = () => {
      canvas.style.cursor = "";
    };
    canvas.addEventListener("pointerleave", clear);
    return () => {
      canvas.removeEventListener("pointerleave", clear);
      clear();
    };
  }, [gl]);

  useEffect(() => () => vortex.dispose(), [vortex]);

  useFrame((state, delta) => {
    const current = ride.current;
    const rootGroup = root.current;
    const leanGroup = lean.current;
    const yawGroup = yaw.current;
    if (!current || !rootGroup || !leanGroup || !yawGroup) return;
    const dt = Math.min(delta, 0.05);
    const landed = stepRide(current, spots, dt);
    if (landed) {
      sim.landingId += 1;
      sim.landingEffect = landingEffectAt(current.landings - 1);
      sim.landingPos.set(
        current.position.x,
        current.position.y,
        current.position.z,
      );
      if (sim.landingEffect === "windows") {
        sim.wave = 0;
        sim.waveOrigin.copy(sim.landingPos);
      }
    }

    const bob = Math.sin(sim.time * 2.2) * 0.045;
    rootGroup.position.set(
      current.position.x,
      current.position.y + bob,
      current.position.z,
    );
    const vx = dt > 0 ? (current.position.x - prev.current.x) / dt : 0;
    prev.current.set(
      current.position.x,
      current.position.y,
      current.position.z,
    );
    const wobble =
      Math.sin(sim.time * 7.5) * (current.phase === "dash" ? 0.05 : 0.015);
    leanGroup.rotation.z = clamp(-vx * 0.08, -0.42, 0.42) + wobble;

    const camera = state.camera.position;
    let extra = 0;
    if (spinStart.current >= 0) {
      const p = (sim.time - spinStart.current) / 0.65;
      if (p >= 1) {
        spinStart.current = -1;
        sim.spin = -1;
      } else {
        sim.spin = p;
        extra = easeOutCubic(p) * Math.PI * 2;
      }
    }
    yawGroup.rotation.y =
      yawToward(current.position, {
        x: camera.x,
        y: camera.y,
        z: camera.z,
      }) + extra;

    if (current.phase === "dash") trailAlpha.current = 1;
    else trailAlpha.current = Math.max(0, trailAlpha.current - dt / 0.4);
    const along =
      current.phase === "dash"
        ? clamp(current.elapsed / Math.max(current.dashLen, 0.0001), 0, 1)
        : 1;
    const eased = easeInOutCubic(along);
    for (let i = 0; i < TRAIL; i++) {
      const sprite = trails.current[i];
      const mat = trailMats[i];
      if (!sprite || !mat) continue;
      const t = Math.max(0, eased - (i + 1) * 0.045);
      writeQuadBezier(
        scratch.current,
        current.origin,
        current.control,
        current.target,
        t,
      );
      sprite.position.set(
        scratch.current.x,
        scratch.current.y,
        scratch.current.z,
      );
      mat.opacity = (1 - i / TRAIL) * trailAlpha.current * 0.8;
      const size = 0.16 * (1 - i / (TRAIL + 2));
      sprite.scale.setScalar(size);
    }

    const spark = ring.current;
    if (spark) {
      if (sim.spin >= 0) {
        const p = sim.spin;
        spark.visible = true;
        spark.scale.setScalar(0.35 + p * 2.5);
        ringMat.opacity = (1 - p) * 0.95;
      } else {
        spark.visible = false;
        ringMat.opacity = 0;
      }
    }

    vortex.tick(sim.time);
  });

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    spinStart.current = sim.time;
    sim.spin = 0;
  };

  return (
    <>
      <group ref={root} name="mascot">
        <group ref={lean}>
          <group ref={yaw}>
            {/* Decorative spin. The canvas is aria-hidden and this mesh has no keyboard handler. */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative pointer spin inside an aria-hidden canvas */}
            <mesh
              position={[0, MASCOT_H / 2, 0]}
              material={material}
              onClick={onClick}
              onPointerOver={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                gl.domElement.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                gl.domElement.style.cursor = "";
              }}
            >
              <planeGeometry args={[MASCOT_W, MASCOT_H]} />
            </mesh>
          </group>
        </group>
        <primitive object={vortex.points} />
        <sprite
          position={[0, 0.42, 0]}
          material={orbMat}
          scale={[0.48, 0.48, 1]}
          raycast={() => {}}
        />
        <sprite
          ref={ring}
          position={[0, 1.15, 0]}
          material={ringMat}
          raycast={() => {}}
        />
      </group>
      <group>
        {trailMats.map((mat, index) => (
          <sprite
            key={mat.uuid}
            ref={(node) => {
              trails.current[index] = node;
              if (node) node.raycast = () => {};
            }}
            material={mat}
          />
        ))}
      </group>
    </>
  );
}

function buildVortex(): {
  points: THREE.Points;
  tick: (time: number) => void;
  dispose: () => void;
} {
  const count = 108;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const gold = new THREE.Color("#e0b03a");
  const cyan = new THREE.Color("#00c8f0");
  const angles = new Float32Array(count);
  const radii = new Float32Array(count);
  const heights = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    angles[i] = t * Math.PI * 8;
    radii[i] = 0.12 + t * 0.92;
    heights[i] = t * 0.72;
    const color = i % 2 === 0 ? gold : cyan;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.11,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.raycast = () => {};
  const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
  return {
    points,
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
    tick: (time: number) => {
      for (let i = 0; i < count; i++) {
        const ang = (angles[i] ?? 0) + time * 2.4;
        const r = radii[i] ?? 0;
        posAttr.setXYZ(
          i,
          Math.cos(ang) * r,
          (heights[i] ?? 0) + Math.sin(time * 2 + i) * 0.02,
          Math.sin(ang) * r,
        );
      }
      posAttr.needsUpdate = true;
    },
  };
}
