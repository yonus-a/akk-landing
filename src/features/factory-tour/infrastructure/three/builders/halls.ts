import * as THREE from 'three';
import { BAY_CENTERS_X, BAY_WIDTH, HALL_LENGTH, MAIN_HALL_HEIGHT } from '../../../domain/factoryLayout';
import { box, createGabledRoof, mesh } from '../primitives';
import { BuildContext } from './context';

/** Builds the four 23.5m halls with skylights; returns the rear orchard so it can be hidden indoors. */
export function buildHalls({ mats, parts, halls }: BuildContext) {
  const H = MAIN_HALL_HEIGHT;
  const gutterMat = new THREE.MeshStandardMaterial({ color: 0x173f99, roughness: 0.55, metalness: 0.4 });

  BAY_CENTERS_X.forEach((cx, b) => {
    const frontRoof = createGabledRoof(BAY_WIDTH - 0.2, 42, 3.15, mats.blueRoof);
    frontRoof.position.set(cx, H, -42);
    const backRoof = createGabledRoof(BAY_WIDTH - 0.2, 42, 3.35, mats.blueRoof);
    backRoof.position.set(cx, H + 0.38, -84);
    halls.add(frontRoof, backRoof);
    halls.add(box(0.7, 0.16, 42, mats.ridgeCap, cx, H + 3.17, -21));
    halls.add(box(0.7, 0.16, 42, mats.ridgeCap, cx, H + 0.38 + 3.37, -63));

    if (b < BAY_CENTERS_X.length - 1) {
      halls.add(box(0.55, 0.32, HALL_LENGTH, gutterMat, cx + BAY_WIDTH / 2, H + 0.12, -HALL_LENGTH / 2));
    }

    halls.add(box(BAY_WIDTH, 5.6, 0.65, mats.facadeBlue, cx, H - 2.8, 0));
    const gable = createGabledRoof(BAY_WIDTH, 0.65, 3.15, mats.facadeBlue);
    gable.position.set(cx, H, -0.32);
    halls.add(gable);
    halls.add(mesh(new THREE.PlaneGeometry(5.6, 3.0), mats.gridWin, cx + 1.6, H - 2.7, 0.38));

    halls.add(box(8.2, 6.6, 0.65, mats.exteriorPanel, cx - 6.6, 3.3, 0));
    halls.add(box(4.2, 6.6, 0.65, mats.exteriorPanel, cx + 8.0, 3.3, 0));
    halls.add(mesh(new THREE.PlaneGeometry(3.2, 4.2), mats.lightDoor, cx - 6.0, 2.1, 0.38));

    // The third bay's gate stays open so the camera can fly through it.
    if (b !== 2) halls.add(mesh(new THREE.PlaneGeometry(6.5, 6.2), mats.lightDoor, cx + 2.0, 3.1, 0.34));

    for (const sx of [-BAY_WIDTH * 0.42, -BAY_WIDTH * 0.14, BAY_WIDTH * 0.14, BAY_WIDTH * 0.42]) {
      halls.add(box(0.35, 6.6, 0.35, mats.steelColumn, cx + sx, 3.3, 0.2));
    }

    for (let i = 0; i < 6; i++) {
      halls.add(box(1.3, 0.65, 2.2, mats.acUnit, cx + (i % 2 === 0 ? -5.0 : 5.0), H + 3.1, -14 - i * 12));
    }

    // Translucent roof-light sheets lying on the +x slope of each roof.
    const halfSpan = (BAY_WIDTH - 0.2) / 2;
    const skylight = (rise: number, base: number, z: number) => {
      const s = box(2.0, 0.06, 5.2, mats.skylight, cx + 4.5, H + base + rise * (1 - 4.5 / halfSpan) + 0.05, z);
      s.rotation.z = -Math.atan(rise / halfSpan);
      halls.add(s);
    };
    for (let sz = -8; sz >= -36; sz -= 12) skylight(3.15, 0, sz);
    for (let sz = -46; sz >= -80; sz -= 12) skylight(3.35, 0.38, sz);
  });

  for (const x of [-47.0, 47.0]) {
    halls.add(box(0.8, 6.6, HALL_LENGTH, mats.exteriorPanel, x, 3.3, -HALL_LENGTH / 2));
    halls.add(box(0.8, 5.8, HALL_LENGTH, mats.facadeBlue, x, 9.3, -HALL_LENGTH / 2));
  }

  const orchard = new THREE.Group();
  let i = 0;
  for (let gx = -44; gx <= 44; gx += 7.0) {
    for (let gz = -89; gz >= -130; gz -= 6.2, i++) {
      const tree = parts.tree(1.1, i % 3 === 0);
      tree.position.set(gx + (gz % 2) * 1.4, 0, gz);
      orchard.add(tree);
    }
  }
  halls.add(orchard);
  return orchard;
}
