import * as THREE from 'three';
import { Vec3 } from '../../domain/geometry';
import { Materials } from './materials';

export const toVector3 = (v: Vec3) => new THREE.Vector3(v.x, v.y, v.z);

export function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  return m;
}

export function box(w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0) {
  return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z);
}

export function cylinder(r: number, h: number, material: THREE.Material, x = 0, y = 0, z = 0, segments = 16) {
  return mesh(new THREE.CylinderGeometry(r, r, h, segments), material, x, y, z);
}

/** A horizontal plane lying on the floor. */
export function flatPlane(w: number, l: number, material: THREE.Material, x: number, y: number, z: number) {
  const p = mesh(new THREE.PlaneGeometry(w, l), material, x, y, z);
  p.rotation.x = -Math.PI / 2;
  return p;
}

/**
 * Vertical plane, e.g. an interior wall lining; rotY = π/2 faces +x, -π/2 faces -x, 0 faces +z.
 * With `tile`, UVs are in units of `tile` metres so the texture keeps its real-world scale.
 */
export function wallPlane(len: number, h: number, material: THREE.Material, x: number, y: number, z: number, rotY: number, tile?: number) {
  const geo = new THREE.PlaneGeometry(len, h);
  if (tile) {
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * len) / tile, (uv.getY(i) * h) / tile);
  }
  const p = mesh(geo, material, x, y, z);
  p.rotation.y = rotY;
  return p;
}

export function createGabledRoof(width: number, length: number, roofHeight: number, material: THREE.Material) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(0, roofHeight);
  shape.lineTo(width / 2, 0);
  shape.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false }), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function placed<T extends THREE.Object3D>(obj: T, x: number, y: number, z: number, rotY = 0): T {
  obj.position.set(x, y, z);
  obj.rotation.y = rotY;
  return obj;
}

/** Writes one matrix per transform into an InstancedMesh and trims its count. */
export interface InstanceTransform {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sy?: number;
  sz?: number;
  order?: string;
}

export function fillInstances(im: THREE.InstancedMesh, transforms: InstanceTransform[]) {
  const dummy = new THREE.Object3D();
  transforms.slice(0, im.count).forEach((t, i) => {
    dummy.position.set(t.x, t.y, t.z);
    dummy.rotation.set(t.rx ?? 0, t.ry ?? 0, t.rz ?? 0, t.order ?? 'XYZ');
    dummy.scale.set(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1);
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
  });
  im.count = Math.min(im.count, transforms.length);
  im.instanceMatrix.needsUpdate = true;
  return im;
}

/** Box whose top face is shrunk by the given factors (car cabins, hoods, hoppers). */
export function taperedBox(w: number, h: number, d: number, topScaleX: number, topScaleZ: number) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > 0) {
      pos.setX(i, pos.getX(i) * topScaleX);
      pos.setZ(i, pos.getZ(i) * topScaleZ);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/** Bumper fascia: a C-section swept along a wrap-around curve (≈1.9m wide, faces +z, height along y). */
function createBumperGeometry() {
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.95, 0, -0.42),
    new THREE.Vector3(-0.88, 0, -0.08),
    new THREE.Vector3(-0.6, 0, 0.12),
    new THREE.Vector3(0, 0, 0.2),
    new THREE.Vector3(0.6, 0, 0.12),
    new THREE.Vector3(0.88, 0, -0.08),
    new THREE.Vector3(0.95, 0, -0.42),
  ]);
  // For a curve lying in the XZ plane the extrude frame's normal is vertical, so the profile is written
  // as (height, depth): shape x maps to world y and shape y to the horizontal depth of the section.
  const profile = new THREE.Shape();
  profile.moveTo(-0.26, -0.02);
  profile.lineTo(-0.26, 0.04);
  profile.bezierCurveTo(-0.1, 0.11, 0.1, 0.11, 0.24, 0.05);
  profile.lineTo(0.26, -0.01);
  profile.lineTo(0.21, -0.03);
  profile.bezierCurveTo(0.08, 0.04, -0.08, 0.04, -0.2, -0.03);
  profile.closePath();
  return new THREE.ExtrudeGeometry(profile, { steps: 28, curveSegments: 5, bevelEnabled: false, extrudePath: path });
}

export interface WorkerOptions {
  suit?: number;
  accent?: number;
  headwear?: 'none' | 'cap' | 'hood';
  mask?: boolean;
  /** Arms reaching forward, e.g. working at a bench or holding a spray gun. */
  reaching?: boolean;
}

/** Shared geometry for repeated props; created once per scene so it can be disposed with it. */
export function createParts(mats: Materials) {
  const bumperGeo = createBumperGeometry();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xc89470, roughness: 0.65 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 0.8 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x121417, roughness: 0.7 });
  const suitMats = new Map<number, THREE.MeshStandardMaterial>();
  const suitMat = (color: number) => {
    if (!suitMats.has(color)) suitMats.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
    return suitMats.get(color)!;
  };

  return {
    bumperGeo,

    bumper(material: THREE.Material = mats.bumperBlack) {
      const m = new THREE.Mesh(bumperGeo, material);
      m.castShadow = true;
      return m;
    },

    worker({ suit = 0x1b2436, accent = 0x2f5fb3, headwear = 'none', mask = false, reaching = false }: WorkerOptions = {}) {
      const g = new THREE.Group();
      const body = suitMat(suit);
      const trim = suitMat(accent);
      [-0.1, 0.1].forEach((x) => {
        g.add(box(0.15, 0.8, 0.18, body, x, 0.48, 0));
        g.add(box(0.15, 0.08, 0.26, shoeMat, x, 0.04, 0.04));
      });
      g.add(box(0.42, 0.62, 0.25, body, 0, 1.18, 0));
      g.add(box(0.44, 0.12, 0.27, trim, 0, 1.43, 0));
      g.add(box(0.2, 0.06, 0.01, trim, 0.08, 1.3, 0.13));
      const armRot = reaching ? -0.9 : 0;
      [-0.27, 0.27].forEach((x, i) => {
        const arm = new THREE.Group();
        arm.add(box(0.11, 0.56, 0.13, i === 0 ? trim : body, 0, -0.26, 0));
        arm.add(mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat, 0, -0.56, 0));
        arm.position.set(x, 1.46, 0);
        arm.rotation.set(armRot, 0, i === 0 ? 0.08 : -0.08);
        g.add(arm);
      });
      g.add(box(0.1, 0.08, 0.1, skinMat, 0, 1.53, 0));
      g.add(mesh(new THREE.SphereGeometry(0.12, 14, 12), skinMat, 0, 1.68, 0));
      if (headwear === 'cap') {
        const cap = mesh(new THREE.SphereGeometry(0.13, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), suitMat(0x2c4fa8), 0, 1.7, 0);
        g.add(cap);
      } else if (headwear === 'hood') {
        g.add(mesh(new THREE.SphereGeometry(0.15, 14, 12), suitMat(0xeef1f4), 0, 1.69, -0.02));
      } else {
        g.add(mesh(new THREE.SphereGeometry(0.125, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), hairMat, 0, 1.69, -0.01));
      }
      if (mask) g.add(box(0.14, 0.08, 0.06, suitMat(0xf3f4f6), 0, 1.63, 0.1));
      g.traverse((o) => { o.castShadow = true; });
      return g;
    },

    car(color: number) {
      const g = new THREE.Group();
      const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.6 });
      const lower = box(4.3, 0.62, 1.76, paint, 0, 0.58, 0);
      lower.castShadow = true;
      g.add(lower);
      g.add(mesh(taperedBox(2.4, 0.56, 1.6, 0.72, 0.85), mats.carGlass, -0.15, 1.17, 0));
      g.add(mesh(taperedBox(1.75, 0.06, 1.38, 1, 1), paint, -0.15, 1.47, 0));
      const wheelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 16);
      [[-1.35, 0.82], [1.35, 0.82], [-1.35, -0.82], [1.35, -0.82]].forEach(([x, z]) => {
        const w = mesh(wheelGeo, mats.tyre, x, 0.33, z);
        w.rotation.x = Math.PI / 2;
        g.add(w);
      });
      return g;
    },

    tree(scale = 1.0, dark = false) {
      const t = new THREE.Group();
      t.add(mesh(new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, 1.4 * scale, 7), mats.trunk, 0, 0.7 * scale, 0));
      const crownMat = dark ? mats.bushDark : mats.bush;
      const blobs = [[0, 2.1, 0, 1.25], [0.55, 1.8, 0.2, 0.85], [-0.5, 1.85, -0.25, 0.9], [0.1, 2.6, -0.1, 0.8]];
      blobs.forEach(([x, y, z, r]) => {
        const c = mesh(new THREE.IcosahedronGeometry(r * scale, 1), crownMat, x * scale, y * scale, z * scale);
        c.castShadow = true;
        t.add(c);
      });
      t.rotation.y = Math.random() * Math.PI * 2;
      return t;
    },
  };
}

export type Parts = ReturnType<typeof createParts>;
