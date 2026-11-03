import * as THREE from 'three';
import { getProtractorDir, getProtractorPoint, PROTRACTOR_ORIGIN } from '../../../domain/protractor';
import { createFieldTex, createRoadTex } from '../textures';
import { box, createGabledRoof, flatPlane, mesh, placed, toVector3 } from '../primitives';
import { BuildContext } from './context';

const CAR_COLORS = [0xf2f3f5, 0xe9ebee, 0xb9bec4, 0x8d949b, 0xf7f7f7, 0x2b2f35, 0xdcdfe3];
const carColor = (i: number) => CAR_COLORS[(i * 5 + 3) % CAR_COLORS.length];

export function buildExterior(ctx: BuildContext) {
  const { scene, parts } = ctx;
  const exterior = new THREE.Group();
  scene.add(exterior);

  const ground = flatPlane(950, 950, new THREE.MeshStandardMaterial({ color: 0x8a8a78, roughness: 0.97 }), 0, -0.18, 0);
  ground.receiveShadow = true;
  exterior.add(ground);

  const yardShape = new THREE.Shape();
  yardShape.moveTo(8, -58);
  yardShape.lineTo(-105, 35);
  yardShape.lineTo(-20, 145);
  yardShape.lineTo(105, 10);
  yardShape.closePath();
  const courtyard = mesh(new THREE.ShapeGeometry(yardShape), new THREE.MeshStandardMaterial({ color: 0x6b7077, roughness: 0.88 }), 0, -0.04, 0);
  courtyard.rotation.x = -Math.PI / 2;
  courtyard.receiveShadow = true;
  exterior.add(courtyard);

  exterior.add(buildStreet(ctx));
  exterior.add(buildFirstStreetSide(ctx));
  exterior.add(buildSecondStreetSide(ctx));

  [55, 72, 90, 108, 125].forEach((deg, i) => {
    const tree = parts.tree(1.15, i % 2 === 0);
    tree.position.copy(toVector3(getProtractorPoint(deg, 22, 0)));
    exterior.add(tree);
  });

  // Cars parked in the yard in front of the halls
  for (let i = 0; i < 7; i++) {
    const p = getProtractorPoint(70 + i * 6.5, 40, 0);
    exterior.add(placed(parts.car(carColor(i)), p.x, 0, p.z, getProtractorDir(130).rotY + Math.PI / 2));
  }
}

const STREET_HALF_WIDTH = 7;
const ROAD_TILE_LENGTH = 12.5;
/** How far down each street the bend begins; the centreline radius at the apex is ≈19m. */
const CORNER_CUT = 14;

/** Centreline running out along the 165° street, round the corner at the origin and up the 30° street. */
function streetCentreline(secondStreetEnd: number, firstStreetEnd: number) {
  const along = (deg: number, dist: number) => toVector3(getProtractorPoint(deg, dist));
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.LineCurve3(along(165, secondStreetEnd), along(165, CORNER_CUT)));
  path.add(new THREE.QuadraticBezierCurve3(along(165, CORNER_CUT), toVector3(PROTRACTOR_ORIGIN), along(30, CORNER_CUT)));
  path.add(new THREE.LineCurve3(along(30, CORNER_CUT), along(30, firstStreetEnd)));
  return path.getSpacedPoints(Math.ceil(path.getLength() / 0.75));
}

/**
 * Strip swept along `pts` between two cross-section points given as [offset, height]; positive offsets lie on
 * the inner side of the bend. The strip faces up when the first offset is smaller, or toward the road for walls
 * listed bottom-to-top. V runs along the path in units of `tile` metres.
 */
function sweptStrip(pts: THREE.Vector3[], a: [number, number], b: [number, number], tile = 1) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let dist = 0;
  pts.forEach((p, i) => {
    if (i > 0) dist += p.distanceTo(pts[i - 1]);
    const t = pts[Math.min(i + 1, pts.length - 1)].clone().sub(pts[Math.max(i - 1, 0)]).normalize();
    for (const [offset, y] of [a, b]) positions.push(p.x - t.z * offset, p.y + y, p.z + t.x * offset);
    uvs.push(0, dist / tile, 1, dist / tile);
    if (i > 0) {
      const k = i * 2;
      indices.push(k - 2, k - 1, k, k - 1, k + 1, k);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Both streets as one continuous road, with the kerb along the factory side following the bend. */
function buildStreet({ mats }: BuildContext) {
  const street = new THREE.Group();

  const road = new THREE.Mesh(
    sweptStrip(streetCentreline(162.5, 197), [-STREET_HALF_WIDTH, 0.02], [STREET_HALF_WIDTH, 0.02], ROAD_TILE_LENGTH),
    new THREE.MeshStandardMaterial({ map: createRoadTex(1), roughness: 0.82 }),
  );
  road.receiveShadow = true;
  street.add(road);

  const kerbPts = streetCentreline(157.5, 187.5);
  const [k0, k1, kh] = [7.0, 7.4, 0.25];
  street.add(
    new THREE.Mesh(sweptStrip(kerbPts, [k0, kh], [k1, kh]), mats.curb),
    new THREE.Mesh(sweptStrip(kerbPts, [k0, 0], [k0, kh]), mats.curb),
    new THREE.Mesh(sweptStrip(kerbPts, [k1, kh], [k1, 0]), mats.curb),
  );
  return street;
}

function sideGroup(deg: number) {
  const g = new THREE.Group();
  g.position.copy(toVector3(PROTRACTOR_ORIGIN));
  g.rotation.y = getProtractorDir(deg).rotY;
  return g;
}

/** The 30° street with the connected buildings along the 50° line. */
function buildFirstStreetSide({ mats, parts }: BuildContext) {
  const side = sideGroup(30);

  side.add(flatPlane(130, 210, new THREE.MeshStandardMaterial({ map: createFieldTex(), roughness: 0.95 }), -72, 0.01, -92));

  let i = 0;
  for (let z = -18; z >= -145; z -= 4.8, i++) {
    const tree = parts.tree(0.88, i % 3 === 0);
    tree.position.set(9.5, 0, z);
    side.add(tree);
    if (z <= -36 && z >= -128) side.add(box(1.3, 1.2, 2.3, mats.pallet, 12.0, 0.6, z));
  }

  const cbX = 20.8;
  const cbWidth = 14.6;

  const canopyRoof = createGabledRoof(cbWidth + 0.4, 17, 1.7, mats.blueRoof);
  canopyRoof.position.set(cbX, 5.4, -41);
  side.add(canopyRoof);

  for (const cx of [cbX - 6.8, cbX, cbX + 6.8]) {
    for (const cz of [-24.5, -30, -35.5, -40.5]) {
      const col = box(0.32, 5.4, 0.32, mats.blueSteel, cx, 2.7, cz);
      col.castShadow = true;
      side.add(col);
    }
  }
  for (let r = 0; r < 3; r++) {
    side.add(box(3.8, 1.7, 2.5, mats.blueSteel, cbX - 2.2 + (r % 2) * 4.4, 0.85, -27 - r * 4.5));
  }

  const segments = [
    { bodyH: 5.8, len: 13, bodyZ: -47.5, mat: mats.facadeBlue, roofH: 1.9, roofPad: 0.6 },
    { bodyH: 7.2, len: 38, bodyZ: -73, mat: mats.exteriorPanel, roofH: 2.3, roofPad: 0.8 },
    { bodyH: 6.3, len: 46, bodyZ: -115, mat: mats.exteriorPanel, roofH: 2.1, roofPad: 0.6 },
  ];
  for (const s of segments) {
    const body = box(cbWidth, s.bodyH, s.len, s.mat, cbX, s.bodyH / 2, s.bodyZ);
    body.castShadow = true;
    const roof = createGabledRoof(cbWidth + s.roofPad, s.len, s.roofH, mats.blueRoof);
    roof.position.set(cbX, s.bodyH, s.bodyZ - s.len / 2);
    side.add(body, roof);
    side.add(box(0.5, 0.14, s.len, mats.ridgeCap, cbX, s.bodyH + s.roofH + 0.03, s.bodyZ));
  }
  side.add(box(cbWidth + 0.1, 1.5, 38, mats.facadeBlue, cbX, 6.45, -73));

  for (let z = -58; z >= -132; z -= 9.5) {
    const door = mesh(new THREE.PlaneGeometry(3.3, 3.2), mats.lightDoor, cbX - cbWidth / 2 - 0.06, 1.8, z);
    door.rotation.y = -Math.PI / 2;
    const win = mesh(new THREE.PlaneGeometry(3.3, 0.85), mats.gridWin, cbX - cbWidth / 2 - 0.06, 4.6, z);
    win.rotation.y = -Math.PI / 2;
    side.add(door, win);
  }

  return side;
}

/** The 165° street with the guard house, the wedge-shaped building and the kerbside parking. */
function buildSecondStreetSide({ mats, parts }: BuildContext) {
  const side = sideGroup(165);

  side.add(flatPlane(95, 175, new THREE.MeshStandardMaterial({ map: createFieldTex(), roughness: 0.95 }), 54.5, 0.01, -75));

  for (let z = -20, i = 0; z >= -150; z -= 6, i++) {
    const tree = parts.tree(0.8, i % 2 === 0);
    tree.position.set(8.8, 0, z);
    side.add(tree);
  }

  const guardHouse = new THREE.Group();
  const ghBody = box(4.4, 3.2, 4.8, new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.5 }), 0, 1.6, 0);
  ghBody.castShadow = true;
  guardHouse.add(ghBody, box(5.5, 0.45, 5.8, mats.blueRoof, 0, 3.35, 0));
  guardHouse.position.set(-23, 0, -34);
  guardHouse.rotation.y = 0.25;
  side.add(guardHouse);

  const wedgeShape = new THREE.Shape();
  wedgeShape.moveTo(-16.5, -42);
  wedgeShape.lineTo(-12.5, -42);
  wedgeShape.lineTo(-12.5, -98);
  wedgeShape.lineTo(-38.0, -98);
  wedgeShape.closePath();

  const wedgeWalls = mesh(new THREE.ExtrudeGeometry(wedgeShape, { depth: 5.4, bevelEnabled: false }), mats.exteriorPanel, 0, 5.4, 0);
  wedgeWalls.rotation.x = Math.PI / 2;
  wedgeWalls.castShadow = true;
  const wedgeRoof = mesh(new THREE.ExtrudeGeometry(wedgeShape, { depth: 0.45, bevelEnabled: false }), mats.blueRoof, 0, 5.65, 0);
  wedgeRoof.rotation.x = Math.PI / 2;
  side.add(wedgeWalls, wedgeRoof);

  // Rooftop AC/condenser units
  for (let i = 0; i < 5; i++) {
    const zPos = -49 - i * 9.5;
    const minX = -16 - i * 4.2;
    for (let vx = -14.5; vx >= minX; vx -= 3.6) side.add(box(0.95, 0.6, 0.75, mats.acUnit, vx, 5.95, zPos));
  }

  // Kerbside parking in front of the wedge building
  for (let z = -40, i = 0; z >= -98; z -= 5.2, i++) {
    if (i % 4 === 3) continue;
    side.add(placed(parts.car(carColor(i + 2)), -10.2, 0, z, Math.PI / 2));
  }

  return side;
}
