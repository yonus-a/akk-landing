import * as THREE from 'three';
import { BAY3_LOCAL_X, FLOOR_DECALS } from '../../../domain/factoryLayout';
import { createFloorDecalTex, createSafetyBoardTex } from '../textures';
import { box, cylinder, fillInstances, flatPlane } from '../primitives';
import { BuildContext } from './context';

/** White dashed lane lines (1.8m dash, 1.2m gap) painted on the concrete. */
function dashedLine(material: THREE.Material, x: number, zStart: number, zEnd: number) {
  const dashes: { x: number; y: number; z: number; rx: number }[] = [];
  for (let z = zStart - 0.9; z > zEnd; z -= 3) dashes.push({ x, y: 0.058, z, rx: -Math.PI / 2 });
  return fillInstances(new THREE.InstancedMesh(new THREE.PlaneGeometry(0.12, 1.8), material, dashes.length), dashes);
}

/** Polished concrete floor, lane markings, walkway, zone decals and entry safety furniture. */
export function buildHallFloor({ mats, halls, deep }: BuildContext) {
  const X = BAY3_LOCAL_X;

  const front = flatPlane(23.4, 84, mats.floorFront, X, 0.045, -42);
  front.receiveShadow = true;
  halls.add(front);
  const back = flatPlane(23.4, 106, mats.floorDeep, X, 0.045, -137);
  back.receiveShadow = true;
  deep.add(back);

  for (const x of [8.6, 14.9]) {
    halls.add(dashedLine(mats.lineWhite, x, -2, -62));
    deep.add(dashedLine(mats.lineWhite, x, -108, -166));
  }
  // Solid edge line in front of each press row
  for (const x of [6.4, 17.1]) halls.add(flatPlane(0.1, 50, mats.lineWhite, x, 0.056, -28));

  // Pedestrian walkway along the right wall
  halls.add(flatPlane(1.6, 78, mats.walkGreen, 22.2, 0.052, -41));
  deep.add(flatPlane(1.6, 96, mats.walkGreen, 22.2, 0.052, -132));
  halls.add(flatPlane(0.08, 78, mats.lineWhite, 21.35, 0.056, -41));
  deep.add(flatPlane(0.08, 96, mats.lineWhite, 21.35, 0.056, -132));

  for (let x = 9.05; x <= 14.6; x += 1.1) {
    halls.add(flatPlane(0.55, 1.4, mats.lineWhite, x, 0.06, -60));
    deep.add(flatPlane(0.55, 1.4, mats.lineWhite, x, 0.06, -114));
  }

  halls.add(flatPlane(4.8, 0.9, mats.hazard, X, 0.06, -62.6));

  FLOOR_DECALS.forEach((d, i) => {
    const decal = flatPlane(3.4, 1.3, new THREE.MeshBasicMaterial({ map: createFloorDecalTex(d.fa, d.en, d.color), transparent: true, opacity: 0.8 }), d.x, 0.062, d.z);
    (i < 2 ? halls : deep).add(decal);
  });

  const board = new THREE.Group();
  board.add(
    box(2.6, 1.5, 0.08, new THREE.MeshBasicMaterial({ map: createSafetyBoardTex() }), 0, 1.9, 0),
    box(0.1, 1.2, 0.1, mats.darkSteel, -1.1, 0.6, 0),
    box(0.1, 1.2, 0.1, mats.darkSteel, 1.1, 0.6, 0),
  );
  board.position.set(7.2, 0, -3);
  halls.add(board);

  const extinguisher = (x: number, z: number, parent: THREE.Group) => {
    const g = new THREE.Group();
    g.add(box(0.1, 0.9, 0.1, mats.darkSteel, 0, 0.45, 0), cylinder(0.09, 0.55, mats.extinguisher, 0, 0.75, 0, 10));
    g.position.set(x, 0, z);
    parent.add(g);
  };
  extinguisher(21.6, -6, halls);
  extinguisher(20.4, -63.2, halls);
  extinguisher(21.6, -117, deep);
  extinguisher(21.6, -168, deep);
}
