import * as THREE from 'three';
import { BAY3_INTERIOR, WAREHOUSE } from '../../../domain/factoryLayout';
import { box, fillInstances, wallPlane } from '../primitives';
import { BuildContext } from './context';

const { x0, x1, eaveY, ridgeRise, endZ, frontRoofEndZ } = BAY3_INTERIOR;
const MID_X = (x0 + x1) / 2;
const WALL_INSET = 0.42;
const SLOPE_RUN = MID_X - x0 - WALL_INSET;
const SLOPE_LEN = Math.hypot(SLOPE_RUN, ridgeRise);
const SLOPE_ANGLE = Math.atan2(ridgeRise, SLOPE_RUN);
/** World metres covered by one texture tile (keeps ribs/seams at real-world spacing). */
const CEILING_TILE = 4;
const PANEL_TILE = 6;
export const CORRUGATION_TILE = 4;

/** Quad with UVs in world metres so tiled textures keep a constant scale on any size. */
function quad(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, material: THREE.Material, tile: number) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([a, b, c, a, c, d].flatMap((v) => [v.x, v.y, v.z]), 3));
  const ab = a.distanceTo(b) / tile;
  const ad = a.distanceTo(d) / tile;
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, ab, 0, ab, ad, 0, 0, ab, ad, 0, ad], 2));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

/** Foil-lined pitched ceiling with portal frames and purlins between z0 and z1. */
function pitchedCeiling(ctx: BuildContext, parent: THREE.Group, zStart: number, zEnd: number) {
  const { mats } = ctx;
  const len = zStart - zEnd;
  const zc = (zStart + zEnd) / 2;
  const eave = eaveY;
  const ridge = eaveY + ridgeRise;
  const xl = x0 + WALL_INSET;
  const xr = x1 - WALL_INSET;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  parent.add(quad(V(xl, eave, zStart), V(MID_X, ridge, zStart), V(MID_X, ridge, zEnd), V(xl, eave, zEnd), mats.foilCeiling, CEILING_TILE));
  parent.add(quad(V(xr, eave, zStart), V(MID_X, ridge, zStart), V(MID_X, ridge, zEnd), V(xr, eave, zEnd), mats.foilCeiling, CEILING_TILE));

  // Purlins run lengthwise just under the foil.
  const purlins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 0.2, len), mats.frameBlue, 16);
  const purlinT: { x: number; y: number; z: number }[] = [];
  for (let i = 1; i <= 7; i++) {
    const t = i / 8;
    const y = eave + ridgeRise * t - 0.16;
    purlinT.push({ x: xl + SLOPE_RUN * t, y, z: zc }, { x: xr - SLOPE_RUN * t, y, z: zc });
  }
  parent.add(fillInstances(purlins, purlinT));

  // Portal frames every 6m: two columns and two rafters following the roof pitch.
  const frameZ: number[] = [];
  for (let z = zStart - 3; z > zEnd; z -= 6) frameZ.push(z);
  const columns = new THREE.InstancedMesh(new THREE.BoxGeometry(0.32, eave, 0.5), mats.frameBlue, frameZ.length * 2);
  const rafters = new THREE.InstancedMesh(new THREE.BoxGeometry(SLOPE_LEN, 0.55, 0.24), mats.frameBlue, frameZ.length * 2);
  const columnT: { x: number; y: number; z: number }[] = [];
  const rafterT: { x: number; y: number; z: number; rz: number }[] = [];
  frameZ.forEach((z) => {
    columnT.push({ x: xl + 0.18, y: eave / 2, z }, { x: xr - 0.18, y: eave / 2, z });
    const ry = eave + ridgeRise / 2 - 0.45;
    rafterT.push({ x: xl + SLOPE_RUN / 2, y: ry, z, rz: SLOPE_ANGLE }, { x: xr - SLOPE_RUN / 2, y: ry, z, rz: -SLOPE_ANGLE });
  });
  parent.add(fillInstances(columns, columnT), fillInstances(rafters, rafterT));
}

/** Insulated light-grey walls with a high glazed band, as in the production photo. */
function productionWalls(ctx: BuildContext, parent: THREE.Group, zStart: number, zEnd: number) {
  const { mats } = ctx;
  const len = zStart - zEnd;
  const zc = (zStart + zEnd) / 2;
  const sides = [
    { x: x0 + WALL_INSET, rot: Math.PI / 2, dir: 1 },
    { x: x1 - WALL_INSET, rot: -Math.PI / 2, dir: -1 },
  ];
  sides.forEach(({ x, rot, dir }) => {
    parent.add(wallPlane(len, eaveY, mats.interiorPanel, x, eaveY / 2, zc, rot, PANEL_TILE));
    parent.add(wallPlane(len, 2.2, mats.clerestory, x + dir * 0.02, 10.4, zc, rot));
    parent.add(box(0.16, 0.18, len, mats.frameBlue, x + dir * 0.09, 9.25, zc));
    parent.add(box(0.16, 0.18, len, mats.frameBlue, x + dir * 0.09, 11.55, zc));
    const mullions: { x: number; y: number; z: number }[] = [];
    for (let z = zStart - 0.8; z > zEnd; z -= 1.6) mullions.push({ x: x + dir * 0.06, y: 10.4, z });
    parent.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 2.2, 0.08), mats.frameBlue, mullions.length), mullions));
  });
}

/** Warehouse: blue corrugated walls, dark roof and the two-layer blue steel grid seen in the photo. */
function warehouseShell(ctx: BuildContext, parent: THREE.Group, zStart: number, zEnd: number) {
  const { mats } = ctx;
  const len = zStart - zEnd;
  const zc = (zStart + zEnd) / 2;
  const xl = x0 + WALL_INSET;
  const xr = x1 - WALL_INSET;
  const width = xr - xl;
  const gy = WAREHOUSE.gridY;

  parent.add(box(width, 0.2, len, mats.darkCeiling, MID_X, eaveY + 0.8, zc));

  const cross: { x: number; y: number; z: number }[] = [];
  for (let z = zStart - 1.5; z > zEnd; z -= 3) cross.push({ x: MID_X, y: gy, z });
  parent.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(width, 0.38, 0.2), mats.gridBlue, cross.length), cross));

  const along: { x: number; y: number; z: number }[] = [];
  for (let x = xl + 0.4; x < xr; x += 2.35) {
    along.push({ x, y: gy + 0.38, z: zc }, { x, y: gy + 2.1, z: zc });
  }
  parent.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.38, len), mats.gridBlue, along.length), along));

  const upperCross: { x: number; y: number; z: number }[] = [];
  for (let z = zStart - 3; z > zEnd; z -= 6) upperCross.push({ x: MID_X, y: gy + 2.1, z });
  parent.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(width, 0.3, 0.16), mats.gridBlue, upperCross.length), upperCross));

  const cols: { x: number; y: number; z: number }[] = [];
  for (let z = zStart - 3; z > zEnd; z -= 6) cols.push({ x: xl + 0.25, y: gy / 2, z }, { x: xr - 0.25, y: gy / 2, z });
  parent.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, gy, 0.3), mats.gridBlue, cols.length), cols));
}

export function buildHallShell(ctx: BuildContext) {
  const { mats, halls, deep } = ctx;

  // Production hall and the part of the paint shop under the front roof
  pitchedCeiling(ctx, halls, 0, frontRoofEndZ);
  productionWalls(ctx, halls, -0.4, frontRoofEndZ);

  // Rest of the paint shop's surroundings
  pitchedCeiling(ctx, deep, frontRoofEndZ, WAREHOUSE.startZ);
  productionWalls(ctx, deep, frontRoofEndZ, WAREHOUSE.startZ);

  // Warehouse and shipping
  warehouseShell(ctx, deep, WAREHOUSE.startZ, endZ);
  const len = WAREHOUSE.startZ - endZ;
  const zc = (WAREHOUSE.startZ + endZ) / 2;
  const h = eaveY + 1;
  deep.add(wallPlane(len, h, mats.interiorBlueWall, x0 + WALL_INSET, h / 2, zc, Math.PI / 2, CORRUGATION_TILE));
  deep.add(wallPlane(len, h, mats.interiorBlueWall, x1 - WALL_INSET, h / 2, zc, -Math.PI / 2, CORRUGATION_TILE));
  deep.add(wallPlane(x1 - x0, h, mats.interiorBlueWall, MID_X, h / 2, endZ + 0.4, 0, CORRUGATION_TILE));
}
