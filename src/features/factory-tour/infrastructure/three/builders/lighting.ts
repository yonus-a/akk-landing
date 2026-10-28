import * as THREE from 'three';
import { BAY3_INTERIOR, BAY3_LOCAL_X, HANGING_SIGNS, WAREHOUSE } from '../../../domain/factoryLayout';
import { createSignTex } from '../textures';
import { box, fillInstances, InstanceTransform, mesh } from '../primitives';
import { BuildContext } from './context';

const X = BAY3_LOCAL_X;

export function buildSceneLights(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  const hemi = new THREE.HemisphereLight(0xe4ecf5, 0x8d8a80, 0.45);
  scene.add(ambient, hemi);

  const sun = new THREE.DirectionalLight(0xfff3df, 1.35);
  sun.position.set(85, 130, 65);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06;
  const d = 220;
  Object.assign(sun.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 10, far: 480 });
  scene.add(sun);
  return { ambient, hemi, sun };
}

/** Round high-bay luminaires: dark housing, bright diffuser and an additive halo. */
function highBays(ctx: BuildContext, parent: THREE.Group, positions: { x: number; z: number }[], y: number, hangTo: number) {
  const { mats } = ctx;
  const housings: InstanceTransform[] = positions.map((p) => ({ x: p.x, y: y + 0.2, z: p.z }));
  const discs: InstanceTransform[] = positions.map((p) => ({ x: p.x, y, z: p.z }));
  const rodLen = hangTo - (y + 0.4);
  const rods: InstanceTransform[] = positions.map((p) => ({ x: p.x, y: y + 0.4 + rodLen / 2, z: p.z }));

  parent.add(fillInstances(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.26, 0.42, 0.4, 16), mats.darkSteel, positions.length), housings));
  parent.add(fillInstances(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 16), mats.ledDisc, positions.length), discs));
  parent.add(fillInstances(new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, rodLen, 0.03), mats.darkSteel, positions.length), rods));

  const halo = new THREE.BufferGeometry();
  halo.setAttribute('position', new THREE.Float32BufferAttribute(positions.flatMap((p) => [p.x, y - 0.05, p.z]), 3));
  parent.add(new THREE.Points(halo, mats.glow));

  const sheen = new THREE.PlaneGeometry(6, 6);
  sheen.rotateX(-Math.PI / 2);
  const pools = new THREE.InstancedMesh(sheen, mats.floorSheen, positions.length);
  parent.add(fillInstances(pools, positions.map((p) => ({ x: p.x, y: 0.065, z: p.z }))));
}

/** Luminaires, interior point lights and suspended zone signs. */
export function buildInteriorLighting(ctx: BuildContext) {
  const { mats, halls, deep } = ctx;
  const columns = [6.2, 17.3];

  const production: { x: number; z: number }[] = [];
  for (let z = -8; z >= -60; z -= 8) columns.forEach((x) => production.push({ x, z }));
  highBays(ctx, halls, production, 9.4, BAY3_INTERIOR.eaveY + 1.2);

  const warehouse: { x: number; z: number }[] = [];
  for (let z = -112; z >= -186; z -= 6) [...columns, X].forEach((x) => warehouse.push({ x, z }));
  highBays(ctx, deep, warehouse, WAREHOUSE.gridY - 0.6, WAREHOUSE.gridY);

  const pointLights: [color: number, intensity: number, distance: number, y: number, z: number, parent: THREE.Group][] = [
    [0xf5f8ff, 0.7, 40, 9.0, -14, halls],
    [0xf5f8ff, 0.7, 40, 9.0, -40, halls],
    [0xfff8ee, 0.9, 30, 6.4, -74, halls],
    [0xfff8ee, 0.9, 30, 6.4, -96, deep],
    [0xfff1dc, 0.8, 34, 7.2, -128, deep],
    [0xfff1dc, 0.8, 34, 7.2, -158, deep],
    [0xfff1dc, 0.7, 34, 7.2, -180, deep],
  ];
  pointLights.forEach(([color, intensity, distance, y, z, parent]) => {
    const light = new THREE.PointLight(color, intensity, distance, 1.6);
    light.position.set(X, y, z);
    parent.add(light);
  });

  HANGING_SIGNS.forEach((s, idx) => {
    const g = new THREE.Group();
    const signY = idx === 1 ? 6.2 : 6.9;
    g.add(mesh(new THREE.PlaneGeometry(5.4, 1.35), new THREE.MeshBasicMaterial({ map: createSignTex(s.fa, s.en, s.color), side: THREE.DoubleSide }), 0, signY, 0));
    const top = idx >= 2 ? WAREHOUSE.gridY : BAY3_INTERIOR.eaveY + 1;
    [-2.2, 2.2].forEach((rx) => g.add(box(0.03, top - signY, 0.03, mats.darkSteel, rx, (top + signY) / 2, 0)));
    g.position.set(X, 0, s.z);
    (idx < 2 ? halls : deep).add(g);
  });
}
