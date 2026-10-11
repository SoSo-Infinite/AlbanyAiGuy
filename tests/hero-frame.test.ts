import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as THREE from "three";
import { chateauRoofGeometry } from "@/components/hero/scene/geometry";
import { yawToward } from "@/lib/hero/motion";

describe("hero frame", () => {
  it("turns a plane's own +z normal toward the camera", () => {
    const cases = [
      [new THREE.Vector3(0, 5, 20), new THREE.Vector3(0, 5, 0)],
      [new THREE.Vector3(10, 4, 0), new THREE.Vector3(0, 5, 0)],
      [new THREE.Vector3(-8, 3, 4), new THREE.Vector3(2, 6, -1)],
      [new THREE.Vector3(1, 8, -6), new THREE.Vector3(4, 2, 3)],
    ] as const;
    for (const [camera, at] of cases) {
      const yaw = yawToward(at, camera);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
      mesh.position.copy(at);
      mesh.rotation.order = "XYZ";
      mesh.rotation.y = yaw;
      mesh.updateMatrixWorld(true);
      const attr = mesh.geometry.getAttribute("normal");
      const front = new THREE.Vector3(
        attr.getX(0),
        attr.getY(0),
        attr.getZ(0),
      ).transformDirection(mesh.matrixWorld);
      const toward = camera.clone().sub(at);
      toward.y = 0;
      toward.normalize();
      assert.ok(Math.abs(front.y) < 1e-6, "billboard stays upright");
      assert.ok(
        front.dot(toward) > 0.99,
        `front ${front.toArray()} vs ${toward.toArray()}`,
      );
      mesh.geometry.dispose();
    }
  });

  it("points the capitol roof faces outward", () => {
    const w = 4;
    const h = 2;
    const d = 3;
    const geo = chateauRoofGeometry(w, h, d);
    const pos = geo.getAttribute("position");
    const inside = new THREE.Vector3(0, h * 0.25, 0);
    let left = 0;
    let leftN = 0;
    let right = 0;
    let rightN = 0;
    let front = 0;
    let frontN = 0;
    let back = 0;
    let backN = 0;
    let up = 0;
    let upN = 0;
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i);
      b.fromBufferAttribute(pos, i + 1);
      c.fromBufferAttribute(pos, i + 2);
      ab.subVectors(b, a);
      ac.subVectors(c, a);
      normal.crossVectors(ab, ac).normalize();
      const mid = a
        .clone()
        .add(b)
        .add(c)
        .multiplyScalar(1 / 3);
      const outward = mid.clone().sub(inside);
      assert.ok(normal.dot(outward) > 0, `triangle ${i} faces inward`);
      if (mid.x < -0.4) {
        left += normal.x;
        leftN += 1;
      }
      if (mid.x > 0.4) {
        right += normal.x;
        rightN += 1;
      }
      if (Math.abs(mid.x) < 0.35 && mid.z > 0.8) {
        front += normal.z;
        frontN += 1;
      }
      if (Math.abs(mid.x) < 0.35 && mid.z < -0.8) {
        back += normal.z;
        backN += 1;
      }
      if (mid.y > h * 0.55) {
        up += normal.y;
        upN += 1;
      }
    }
    assert.ok(leftN > 0 && left / leftN < -0.5);
    assert.ok(rightN > 0 && right / rightN > 0.5);
    assert.ok(frontN > 0 && front / frontN > 0.5);
    assert.ok(backN > 0 && back / backN < -0.5);
    assert.ok(upN > 0 && up / upN > 0.3);
    geo.dispose();
  });
});
