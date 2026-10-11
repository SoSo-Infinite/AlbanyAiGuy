import * as THREE from "three";

/**
 * Steep chateau roof, y-up, peak along the center. Triangles are wound so
 * each face normal points away from an interior point (FrontSide).
 */
export function chateauRoofGeometry(
  w: number,
  h: number,
  d: number,
): THREE.BufferGeometry {
  const hw = w / 2;
  const hd = d / 2;
  const L0 = new THREE.Vector3(-hw, 0, hd);
  const R0 = new THREE.Vector3(hw, 0, hd);
  const P0 = new THREE.Vector3(0, h, hd);
  const L1 = new THREE.Vector3(-hw, 0, -hd);
  const R1 = new THREE.Vector3(hw, 0, -hd);
  const P1 = new THREE.Vector3(0, h, -hd);
  const inside = new THREE.Vector3(0, h * 0.25, 0);
  const positions: number[] = [];
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const normal = new THREE.Vector3();

  const pushTri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    normal.crossVectors(ab, ac);
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const cz = (a.z + b.z + c.z) / 3;
    const outward =
      normal.x * (cx - inside.x) +
      normal.y * (cy - inside.y) +
      normal.z * (cz - inside.z);
    const [p, q, r] = outward >= 0 ? [a, b, c] : [a, c, b];
    positions.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
  };

  pushTri(L0, P0, P1);
  pushTri(L0, P1, L1);
  pushTri(R0, P1, P0);
  pushTri(R0, R1, P1);
  pushTri(L0, R0, P0);
  pushTri(L1, P1, R1);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}
