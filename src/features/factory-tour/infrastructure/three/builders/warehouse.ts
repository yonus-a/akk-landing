import * as THREE from 'three';
import { BAY3_INTERIOR, BAY3_LOCAL_X } from '../../../domain/factoryLayout';
import { Materials } from '../materials';
import { box, cylinder, fillInstances, flatPlane, InstanceTransform, mesh, placed } from '../primitives';
import { BuildContext } from './context';

const X = BAY3_LOCAL_X;
const WALL_X = BAY3_INTERIOR.x1 - 0.44;

/** Deterministic jitter so stacks look hand-placed but stay identical between renders. */
const jitter = (seed: number) => (Math.sin(seed * 12.9898) * 43758.5453) % 1;

/** Blue-skirted packing platform with tall stacks of stretch-wrapped bundles, as in the packing-hall photo. */
function buildPackingPlatforms(mats: Materials, deep: THREE.Group) {
  const platforms = [
    { x: 4.6, z: -113.5, w: 4.4, d: 6.5 },
    { x: 18.6, z: -113.5, w: 3.6, d: 6.5 },
  ];
  const bundles: InstanceTransform[] = [];
  const rolls: InstanceTransform[] = [];

  platforms.forEach((p, pi) => {
    deep.add(box(p.w, 0.9, p.d, mats.platformBlue, p.x, 0.45, p.z));
    deep.add(box(p.w + 0.05, 0.05, p.d + 0.05, mats.gridBlue, p.x, 0.92, p.z));
    if (pi === 0) {
      for (let sx = -1; sx <= 1; sx += 2) {
        for (let sz = -1; sz <= 1; sz++) {
          const layers = 5 + Math.floor(Math.abs(jitter(sx * 7 + sz)) * 3);
          for (let k = 0; k < layers; k++) {
            const j = jitter(sx * 31 + sz * 17 + k);
            bundles.push({ x: p.x + sx * 1.05 + j * 0.08, y: 1.18 + k * 0.5, z: p.z + sz * 2.1, ry: j * 0.06 });
          }
        }
      }
    } else {
      const d = 0.68;
      for (let row = 0; row < 4; row++) {
        for (let i = 0; i < 5 - row; i++) {
          rolls.push({ x: p.x - 2 * d + i * d + row * (d / 2), y: 1.27 + row * 0.59, z: p.z, rx: Math.PI / 2 });
        }
      }
    }
  });

  deep.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 0.48, 1.9), mats.wrap, bundles.length), bundles));
  const roll = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.33, 0.33, 6.0, 14), mats.foamYellow, rolls.length);
  deep.add(fillInstances(roll, rolls));
}

function buildPalletRacks(mats: Materials, deep: THREE.Group) {
  const rackZ0 = -118;
  const bayCount = 14;
  const bayW = 2.8;
  const xLines = [3.2, 5.8, 17.0, 19.6];
  const levels = [1.5, 2.95, 4.4];

  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 5.2, 0.12), mats.rackBlue, xLines.length * (bayCount + 1) * 2);
  const beams = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.14, 2.66), mats.beamOrange, xLines.length * bayCount * 6);
  const pallets = new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 0.12, 1.15), mats.pallet, 260);
  const goodsW = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 1.0, 1.1), mats.wrap, 130);
  const goodsB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.95, 1.1), mats.wrapDark, 130);
  const goodsD = new THREE.InstancedMesh(new THREE.BoxGeometry(0.92, 0.85, 1.02), mats.jumboBag, 60);
  const goods = [goodsW, goodsB];

  const dummy = new THREE.Object3D();
  const counts = new Map<THREE.InstancedMesh, number>();
  const push = (im: THREE.InstancedMesh) => {
    const i = counts.get(im) ?? 0;
    if (i >= im.count) return false;
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
    counts.set(im, i + 1);
    return true;
  };

  xLines.forEach((xl, li) => {
    for (let f = 0; f <= bayCount; f++) {
      const fz = rackZ0 - f * bayW;
      [-0.55, 0.55].forEach((off) => {
        dummy.position.set(xl + off, 2.6, fz);
        dummy.rotation.set(0, 0, 0);
        push(posts);
      });
    }
    for (let b = 0; b < bayCount; b++) {
      const zc = rackZ0 - b * bayW - bayW / 2;
      levels.forEach((lv, lvi) => {
        [-0.55, 0.55].forEach((off) => {
          dummy.position.set(xl + off, lv, zc);
          push(beams);
        });
        for (let s = 0; s < 2; s++) {
          // Deterministic pseudo-random fill so ~20% of slots stay empty.
          const seed = (li * 31 + b * 7 + lvi * 5 + s * 11) % 10;
          if (seed >= 8) continue;
          const sz = zc + (s === 0 ? -0.68 : 0.68);
          dummy.position.set(xl, lv + 0.13, sz);
          push(pallets);
          dummy.position.set(xl, lv + 0.19 + 0.5, sz);
          dummy.rotation.y = ((seed % 3) - 1) * 0.03;
          const pick = seed % 3;
          if (!(pick < 2 && push(goods[pick]))) push(goodsD);
          dummy.rotation.y = 0;
        }
      });
    }
  });

  [posts, beams, pallets, ...goods, goodsD].forEach((im) => {
    im.count = counts.get(im) ?? 0;
    im.castShadow = true;
    deep.add(im);
  });
}

function createForklift(mats: Materials) {
  const fk = new THREE.Group();
  fk.add(box(1.15, 0.85, 1.9, new THREE.MeshStandardMaterial({ color: 0xf2a20c, roughness: 0.4, metalness: 0.2 }), 0, 0.6, 0));
  fk.add(box(1.15, 0.65, 0.55, mats.darkSteel, 0, 0.55, -1.15));
  fk.add(box(1.1, 0.07, 1.05, mats.darkSteel, 0, 2.0, 0.15));
  [[-0.48, -0.32], [0.48, -0.32], [-0.48, 0.62], [0.48, 0.62]].forEach(([x, z]) => fk.add(box(0.07, 1.0, 0.07, mats.darkSteel, x, 1.5, z)));
  fk.add(box(0.09, 2.2, 0.09, mats.darkSteel, -0.38, 1.15, 0.98));
  fk.add(box(0.09, 2.2, 0.09, mats.darkSteel, 0.38, 1.15, 0.98));
  fk.add(box(0.13, 0.06, 1.05, mats.silver, -0.3, 0.14, 1.6));
  fk.add(box(0.13, 0.06, 1.05, mats.silver, 0.3, 0.14, 1.6));
  const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 14);
  [[-0.62, 0.55], [0.62, 0.55], [-0.62, -0.75], [0.62, -0.75]].forEach(([x, z]) => {
    const wheel = mesh(wheelGeo, mats.tyre, x, 0.28, z);
    wheel.rotation.z = Math.PI / 2;
    fk.add(wheel);
  });
  fk.add(box(0.16, 0.12, 0.16, mats.extinguisher, 0, 2.1, 0.15));
  fk.add(box(0.95, 0.9, 1.05, mats.wrap, 0, 0.65, 1.62));
  return fk;
}

function stagingRect(mats: Materials, cx: number, cz: number, w: number, l: number) {
  const g = new THREE.Group();
  const t = 0.09;
  g.add(
    flatPlane(w, t, mats.lineYellow, 0, 0.07, -l / 2),
    flatPlane(w, t, mats.lineYellow, 0, 0.07, l / 2),
    flatPlane(t, l, mats.lineYellow, -w / 2, 0.07, 0),
    flatPlane(t, l, mats.lineYellow, w / 2, 0.07, 0),
  );
  g.position.set(cx, 0, cz);
  return g;
}

/** Packing platforms, pallet-rack warehouse and shipping docks. */
export function buildWarehouse({ mats, parts, deep }: BuildContext) {
  buildPackingPlatforms(mats, deep);
  buildPalletRacks(mats, deep);

  // Walkway guardrail
  for (let rz = -118; rz >= -158; rz -= 4) deep.add(box(0.08, 0.85, 0.08, mats.lineYellow, 21.0, 0.42, rz));
  deep.add(box(0.06, 0.07, 40, mats.lineYellow, 21.0, 0.62, -138));
  deep.add(box(0.06, 0.07, 40, mats.lineYellow, 21.0, 0.32, -138));

  deep.add(placed(createForklift(mats), 13.4, 0, -151, 0.35));
  deep.add(placed(parts.worker({ suit: 0x1f232b, accent: 0x3a4250 }), 8.2, 0, -116.5, 0.6));
  deep.add(placed(parts.worker({ suit: 0x1f232b, accent: 0x3a4250, reaching: true }), 15.6, 0, -112.8, -1.2));

  deep.add(stagingRect(mats, 10.3, -161.5, 3.6, 2.6));
  deep.add(stagingRect(mats, 14.0, -161.5, 3.0, 2.6));
  [[10.3, -161.5], [14.0, -161.5]].forEach(([x, z]) => {
    deep.add(box(1.1, 0.14, 1.15, mats.pallet, x, 0.07, z));
    deep.add(box(0.95, 0.95, 1.0, mats.wrap, x, 0.62, z));
  });

  deep.add(mesh(new THREE.PlaneGeometry(5.0, 5.0), mats.lightDoor, X + 3, 2.6, BAY3_INTERIOR.endZ + 0.45));

  [-166, -171.5].forEach((dz) => {
    const dockDoor = mesh(new THREE.PlaneGeometry(3.2, 4.0), mats.lightDoor, WALL_X, 2.0, dz);
    dockDoor.rotation.y = -Math.PI / 2;
    deep.add(dockDoor);
    deep.add(flatPlane(2.9, 1.1, mats.silver, 22.2, 0.055, dz));
    [dz - 1.9, dz + 1.9].forEach((bz) => deep.add(cylinder(0.11, 0.9, mats.bollard, 22.7, 0.45, bz, 10)));
  });
}
