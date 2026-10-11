import * as THREE from "three";
import type { AlbanyScene, Landmark } from "./albany-plaza-night";
import { chateauRoofGeometry } from "./geometry";
import {
  EGG_FRAG,
  HORIZON_FRAG,
  HORIZON_VERT,
  ROOF_FRAG,
  SKY_FRAG,
  SKY_VERT,
  STEM_FRAG,
  WATER_FRAG,
  WATER_VERT,
  WINDOW_FRAG,
  WINDOW_VERT,
} from "./shaders";
import type { CitySim } from "./sim";
import { glowMaterial, type HeroTextures } from "./textures";

export type CityBuild = {
  group: THREE.Group;
  /** Adds the next slice of the city. Returns true when nothing is left. */
  advance: () => boolean;
  tick: (sim: CitySim, dt: number, camera: THREE.Camera) => void;
  dispose: () => void;
};

function need(scene: AlbanyScene, kind: Landmark["kind"]): Landmark {
  const found = scene.landmarks.find((item) => item.kind === kind);
  if (!found) throw new Error(`Missing landmark ${kind}`);
  return found;
}

const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();

/**
 * Procedural Empire State Plaza, built a few meshes per frame so the
 * first WebGL setup does not land as one long task.
 */
export function createCityBuild(
  scene: AlbanyScene,
  textures: HeroTextures,
): CityBuild {
  const group = new THREE.Group();
  group.name = "albany-plaza-night";
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const seen = new Set<THREE.Material>();

  const addMat = (mat: THREE.Material) => {
    if (!seen.has(mat)) {
      seen.add(mat);
      mats.push(mat);
    }
    return mat;
  };
  const addGeo = (geo: THREE.BufferGeometry) => {
    geos.push(geo);
    return geo;
  };
  const mute = (obj: THREE.Object3D) => {
    obj.traverse((child) => {
      child.raycast = () => {};
    });
  };

  const timeU = { value: 0 };
  const waveU = { value: -1 };
  const originU = { value: new THREE.Vector3() };
  const moonU = { value: new THREE.Vector3(12, 18, -10) };

  // Clone fog uniforms per material, but keep the animated ones as shared
  // objects. UniformsUtils.merge would copy the number values and the
  // clock would stop reaching the shaders.
  const shared = () => ({
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    uTime: timeU,
    uWave: waveU,
    uWaveOrigin: originU,
  });

  const addWindows = (
    facade: string,
    seed: number,
    cols: number,
    rows: number,
    boost: number,
    kind = 0,
  ) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...shared(),
        uGrid: { value: new THREE.Vector2(cols, rows) },
        uFacade: { value: new THREE.Color(facade) },
        uGold: { value: new THREE.Color("#e0b03a") },
        uCyan: { value: new THREE.Color("#00c8f0") },
        uSeed: { value: seed },
        uKind: { value: kind },
        uBoost: { value: boost },
      },
      vertexShader: WINDOW_VERT,
      fragmentShader: WINDOW_FRAG,
      fog: true,
    });
    addMat(mat);
    return mat;
  };

  const litShader = (fragment: string) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: shared(),
      vertexShader: WINDOW_VERT,
      fragmentShader: fragment,
      fog: true,
    });
    addMat(mat);
    return mat;
  };

  const stone = addMat(new THREE.MeshBasicMaterial({ color: "#141a24" }));
  const crownMat = addMat(new THREE.MeshBasicMaterial({ color: "#07090d" }));
  const roofMat = litShader(ROOF_FRAG);
  const stemMat = litShader(STEM_FRAG);
  const eggMat = litShader(EGG_FRAG);

  let sky: THREE.Object3D | null = null;
  let beacon: THREE.Sprite | null = null;
  let beaconCore: THREE.Sprite | null = null;

  const cluster = (
    x: number,
    y: number,
    z: number,
    color: string,
    sx: number,
    sy: number,
    opacity: number,
  ) => {
    const sprite = new THREE.Sprite(
      glowMaterial(textures.glow, color, opacity),
    );
    addMat(sprite.material);
    sprite.position.set(x, y, z);
    sprite.scale.set(sx, sy, 1);
    sprite.renderOrder = 3;
    group.add(sprite);
  };

  const placeBox = (lm: Landmark, material: THREE.Material): THREE.Mesh => {
    const mesh = new THREE.Mesh(
      addGeo(new THREE.BoxGeometry(lm.size.w, lm.size.h, lm.size.d)),
      material,
    );
    mesh.position.set(lm.position.x, lm.size.h / 2, lm.position.z);
    group.add(mesh);
    return mesh;
  };

  const steps: Array<() => void> = [
    () => {
      const skyMat = new THREE.ShaderMaterial({
        uniforms: { uTime: timeU, uMoon: moonU },
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
      });
      addMat(skyMat);
      const skyMesh = new THREE.Mesh(
        addGeo(new THREE.SphereGeometry(110, 32, 22)),
        skyMat,
      );
      skyMesh.frustumCulled = false;
      skyMesh.renderOrder = -10;
      group.add(skyMesh);
      sky = skyMesh;

      const streaks = new Float32Array(8);
      const waterWidth = 96;
      const waterX = 1.2;
      for (let i = 0; i < 8; i++) {
        const roof = scene.roofs[i % scene.roofs.length];
        const x =
          (roof ? roof.position.x : 0) + (i >= scene.roofs.length ? 0.55 : 0);
        streaks[i] = Math.min(
          0.98,
          Math.max(0.02, (x - waterX + waterWidth / 2) / waterWidth),
        );
      }
      const waterMat = new THREE.ShaderMaterial({
        uniforms: {
          ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
          uTime: timeU,
          uStreaks: { value: streaks },
        },
        vertexShader: WATER_VERT,
        fragmentShader: WATER_FRAG,
        transparent: true,
        depthWrite: false,
        fog: true,
      });
      addMat(waterMat);
      const water = new THREE.Mesh(
        addGeo(new THREE.PlaneGeometry(waterWidth, 72)),
        waterMat,
      );
      water.rotation.x = -Math.PI / 2;
      water.position.set(1.2, 0.02, 6);
      water.renderOrder = 1;
      group.add(water);

      const plaza = new THREE.Mesh(
        addGeo(new THREE.BoxGeometry(26, 0.08, 7.2)),
        addMat(new THREE.MeshBasicMaterial({ color: "#0c121a" })),
      );
      plaza.position.set(1.7, 0.02, -1.05);
      group.add(plaza);

      const horizon = new THREE.Mesh(
        addGeo(new THREE.PlaneGeometry(88, 7.5)),
        addMat(
          new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: HORIZON_VERT,
            fragmentShader: HORIZON_FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false,
          }),
        ),
      );
      horizon.position.set(2.4, 7.6, -9);
      horizon.renderOrder = 0;
      group.add(horizon);
    },
    () => {
      const agencies = scene.landmarks.filter((item) => item.kind === "agency");
      const agencyMat = addWindows("#243044", 1.3, 4, 16, 1.2);
      const agencyGeo = addGeo(new THREE.BoxGeometry(1, 1, 1));
      const agencyMesh = new THREE.InstancedMesh(
        agencyGeo,
        agencyMat,
        agencies.length,
      );
      const matrix = new THREE.Matrix4();
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      for (let i = 0; i < agencies.length; i++) {
        const lm = agencies[i];
        if (!lm) continue;
        pos.set(lm.position.x, lm.size.h / 2, lm.position.z);
        scale.set(lm.size.w, lm.size.h, lm.size.d);
        matrix.compose(pos, quat, scale);
        agencyMesh.setMatrixAt(i, matrix);
      }
      agencyMesh.instanceMatrix.needsUpdate = true;
      agencyMesh.computeBoundingSphere();
      group.add(agencyMesh);
    },
    () => {
      const corning = need(scene, "corning");
      placeBox(corning, addWindows("#1c2838", 3.1, 4, 24, 1.35));
      const band = new THREE.Mesh(
        addGeo(
          new THREE.BoxGeometry(
            corning.size.w * 1.06,
            0.46,
            corning.size.d * 1.06,
          ),
        ),
        crownMat,
      );
      band.position.set(
        corning.position.x,
        corning.size.h - 0.7,
        corning.position.z,
      );
      group.add(band);
      const antenna = new THREE.Mesh(
        addGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6)),
        crownMat,
      );
      antenna.position.set(
        corning.position.x,
        corning.size.h + 0.35,
        corning.position.z,
      );
      group.add(antenna);
      beacon = new THREE.Sprite(glowMaterial(textures.glow, "#ff3b4e", 0.95));
      addMat(beacon.material);
      beacon.position.set(
        corning.position.x,
        corning.size.h + 0.42,
        corning.position.z,
      );
      beacon.scale.setScalar(1.35);
      beacon.renderOrder = 4;
      group.add(beacon);
      beaconCore = new THREE.Sprite(glowMaterial(textures.glow, "#ffe8ea", 1));
      addMat(beaconCore.material);
      beaconCore.position.copy(beacon.position);
      beaconCore.scale.setScalar(0.28);
      beaconCore.renderOrder = 5;
      group.add(beaconCore);
    },
    () => {
      const smith = need(scene, "smith");
      placeBox(smith, addWindows("#2c2820", 8.4, 5, 18, 1.15));
      const stepsUp = [
        { y: smith.size.h + 0.18, w: 1.2, h: 0.36, d: 1.05 },
        { y: smith.size.h + 0.55, w: 0.86, h: 0.34, d: 0.78 },
        { y: smith.size.h + 0.95, w: 0.48, h: 0.5, d: 0.48 },
      ];
      for (const step of stepsUp) {
        const mesh = new THREE.Mesh(
          addGeo(new THREE.BoxGeometry(step.w, step.h, step.d)),
          stone,
        );
        mesh.position.set(smith.position.x, step.y, smith.position.z);
        group.add(mesh);
      }
    },
    () => {
      const capitol = need(scene, "capitol");
      placeBox(capitol, addWindows("#4a342c", 5.5, 12, 6, 1.7));
      const plinth = new THREE.Mesh(
        addGeo(
          new THREE.BoxGeometry(
            capitol.size.w + 0.7,
            0.28,
            capitol.size.d + 0.45,
          ),
        ),
        stone,
      );
      plinth.position.set(capitol.position.x, 0.14, capitol.position.z);
      group.add(plinth);
      const roof = new THREE.Mesh(
        addGeo(
          chateauRoofGeometry(
            capitol.size.w * 0.74,
            1.85,
            capitol.size.d * 0.7,
          ),
        ),
        roofMat,
      );
      roof.position.set(capitol.position.x, capitol.size.h, capitol.position.z);
      group.add(roof);

      const turretMat = addWindows("#3a342c", 11.2, 3, 8, 1.25);
      const turretGeo = addGeo(new THREE.CylinderGeometry(0.4, 0.44, 1, 10));
      const coneGeo = addGeo(new THREE.ConeGeometry(0.58, 1, 10));
      const turretPlaces = [
        { x: -2.25, z: 0.35 },
        { x: 2.25, z: 0.35 },
        { x: -2.45, z: -1.35 },
        { x: 2.45, z: -1.35 },
      ];
      const turretH = 4.9;
      const turrets = new THREE.InstancedMesh(
        turretGeo,
        turretMat,
        turretPlaces.length,
      );
      const cones = new THREE.InstancedMesh(
        coneGeo,
        roofMat,
        turretPlaces.length,
      );
      const matrix = new THREE.Matrix4();
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      for (let i = 0; i < turretPlaces.length; i++) {
        const place = turretPlaces[i];
        if (!place) continue;
        pos.set(
          capitol.position.x + place.x,
          turretH / 2,
          capitol.position.z + place.z,
        );
        scale.set(1, turretH, 1);
        matrix.compose(pos, quat, scale);
        turrets.setMatrixAt(i, matrix);
        pos.y = turretH + 0.48;
        scale.set(1, 0.96, 1);
        matrix.compose(pos, quat, scale);
        cones.setMatrixAt(i, matrix);
      }
      turrets.instanceMatrix.needsUpdate = true;
      cones.instanceMatrix.needsUpdate = true;
      turrets.computeBoundingSphere();
      cones.computeBoundingSphere();
      group.add(turrets, cones);
    },
    () => {
      const egg = need(scene, "egg");
      const eggGroup = new THREE.Group();
      eggGroup.position.set(egg.position.x, 0, egg.position.z);
      const stem = new THREE.Mesh(
        addGeo(new THREE.CylinderGeometry(0.38, 0.92, 1.45, 20)),
        stemMat,
      );
      stem.position.y = 0.72;
      eggGroup.add(stem);
      const shell = new THREE.Mesh(
        addGeo(new THREE.SphereGeometry(1, 40, 28)),
        eggMat,
      );
      shell.scale.set(1.22, 1.96, 1.05);
      shell.position.set(0.04, 2.42, 0);
      shell.rotation.set(0.04, 0.15, -0.28);
      eggGroup.add(shell);
      const uplight = new THREE.Sprite(
        glowMaterial(textures.glow, "#ffb15a", 0.62),
      );
      addMat(uplight.material);
      uplight.position.set(0.1, 0.72, 0.35);
      uplight.scale.set(3.4, 1.5, 1);
      uplight.renderOrder = 2;
      eggGroup.add(uplight);
      group.add(eggGroup);
    },
    () => {
      for (const lm of scene.landmarks) {
        const front = lm.position.z + lm.size.d * 0.55;
        if (lm.kind === "agency") {
          cluster(
            lm.position.x,
            lm.size.h * 0.58,
            front,
            lm.position.x < -2 ? "#e0b03a" : "#7ee7ff",
            1.7,
            3.6,
            0.22,
          );
        } else if (lm.kind === "corning") {
          cluster(
            lm.position.x,
            lm.size.h * 0.38,
            front,
            "#e0b03a",
            1.7,
            4.2,
            0.26,
          );
          cluster(
            lm.position.x,
            lm.size.h * 0.72,
            front,
            "#9aefff",
            1.5,
            3.4,
            0.2,
          );
        } else if (lm.kind === "smith") {
          cluster(
            lm.position.x,
            lm.size.h * 0.55,
            front,
            "#e7c56a",
            1.6,
            3.8,
            0.2,
          );
        } else if (lm.kind === "capitol") {
          cluster(
            lm.position.x,
            lm.size.h * 0.55,
            lm.position.z + lm.size.d * 0.55,
            "#ffc56a",
            5.4,
            1.7,
            0.28,
          );
        }
      }
    },
  ];

  let cursor = 0;

  return {
    group,
    advance: () => {
      const step = steps[cursor];
      if (!step) return true;
      step();
      mute(group);
      cursor += 1;
      return cursor >= steps.length;
    },
    tick: (sim, dt, camera) => {
      timeU.value = sim.time;
      waveU.value = sim.wave;
      originU.value.copy(sim.waveOrigin);
      if (sim.wave >= 0) {
        sim.wave += dt / 1.25;
        if (sim.wave > 1) sim.wave = -1;
      }
      if (sky) sky.position.copy(camera.position);
      camera.getWorldDirection(_fwd);
      _right.setFromMatrixColumn(camera.matrixWorld, 0);
      _up.setFromMatrixColumn(camera.matrixWorld, 1);
      moonU.value
        .copy(_fwd)
        .addScaledVector(_right, 0.28)
        .addScaledVector(_up, 0.24);
      if (beacon && beaconCore) {
        const blink = 0.5 + 0.5 * Math.sin(sim.time * Math.PI * 2 * 0.32);
        beacon.material.opacity = 0.62 + blink * 0.38;
        beacon.scale.setScalar(1.25 + blink * 0.45);
        beaconCore.material.opacity = 0.75 + blink * 0.25;
        beaconCore.scale.setScalar(0.16 + blink * 0.06);
      }
    },
    dispose: () => {
      for (const geo of geos) geo.dispose();
      for (const mat of mats) mat.dispose();
    },
  };
}
