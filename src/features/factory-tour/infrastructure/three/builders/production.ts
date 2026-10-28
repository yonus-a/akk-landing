import * as THREE from 'three';
import { CART_LOOP, INJECTION_MACHINES, MEZZANINE } from '../../../domain/factoryLayout';
import { Materials } from '../materials';
import { box, cylinder, fillInstances, InstanceTransform, mesh, Parts, placed, taperedBox } from '../primitives';
import { createLivaLogoTex } from '../textures';
import { BuildContext } from './context';

const FACE_UP = -Math.PI / 2;

/** LIVA-style injection press: long lavender bed, guarded clamp unit at +z, injection unit at -z. Operator side faces +x. */
function createInjectionPress(mats: Materials, logo: THREE.Material) {
  const m = new THREE.Group();
  const L = INJECTION_MACHINES.length;

  m.add(box(1.9, 0.14, L - 0.2, mats.machineDark, 0, 0.07, 0));
  const bed = box(1.8, 0.95, L - 0.4, mats.machineLavender, 0, 0.6, 0);
  bed.castShadow = true;
  m.add(bed);
  m.add(box(1.84, 0.06, L - 0.36, mats.machineTrim, 0, 1.1, 0));

  // Clamp unit with sliding safety guard
  const housing = box(2.0, 1.55, 4.0, mats.machineLavender, 0, 1.9, 2.2);
  housing.castShadow = true;
  m.add(housing);
  m.add(box(2.04, 0.08, 4.04, mats.machineTrim, 0, 2.7, 2.2));
  m.add(box(1.9, 1.75, 0.3, mats.machineTrim, 0, 1.95, 4.3));
  m.add(box(0.06, 1.3, 2.3, mats.machineTrim, 1.02, 1.85, 1.9));
  m.add(box(0.02, 0.85, 1.6, mats.machineGlass, 1.06, 1.95, 1.9));
  [-0.55, 0.55].forEach((x) => {
    const tieBar = cylinder(0.07, 4.2, mats.silver, x, 2.8, 2.2, 10);
    tieBar.rotation.x = Math.PI / 2;
    m.add(tieBar);
  });
  const logoPlane = mesh(new THREE.PlaneGeometry(1.1, 0.28), logo, 1.035, 2.45, 3.45);
  logoPlane.rotation.y = Math.PI / 2;
  m.add(logoPlane);

  // Operator control panel
  m.add(box(0.14, 0.7, 0.6, mats.machineTrim, 1.08, 1.85, 3.75));
  const screen = mesh(new THREE.PlaneGeometry(0.42, 0.3), mats.screen, 1.16, 1.95, 3.75);
  screen.rotation.y = Math.PI / 2;
  m.add(screen);

  // Injection unit: exposed barrel with heater bands, carriage cover and hopper-dryer
  const barrel = cylinder(0.15, 1.4, mats.silver, 0, 1.75, -0.5, 14);
  barrel.rotation.x = Math.PI / 2;
  m.add(barrel);
  [-0.15, -0.5, -0.85].forEach((z) => {
    const band = cylinder(0.19, 0.16, mats.machineDark, 0, 1.75, z, 14);
    band.rotation.x = Math.PI / 2;
    m.add(band);
  });
  m.add(box(1.3, 0.85, 3.1, mats.machineLavender, 0, 1.5, -2.6));
  m.add(box(1.34, 0.06, 3.14, mats.machineTrim, 0, 1.94, -2.6));
  m.add(mesh(new THREE.CylinderGeometry(0.42, 0.1, 0.5, 16), mats.dryerWhite, 0, 2.25, -1.3));
  m.add(cylinder(0.42, 0.95, mats.dryerWhite, 0, 2.97, -1.3));
  m.add(cylinder(0.3, 0.15, mats.silver, 0, 3.52, -1.3));
  m.add(box(1.4, 1.2, 0.5, mats.machineLavender, 0, 1.2, -4.2));

  return m;
}

/** Blue tube deflashing stand with a freshly moulded bumper lying face up. */
function createTrimStand(mats: Materials, parts: Parts) {
  const g = new THREE.Group();
  const legGeo = new THREE.BoxGeometry(0.05, 0.9, 0.05);
  [[-0.75, -0.42], [0.75, -0.42], [-0.75, 0.42], [0.75, 0.42]].forEach(([x, z]) => g.add(mesh(legGeo, mats.tubeBlue, x, 0.45, z)));
  [-0.42, 0.42].forEach((z) => g.add(box(1.55, 0.05, 0.05, mats.tubeBlue, 0, 0.9, z)));
  [-0.75, 0.75].forEach((x) => g.add(box(0.05, 0.05, 0.9, mats.tubeBlue, x, 0.9, 0)));
  [-0.42, 0.42].forEach((z) => g.add(box(1.55, 0.04, 0.04, mats.tubeBlue, 0, 0.18, z)));
  const bumper = parts.bumper();
  bumper.rotation.x = FACE_UP;
  bumper.position.set(0, 1.05, 0.05);
  g.add(bumper);
  return g;
}

/** Wooden platform trolley with a blue push handle at +z, stacked with bumpers. */
function createTrolley(mats: Materials, parts: Parts, wrapped: boolean) {
  const g = new THREE.Group();
  g.add(box(1.3, 0.1, 2.2, mats.wood, 0, 0.32, 0));
  g.add(box(1.34, 0.06, 2.24, mats.tubeBlue, 0, 0.25, 0));
  const casterGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12);
  [[-0.55, -0.9], [0.55, -0.9], [-0.55, 0.9], [0.55, 0.9]].forEach(([x, z]) => {
    const c = mesh(casterGeo, mats.tyre, x, 0.1, z);
    c.rotation.z = Math.PI / 2;
    g.add(c);
  });
  [-0.55, 0.55].forEach((x) => g.add(box(0.04, 1.0, 0.04, mats.tubeBlue, x, 0.85, 1.08)));
  g.add(box(1.14, 0.04, 0.04, mats.tubeBlue, 0, 1.33, 1.08));
  if (wrapped) {
    g.add(box(1.25, 0.95, 2.0, mats.wrapDark, 0, 0.85, -0.05));
  } else {
    for (let i = 0; i < 6; i++) {
      const b = parts.bumper();
      b.rotation.set(FACE_UP, Math.PI / 2, 0, 'YXZ');
      b.position.set(0, 0.62 + i * 0.13, -0.1);
      g.add(b);
    }
  }
  return g;
}

function createJumboBag(mats: Materials) {
  const g = new THREE.Group();
  const bag = mesh(taperedBox(1.0, 1.05, 1.0, 0.9, 0.9), mats.jumboBag, 0, 0.53, 0);
  bag.castShadow = true;
  g.add(bag);
  [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].forEach(([x, z]) => g.add(box(0.06, 0.2, 0.03, mats.jumboBag, x, 1.12, z)));
  g.add(cylinder(0.14, 0.18, mats.jumboBag, 0, 1.14, 0, 10));
  return g;
}

function buildMezzanine({ mats, parts, halls }: BuildContext) {
  const { x0, x1, z0, z1, levels } = MEZZANINE;
  const len = z0 - z1;
  const zc = (z0 + z1) / 2;
  const xc = (x0 + x1) / 2;
  const width = x1 - x0;
  const top = levels[levels.length - 1];

  const postZ: number[] = [];
  for (let z = z0; z >= z1 - 0.01; z -= len / 12) postZ.push(z);
  const posts = postZ.flatMap((z) => [{ x: x0 + 0.1, y: (top + 1.1) / 2, z }, { x: x1 - 0.1, y: (top + 1.1) / 2, z }]);
  halls.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, top + 1.1, 0.2), mats.frameBlue, posts.length), posts));

  levels.forEach((y) => {
    halls.add(box(width, 0.08, len, mats.grating, xc, y, zc));
    halls.add(box(0.16, 0.32, len, mats.frameBlue, x1 - 0.1, y - 0.18, zc));
    halls.add(box(0.16, 0.32, len, mats.frameBlue, x0 + 0.1, y - 0.18, zc));
    halls.add(box(0.05, 0.05, len, mats.frameBlue, x1 - 0.08, y + 1.05, zc));
    halls.add(box(0.04, 0.04, len, mats.frameBlue, x1 - 0.08, y + 0.52, zc));
  });

  // Diagonal bracing on the aisle side, alternating bays
  const bayLen = len / 12;
  const braceLen = Math.hypot(bayLen, levels[0]);
  const braceAngle = Math.atan2(bayLen, levels[0]);
  const braces: { x: number; y: number; z: number; rx: number }[] = [];
  postZ.slice(0, -1).forEach((z, i) => {
    if (i % 2) return;
    braces.push({ x: x1 - 0.1, y: levels[0] / 2, z: z - bayLen / 2, rx: braceAngle });
    braces.push({ x: x1 - 0.1, y: levels[0] / 2, z: z - bayLen / 2, rx: -braceAngle });
  });
  halls.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, braceLen, 0.07), mats.frameBlue, braces.length), braces));

  // Central dryers on the first deck, piped down to the left-row presses
  INJECTION_MACHINES.rowZ.forEach((z) => {
    const dz = z - 1.3;
    halls.add(cylinder(0.45, 1.4, mats.dryerWhite, xc, levels[0] + 0.75, dz));
    halls.add(cylinder(0.32, 0.25, mats.silver, xc, levels[0] + 1.55, dz));
    const run = INJECTION_MACHINES.leftX - xc;
    const pipe = cylinder(0.05, run, mats.dryerWhite, xc + run / 2, levels[0] + 1.25, dz, 8);
    pipe.rotation.z = Math.PI / 2;
    halls.add(pipe);
    halls.add(cylinder(0.05, levels[0] + 1.25 - 3.6, mats.dryerWhite, INJECTION_MACHINES.leftX, (levels[0] + 1.25 + 3.6) / 2, dz, 8));
  });

  // Stored bumpers stacked on the decks
  const stored: InstanceTransform[] = [];
  levels.forEach((y, li) => {
    for (let z = z0 - 1.5; z > z1 + 1; z -= 2.4) {
      if (li === 0 && INJECTION_MACHINES.rowZ.some((rz) => Math.abs(rz - 1.3 - z) < 1.2)) continue;
      const height = li === 0 ? 4 : 6;
      for (let k = 0; k < height; k++) stored.push({ x: xc, y: y + 0.1 + k * 0.13, z, rx: FACE_UP, ry: Math.PI / 2, order: 'YXZ' });
    }
  });
  halls.add(fillInstances(new THREE.InstancedMesh(parts.bumperGeo, mats.bumperBlack, stored.length), stored));
}

/** Injection-moulding hall; returns the trolleys that travel down the aisle towards the paint shop. */
export function buildProduction(ctx: BuildContext) {
  const { mats, parts, halls } = ctx;
  const logo = new THREE.MeshBasicMaterial({ map: createLivaLogoTex(), transparent: true });
  const { leftX, rightX, rowZ } = INJECTION_MACHINES;

  rowZ.forEach((z, i) => {
    halls.add(placed(createInjectionPress(mats, logo), leftX, 0, z, 0));
    halls.add(placed(createInjectionPress(mats, logo), rightX, 0, z, Math.PI));
    halls.add(placed(createTrimStand(mats, parts), leftX + 2.3, 0, z + 2.6, Math.PI / 2));
    halls.add(placed(createTrimStand(mats, parts), rightX - 2.3, 0, z - 2.6, Math.PI / 2));
    halls.add(placed(createJumboBag(mats), i % 2 ? rightX - 2.1 : leftX + 2.1, 0, i % 2 ? z + 1.8 : z - 1.8));
  });

  buildMezzanine(ctx);

  // Operators at the deflashing stands
  halls.add(placed(parts.worker({ reaching: true }), leftX + 3.2, 0, rowZ[0] + 2.6, -Math.PI / 2));
  halls.add(placed(parts.worker({ reaching: true }), rightX - 3.2, 0, rowZ[1] - 2.6, Math.PI / 2));
  halls.add(placed(parts.worker({ suit: 0x222c3d, reaching: true }), leftX + 3.2, 0, rowZ[2] + 2.6, -Math.PI / 2));
  halls.add(placed(parts.worker({ suit: 0x222c3d }), rightX - 1.4, 0, rowZ[3] + 0.5, Math.PI / 2));

  // Parked trolleys of wrapped bumpers and incoming resin bags near the entrance
  halls.add(placed(createTrolley(mats, parts, true), 7.4, 0, -4.5, 0.1));
  halls.add(placed(createTrolley(mats, parts, true), 16.2, 0, -52, -0.05));
  [[18.6, -3.2], [19.8, -3.2], [18.6, -4.4]].forEach(([x, z]) => {
    halls.add(box(1.15, 0.14, 1.15, mats.pallet, x, 0.07, z));
    halls.add(placed(createJumboBag(mats), x, 0.14, z));
  });

  // Quality-control station before the paint shop
  const qc = new THREE.Group();
  qc.add(box(2.4, 0.06, 1.1, mats.cabinet, 0, 0.95, 0));
  const qcLegGeo = new THREE.BoxGeometry(0.06, 0.95, 0.06);
  [[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]].forEach(([x, z]) => qc.add(mesh(qcLegGeo, mats.tubeBlue, x, 0.475, z)));
  qc.add(box(0.62, 0.42, 0.05, mats.darkSteel, -0.6, 1.3, -0.3));
  qc.add(box(1.8, 0.05, 0.3, mats.ledDisc, 0.2, 2.05, 0));
  qc.add(box(0.05, 1.05, 0.05, mats.darkSteel, 0.2, 1.5, 0));
  const qcBumper = parts.bumper();
  qcBumper.rotation.x = FACE_UP;
  qcBumper.position.set(0.3, 1.1, 0.1);
  qc.add(qcBumper);
  halls.add(placed(qc, 16.6, 0, -57, -Math.PI / 2));
  halls.add(placed(parts.worker({ reaching: true }), 15.3, 0, -57.2, Math.PI / 2));

  // Trolleys pushed down the aisle towards the paint shop
  const span = CART_LOOP.startZ - CART_LOOP.endZ;
  const carts: THREE.Object3D[] = [];
  for (let i = 0; i < 3; i++) {
    const cart = new THREE.Group();
    cart.add(createTrolley(mats, parts, false));
    cart.add(placed(parts.worker({ reaching: true }), 0, 0, 1.7, Math.PI));
    cart.position.set(i % 2 ? 13.4 : 10.2, 0, CART_LOOP.startZ - (span / 3) * i);
    halls.add(cart);
    carts.push(cart);
  }
  return carts;
}
