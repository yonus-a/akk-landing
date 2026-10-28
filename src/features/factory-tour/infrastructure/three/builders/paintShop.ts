import * as THREE from 'three';
import { BAY3_LOCAL_X, PAINT_SHOP, PAINT_STAND_LOOP } from '../../../domain/factoryLayout';
import { Materials } from '../materials';
import { box, cylinder, flatPlane, mesh, Parts, placed, taperedBox } from '../primitives';
import { BuildContext } from './context';

const X = BAY3_LOCAL_X;
const GLASS_TOP = 3.6;
const OPENING_H = 4.6;
const MULLION_STEP = 1.25;
/** Front/back of the room split at the same depth as the rest of the hall's deep interior. */
const SPLIT_Z = -82;

/** Glazed run along a wall (sill, glass, mullions, transom); `axis` is the direction the run extends in. */
function glazing(mats: Materials, len: number, bottom: number, top: number, axis: 'x' | 'z') {
  const g = new THREE.Group();
  const h = top - bottom;
  const run = (w: number, hh: number, d: number) => (axis === 'z' ? [d, hh, w] : [w, hh, d]) as [number, number, number];
  g.add(box(...run(len, 0.14, 0.12), mats.blueSteel, 0, bottom + 0.07, 0));
  g.add(box(...run(len, h, 0.03), mats.glass, 0, bottom + h / 2, 0));
  g.add(box(...run(len, 0.14, 0.12), mats.blueSteel, 0, top, 0));
  for (let s = -len / 2; s <= len / 2 + 0.01; s += MULLION_STEP) {
    const m = box(0.1, h, 0.1, mats.blueSteel, 0, bottom + h / 2, 0);
    if (axis === 'z') m.position.z = s; else m.position.x = s;
    g.add(m);
  }
  return g;
}

function xMark(mats: Materials, size: number, x: number, y: number, z: number, rotY: number) {
  const m = mesh(new THREE.PlaneGeometry(size, size), mats.xMark, x, y, z);
  m.rotation.y = rotY;
  return m;
}

/** Left wall: full-height glazing; right wall: white tiled wash wall with a glazed band above. */
function paintSideWall(mats: Materials, x: number, zCenter: number, len: number, isRight: boolean) {
  const g = new THREE.Group();
  const ceiling = PAINT_SHOP.ceilingY;
  const inward = isRight ? -Math.PI / 2 : Math.PI / 2;
  const inwardX = isRight ? -0.12 : 0.07;
  if (isRight) {
    g.add(box(0.2, 4.0, len, mats.tile, 0, 2.0, 0));
    g.add(glazing(mats, len, 4.0, 5.4, 'z'));
    g.add(box(0.12, ceiling - 5.4, len, mats.paintCeiling, 0, (ceiling + 5.4) / 2, 0));
    for (let z = -len / 2 + 3; z < len / 2; z += 6) g.add(xMark(mats, 0.7, inwardX, 3.0, z, inward));
  } else {
    g.add(glazing(mats, len, 0.3, GLASS_TOP, 'z'));
    g.add(box(0.12, ceiling - GLASS_TOP, len, mats.paintCeiling, 0, (ceiling + GLASS_TOP) / 2, 0));
    for (let z = -len / 2 + 2.5; z < len / 2; z += 5) g.add(xMark(mats, 0.75, inwardX, 2.1, z, inward));
  }
  g.position.set(x, 0, zCenter);
  return g;
}

/** End wall with a central opening tall enough for the camera to fly through. */
function paintEndWall(mats: Materials, openingW: number) {
  const g = new THREE.Group();
  const width = PAINT_SHOP.x1 - PAINT_SHOP.x0;
  const segW = (width - openingW) / 2;
  const ceiling = PAINT_SHOP.ceilingY;
  [-1, 1].forEach((s) => {
    const cx = X + s * (openingW / 2 + segW / 2);
    const glass = glazing(mats, segW, 0.3, GLASS_TOP, 'x');
    glass.position.x = cx;
    g.add(glass);
    g.add(box(segW, OPENING_H - GLASS_TOP, 0.12, mats.paintCeiling, cx, (OPENING_H + GLASS_TOP) / 2, 0));
    g.add(xMark(mats, 0.75, cx, 2.1, 0.07, 0));
  });
  g.add(box(width, ceiling - OPENING_H, 0.12, mats.paintCeiling, X, (ceiling + OPENING_H) / 2, 0));
  g.add(mesh(new THREE.PlaneGeometry(openingW, 0.3), mats.hazard, X, OPENING_H - 0.15, 0.07));
  return g;
}

/** White sheet-metal extraction hood hung on chains, with a lamp underneath. */
function hangingHood(mats: Materials, z: number) {
  const g = new THREE.Group();
  const bottom = 4.55;
  g.add(mesh(taperedBox(2.3, 0.6, 1.9, 0.35, 0.4), mats.hood, 0, bottom + 0.3, 0));
  g.add(box(0.8, 0.35, 0.75, mats.hood, 0, bottom + 0.78, 0));
  const lamp = flatPlane(1.6, 1.2, mats.boothLight, 0, bottom - 0.01, 0);
  lamp.rotation.x = Math.PI / 2;
  g.add(lamp);
  const chainLen = PAINT_SHOP.ceilingY - (bottom + 0.95);
  [-0.3, 0.3].forEach((x) => g.add(cylinder(0.018, chainLen, mats.chain, x, bottom + 0.95 + chainLen / 2, 0, 6)));
  g.position.set(X, 0, z);
  return g;
}

/** White tubular stand riding the floor chain, holding one bumper upright. */
function createBumperStand(mats: Materials, parts: Parts) {
  const g = new THREE.Group();
  g.add(box(0.5, 0.06, 0.9, mats.tubeWhite, 0, 0.03, 0));
  g.add(box(0.06, 1.75, 0.06, mats.tubeWhite, 0, 0.9, -0.1));
  g.add(box(1.7, 0.05, 0.05, mats.tubeWhite, 0, 1.85, -0.1));
  g.add(box(1.5, 0.05, 0.05, mats.tubeWhite, 0, 1.25, -0.1));
  [-0.75, 0.75].forEach((x) => g.add(box(0.04, 0.04, 0.35, mats.tubeWhite, x, 1.85, 0.05)));
  const bumper = parts.bumper();
  bumper.position.set(0, 1.55, 0.12);
  g.add(bumper);
  return g;
}

function createPaintBooth(mats: Materials, parts: Parts, zCenter: number, withWorker: boolean) {
  const g = new THREE.Group();
  const postGeo = new THREE.BoxGeometry(0.12, 3.6, 0.12);
  [[-1.6, -1.9], [1.6, -1.9], [-1.6, 1.9], [1.6, 1.9]].forEach(([x, z]) => g.add(mesh(postGeo, mats.blueSteel, x, 1.8, z)));
  g.add(box(3.4, 0.12, 4.0, mats.blueSteel, 0, 3.66, 0));
  g.add(box(3.2, 3.5, 0.03, mats.glass, 0, 1.8, -1.9));
  g.add(box(3.2, 3.5, 0.03, mats.glass, 0, 1.8, 1.9));
  g.add(box(0.12, 3.5, 3.8, mats.tile, -1.6, 1.75, 0));
  const ceilingLight = flatPlane(2.6, 3.2, mats.boothLight, 0, 3.58, 0);
  ceilingLight.rotation.x = Math.PI / 2;
  g.add(ceilingLight);

  g.add(placed(createBumperStand(mats, parts), 0.3, 0, 0, Math.PI / 2));

  g.add(box(2.9, 0.7, 2.9, mats.hood, 0, 4.1, 0));
  g.add(cylinder(0.32, 2.7, mats.silver, 0, 5.6, 0, 14));

  if (withWorker) g.add(placed(parts.worker({ headwear: 'cap', mask: true, reaching: true }), -0.8, 0, 0.3, Math.PI / 2));

  g.position.set(6.8, 0.45, zCenter);
  return g;
}

/** Enclosed paint shop; returns the bumper stands travelling on the floor chain conveyor. */
export function buildPaintShop({ mats, parts, halls, deep }: BuildContext) {
  const { x0, x1, frontZ, rearZ, ceilingY } = PAINT_SHOP;
  const frontLen = frontZ - SPLIT_Z;
  const rearLen = SPLIT_Z - rearZ;
  const frontC = (frontZ + SPLIT_Z) / 2;
  const rearC = (SPLIT_Z + rearZ) / 2;

  const front = paintEndWall(mats, 4.6);
  front.position.z = frontZ;
  halls.add(front);
  const rear = paintEndWall(mats, 3.6);
  rear.position.z = rearZ;
  deep.add(rear);

  halls.add(paintSideWall(mats, x0, frontC, frontLen, false));
  halls.add(paintSideWall(mats, x1, frontC, frontLen, true));
  deep.add(paintSideWall(mats, x0, rearC, rearLen, false));
  deep.add(paintSideWall(mats, x1, rearC, rearLen, true));

  const svcDoor = mesh(new THREE.PlaneGeometry(1.5, 2.5), mats.lightDoor, x1 - 0.11, 1.7, -70);
  svcDoor.rotation.y = -Math.PI / 2;
  halls.add(svcDoor);

  halls.add(box(x1 - x0, 0.15, frontLen, mats.paintCeiling, X, ceilingY, frontC));
  deep.add(box(x1 - x0, 0.15, rearLen, mats.paintCeiling, X, ceilingY, rearC));

  // Raised galvanized grating floor, entry step and the floor-chain slot down the middle
  halls.add(box(15.9, 0.45, frontLen - 2, mats.grating, X, 0.225, frontC - 1));
  deep.add(box(15.9, 0.45, rearLen, mats.grating, X, 0.225, rearC));
  halls.add(box(4.4, 0.24, 0.8, mats.grating, X, 0.12, frontZ + 0.65));
  halls.add(flatPlane(0.22, frontLen - 2, mats.machineDark, X, 0.455, frontC - 1));
  deep.add(flatPlane(0.22, rearLen, mats.machineDark, X, 0.455, rearC));

  [[9.1, frontZ + 0.7], [14.4, frontZ + 0.7]].forEach(([x, z]) => halls.add(cylinder(0.11, 0.9, mats.bollard, x, 0.45, z, 10)));

  for (let z = frontZ - 6; z > rearZ + 2; z -= 8) (z > SPLIT_Z ? halls : deep).add(hangingHood(mats, z));

  const stands: THREE.Object3D[] = [];
  const count = Math.floor((PAINT_STAND_LOOP.startZ - PAINT_STAND_LOOP.endZ) / PAINT_STAND_LOOP.spacing);
  for (let i = 0; i < count; i++) {
    const s = placed(createBumperStand(mats, parts), X, 0.45, PAINT_STAND_LOOP.startZ - i * PAINT_STAND_LOOP.spacing);
    deep.add(s);
    stands.push(s);
  }

  halls.add(createPaintBooth(mats, parts, -72, true));
  deep.add(createPaintBooth(mats, parts, -82, true));
  deep.add(createPaintBooth(mats, parts, -92, false));

  // Sprayers working the line from the far side
  deep.add(placed(parts.worker({ headwear: 'cap', mask: true, reaching: true }), 13.4, 0.45, -87, -Math.PI / 2));
  halls.add(placed(parts.worker({ headwear: 'cap', mask: true, reaching: true }), 13.4, 0.45, -76, -Math.PI / 2));

  // Flash-off zone (heated panels)
  deep.add(box(0.12, 2.4, 4.5, mats.flashGlow, 8.4, 2.55, -99));
  deep.add(box(0.12, 2.4, 4.5, mats.flashGlow, 15.1, 2.55, -99));

  deep.add(placed(parts.worker({ suit: 0x5d636b, accent: 0x5d636b }), 13.9, 0.45, -105.2, -Math.PI / 2.2));

  return stands;
}
