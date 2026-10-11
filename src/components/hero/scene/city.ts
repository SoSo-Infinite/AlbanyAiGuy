import * as THREE from "three";
import type { AlbanyScene, Landmark } from "./albany-plaza-night";
import { chateauRoofGeometry } from "./geometry";
import {
  SKY_FRAG,
  SKY_VERT,
  WATER_FRAG,
  WATER_VERT,
  WINDOW_FRAG,
  WINDOW_VERT,
} from "./shaders";
import type { CitySim } from "./sim";
import { glowMaterial, type HeroTextures } from "./textures";

export type CityHandle = {
  group: THREE.Group;
  tick: (sim: CitySim, dt: number, camera: THREE.Camera) => void;
  dispose: () => void;
};

function need(scene: AlbanyScene, kind: Landmark["kind"]): Landmark {
  const found = scene.landmarks.find((item) => item.kind === kind);
  if (!found) throw new Error(`Missing landmark ${kind}`);
  return found;
}

function windowMaterial(
  time: { value: number },
  wave: { value: number },
  origin: { value: THREE.Vector3 },
  facade: string,
  seed: number,
  cols: number,
  rows: number,
  kind = 0,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: time,
      uWave: wave,
      uWaveOrigin: origin,
      uGrid: { value: new THREE.Vector2(cols, rows) },
      uFacade: { value: new THREE.Color(facade) },
      uGold: { value: new THREE.Color("#e0b03a") },
      uCyan: { value: new THREE.Color("#00c8f0") },
      uSeed: { value: seed },
      uKind: { value: kind },
    },
    vertexShader: WINDOW_VERT,
    fragmentShader: WINDOW_FRAG,
  });
}

/** Procedural Empire State Plaza. Geometries are tracked so dispose skips the shared sprite quad. */
export function buildCity(
  scene: AlbanyScene,
  textures: HeroTextures,
): CityHandle {
  const group = new THREE.Group();
  group.name = "albany-plaza-night";
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];

  const track = <T extends THREE.Mesh>(mesh: T): T => {
    geos.push(mesh.geometry);
    const mat = mesh.material;
    if (Array.isArray(mat)) {
      for (const item of mat) mats.push(item);
    } else {
      mats.push(mat);
    }
    return mesh;
  };

  const timeU = { value: 0 };
  const waveU = { value: -1 };
  const originU = { value: new THREE.Vector3() };
  const addWindows = (
    facade: string,
    seed: number,
    cols: number,
    rows: number,
    kind = 0,
  ) => {
    const mat = windowMaterial(
      timeU,
      waveU,
      originU,
      facade,
      seed,
      cols,
      rows,
      kind,
    );
    mats.push(mat);
    return mat;
  };

  const stone = new THREE.MeshBasicMaterial({ color: "#141a24" });
  const crownMat = new THREE.MeshBasicMaterial({ color: "#07090d" });
  const roofMat = new THREE.MeshBasicMaterial({ color: "#1a2428" });
  const stemMat = new THREE.MeshBasicMaterial({ color: "#c8c2b4" });
  mats.push(stone, crownMat, roofMat, stemMat);

  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: timeU,
      uMoon: { value: new THREE.Vector3(18, 24, -12) },
    },
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
  });
  mats.push(skyMat);
  const sky = track(
    new THREE.Mesh(new THREE.SphereGeometry(90, 20, 14), skyMat),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  group.add(sky);

  const streaks = new Float32Array(6);
  const waterWidth = 64;
  for (let i = 0; i < 6; i++) {
    const roof = scene.roofs[i % scene.roofs.length];
    const x = roof ? roof.position.x : 0;
    streaks[i] = Math.min(1, Math.max(0, (x + waterWidth / 2) / waterWidth));
  }
  const waterMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: timeU,
      uStreaks: { value: streaks },
    },
    vertexShader: WATER_VERT,
    fragmentShader: WATER_FRAG,
    transparent: true,
    depthWrite: false,
  });
  mats.push(waterMat);
  const water = track(
    new THREE.Mesh(new THREE.PlaneGeometry(waterWidth, 18), waterMat),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.02, 12);
  water.renderOrder = 1;
  group.add(water);

  const plaza = track(
    new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.14, 14),
      new THREE.MeshBasicMaterial({ color: "#10161e" }),
    ),
  );
  mats.push(plaza.material as THREE.Material);
  plaza.position.set(0.4, -0.07, -1.4);
  group.add(plaza);

  const agencies = scene.landmarks.filter((item) => item.kind === "agency");
  const agencyMat = addWindows("#243044", 1.3, 4, 16);
  const agencyGeo = new THREE.BoxGeometry(1, 1, 1);
  geos.push(agencyGeo);
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

  const corning = need(scene, "corning");
  const corningMat = addWindows("#1c2838", 3.1, 4, 24);
  const corningMesh = track(
    new THREE.Mesh(
      new THREE.BoxGeometry(corning.size.w, corning.size.h, corning.size.d),
      corningMat,
    ),
  );
  corningMesh.position.set(
    corning.position.x,
    corning.size.h / 2,
    corning.position.z,
  );
  group.add(corningMesh);
  const band = track(
    new THREE.Mesh(
      new THREE.BoxGeometry(corning.size.w * 1.06, 0.46, corning.size.d * 1.06),
      crownMat,
    ),
  );
  band.position.set(
    corning.position.x,
    corning.size.h - 0.7,
    corning.position.z,
  );
  group.add(band);
  const antenna = track(
    new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6), crownMat),
  );
  antenna.position.set(
    corning.position.x,
    corning.size.h + 0.35,
    corning.position.z,
  );
  group.add(antenna);

  const beacon = new THREE.Sprite(glowMaterial(textures.glow, "#ff3b4e", 0.9));
  mats.push(beacon.material);
  beacon.position.set(
    corning.position.x,
    corning.size.h + 0.9,
    corning.position.z,
  );
  beacon.scale.setScalar(0.72);
  beacon.renderOrder = 2;
  group.add(beacon);
  const beaconCore = new THREE.Sprite(
    glowMaterial(textures.glow, "#ffe8ea", 0.95),
  );
  mats.push(beaconCore.material);
  beaconCore.position.copy(beacon.position);
  beaconCore.scale.setScalar(0.14);
  beaconCore.renderOrder = 3;
  group.add(beaconCore);

  const smith = need(scene, "smith");
  const smithMat = addWindows("#2c2820", 8.4, 5, 18);
  const smithMesh = track(
    new THREE.Mesh(
      new THREE.BoxGeometry(smith.size.w, smith.size.h, smith.size.d),
      smithMat,
    ),
  );
  smithMesh.position.set(smith.position.x, smith.size.h / 2, smith.position.z);
  group.add(smithMesh);
  const steps = [
    { y: smith.size.h + 0.18, w: 1.2, h: 0.36, d: 1.05 },
    { y: smith.size.h + 0.55, w: 0.86, h: 0.34, d: 0.78 },
    { y: smith.size.h + 0.95, w: 0.48, h: 0.5, d: 0.48 },
  ];
  for (const step of steps) {
    const mesh = track(
      new THREE.Mesh(new THREE.BoxGeometry(step.w, step.h, step.d), stone),
    );
    mesh.position.set(smith.position.x, step.y, smith.position.z);
    group.add(mesh);
  }

  const capitol = need(scene, "capitol");
  const wallMat = addWindows("#3a2e36", 5.5, 12, 6);
  const wall = track(
    new THREE.Mesh(
      new THREE.BoxGeometry(capitol.size.w, capitol.size.h, capitol.size.d),
      wallMat,
    ),
  );
  wall.position.set(capitol.position.x, capitol.size.h / 2, capitol.position.z);
  group.add(wall);
  const plinth = track(
    new THREE.Mesh(
      new THREE.BoxGeometry(capitol.size.w + 0.7, 0.28, capitol.size.d + 0.45),
      stone,
    ),
  );
  plinth.position.set(capitol.position.x, 0.14, capitol.position.z);
  group.add(plinth);
  const roof = track(
    new THREE.Mesh(
      chateauRoofGeometry(capitol.size.w * 0.74, 1.7, capitol.size.d * 0.7),
      roofMat,
    ),
  );
  roof.position.set(capitol.position.x, capitol.size.h, capitol.position.z);
  group.add(roof);

  const turretMat = addWindows("#3a342c", 11.2, 3, 8);
  const turretGeo = new THREE.CylinderGeometry(0.4, 0.44, 1, 10);
  const coneGeo = new THREE.ConeGeometry(0.58, 1, 10);
  geos.push(turretGeo, coneGeo);
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
  const cones = new THREE.InstancedMesh(coneGeo, roofMat, turretPlaces.length);
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

  const egg = need(scene, "egg");
  const eggGroup = new THREE.Group();
  eggGroup.position.set(egg.position.x, 0, egg.position.z);
  const stem = track(
    new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.95, 1.8, 18), stemMat),
  );
  stem.position.y = 0.9;
  eggGroup.add(stem);
  const eggMat = addWindows("#d9d3c6", 2.2, 8, 6, 1);
  const shell = track(
    new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.62),
      eggMat,
    ),
  );
  shell.position.y = 2.05;
  shell.rotation.set(0.18, 0.25, -0.5);
  shell.scale.set(1.28, 1.55, 1.22);
  eggGroup.add(shell);
  group.add(eggGroup);

  for (let i = 0; i < scene.roofs.length; i++) {
    const roofAnchor = scene.roofs[i];
    if (!roofAnchor) continue;
    const glow = new THREE.Sprite(
      glowMaterial(textures.glow, i % 2 === 0 ? "#e0b03a" : "#00c8f0", 0.32),
    );
    mats.push(glow.material);
    glow.position.set(
      roofAnchor.position.x,
      roofAnchor.position.y,
      roofAnchor.position.z,
    );
    glow.scale.setScalar(roofAnchor.landmarkId === "corning" ? 0.62 : 0.4);
    glow.renderOrder = 2;
    group.add(glow);
  }

  group.traverse((obj) => {
    obj.raycast = () => {};
  });

  return {
    group,
    tick: (sim, _dt, camera) => {
      timeU.value = sim.time;
      waveU.value = sim.wave;
      originU.value.copy(sim.waveOrigin);
      if (sim.wave >= 0) {
        sim.wave += _dt / 1.25;
        if (sim.wave > 1) sim.wave = -1;
      }
      sky.position.copy(camera.position);
      const blink =
        0.42 + 0.58 * (0.5 + 0.5 * Math.sin(sim.time * Math.PI * 2 * 0.25));
      beacon.material.opacity = blink;
      beacon.scale.setScalar(0.22 + blink * 0.1);
      beaconCore.material.opacity = 0.55 + blink * 0.45;
      beaconCore.scale.setScalar(0.06 + blink * 0.03);
    },
    dispose: () => {
      for (const geo of geos) geo.dispose();
      for (const mat of mats) mat.dispose();
    },
  };
}
