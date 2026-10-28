import * as THREE from 'three';
import { createContactShadowTex } from './textures';

const MAX_FOOTPRINT = 14;
const MAX_LIFT = 0.6;
/** The blur in the texture only darkens its middle ~55%, so the plane is scaled up to cover the footprint. */
const SPREAD = 1.55;
/** Above the floor slab (0.045) and its painted lines and decals (≤ 0.062). */
const FLOOR_CLEARANCE = 0.075;

const tmpBox = new THREE.Box3();
const toLocal = new THREE.Matrix4();
const rel = new THREE.Matrix4();

function isCandidateMesh(o: THREE.Object3D): o is THREE.Mesh {
  const m = o as THREE.Mesh;
  return m.isMesh && !(o as THREE.InstancedMesh).isInstancedMesh && !!m.geometry && m.visible;
}

/** Bounding box of `root`'s meshes in root's own coordinate frame (ignores rotation of the root itself). */
function localBounds(root: THREE.Object3D, out: THREE.Box3) {
  out.makeEmpty();
  toLocal.copy(root.matrixWorld).invert();
  root.traverse((o) => {
    if (!isCandidateMesh(o) || o.userData.contactShadow) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    rel.multiplyMatrices(toLocal, o.matrixWorld);
    out.union(tmpBox.copy(o.geometry.boundingBox!).applyMatrix4(rel));
  });
  return out;
}

/**
 * Fakes ambient occlusion: a soft dark footprint under every free-standing object (machines, trolleys,
 * workers, cars…). Large containers are walked into rather than shadowed as a whole.
 */
export function addContactShadows(roots: THREE.Object3D[], opacity = 0.5) {
  const material = new THREE.MeshBasicMaterial({
    map: createContactShadowTex(),
    color: 0x000000,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.rotateX(-Math.PI / 2);
  const box = new THREE.Box3();
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  const visit = (obj: THREE.Object3D, depth: number) => {
    const isGroup = (obj as THREE.Group).isGroup || obj.type === 'Object3D';
    const isSolid = isCandidateMesh(obj) && obj.castShadow;
    if (!isGroup && !isSolid) return;

    localBounds(obj, box);
    if (box.isEmpty()) return;
    box.getSize(size);
    const fits = size.x <= MAX_FOOTPRINT && size.z <= MAX_FOOTPRINT && size.y > 0.2 && box.min.y <= MAX_LIFT;

    if (fits) {
      box.getCenter(center);
      const blob = new THREE.Mesh(geometry, material);
      blob.userData.contactShadow = true;
      blob.scale.set(size.x * SPREAD + 0.25, 1, size.z * SPREAD + 0.25);
      blob.position.set(center.x, box.min.y + FLOOR_CLEARANCE, center.z);
      blob.renderOrder = 1;
      obj.add(blob);
      return;
    }
    if (isGroup && depth < 4) [...obj.children].forEach((c) => visit(c, depth + 1));
  };

  roots.forEach((root) => {
    root.updateMatrixWorld(true);
    [...root.children].forEach((c) => visit(c, 1));
  });
  return { material, geometry };
}
