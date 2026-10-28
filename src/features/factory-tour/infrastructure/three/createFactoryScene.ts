import * as THREE from 'three';
import { AERIAL_WORLD_LOOK, AERIAL_WORLD_POSITION, CameraPose, POINTER_PARALLAX } from '../../domain/cameraPath';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { BAY3_LOCAL_X, CART_LOOP, HALLS_ANGLE_DEG, HALLS_ORIGIN, PAINT_STAND_LOOP } from '../../domain/factoryLayout';
import { Vec3 } from '../../domain/geometry';
import { getProtractorDir, getProtractorPoint } from '../../domain/protractor';
import { TourStage } from '../../domain/tourSteps';
import { createMaterials } from './materials';
import { createParts, toVector3 } from './primitives';
import { createSkyTex } from './textures';
import { BuildContext } from './builders/context';
import { buildHallShell } from './builders/hallShell';
import { addContactShadows } from './contactShadows';
import { buildExterior } from './builders/exterior';
import { buildHalls } from './builders/halls';
import { buildHallFloor } from './builders/hallFloor';
import { buildProduction } from './builders/production';
import { buildPaintShop } from './builders/paintShop';
import { buildWarehouse } from './builders/warehouse';
import { buildInteriorLighting, buildSceneLights } from './builders/lighting';

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface FactoryScene {
  /** Mutable camera pose in hall-local space; tween it to move the camera. */
  readonly cameraPose: CameraPose;
  setSize(width: number, height: number): void;
  /** Pauses or resumes the render loop (e.g. while scrolled out of view). */
  setActive(active: boolean): void;
  /** Pointer position in -1..1 on both axes, used for a subtle look-around parallax. */
  setPointer(x: number, y: number): void;
  applyStage(stage: TourStage): void;
  projectToScreen(point: Vec3): ScreenPoint;
  getViewportSize(): { width: number; height: number };
  /** Subscribes to every rendered frame; returns an unsubscribe function. */
  onFrame(listener: () => void): () => void;
  dispose(): void;
}

export function createFactoryScene(canvas: HTMLCanvasElement): FactoryScene {
  let width = canvas.clientWidth || window.innerWidth;
  let height = canvas.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const skyTex = createSkyTex();
  const background = new THREE.Color(0xdfe2e0);
  const fog = new THREE.FogExp2(0xdcdcd4, 0.0024);
  scene.background = skyTex;
  scene.fog = fog;

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.3, 950);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  // Neutral studio-like environment so painted steel, glass and plastic pick up soft reflections.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  pmrem.dispose();

  const lights = buildSceneLights(scene);

  const halls = new THREE.Group();
  halls.position.copy(toVector3(getProtractorPoint(HALLS_ORIGIN.deg, HALLS_ORIGIN.dist, 0)));
  halls.rotation.y = getProtractorDir(HALLS_ANGLE_DEG).rotY;
  scene.add(halls);

  const deep = new THREE.Group();
  deep.visible = false;
  halls.add(deep);

  const mats = createMaterials();
  const ctx: BuildContext = { scene, mats, parts: createParts(mats), halls, deep };
  buildExterior(ctx);
  const orchard = buildHalls(ctx);
  buildHallShell(ctx);
  buildHallFloor(ctx);
  const carts = buildProduction(ctx);
  const paintStands = buildPaintShop(ctx);
  buildWarehouse(ctx);
  buildInteriorLighting(ctx);

  const litMaterials = new Set<THREE.MeshStandardMaterial>();
  scene.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (!m.isMesh) return;
    const list = Array.isArray(m.material) ? m.material : [m.material];
    const lit = list.filter((mat): mat is THREE.MeshStandardMaterial => (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial);
    if (!lit.length) return;
    lit.forEach((mat) => litMaterials.add(mat));
    m.receiveShadow = true;
    // Roofs and walls must block the sun, otherwise it floods the interior through them.
    if (!lit.some((mat) => mat.transparent)) m.castShadow = true;
  });
  litMaterials.forEach((mat) => { mat.envMapIntensity = 0.3; });
  addContactShadows([scene]);

  // The scene is static apart from a few small movers indoors, so the sun's shadow map is rendered on demand.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  halls.updateMatrixWorld(true);

  // Follows the camera through the hall so the current zone is always lit.
  const interiorLight = new THREE.PointLight(0xf2f6ff, 0.9, 60, 1.4);
  interiorLight.position.set(BAY3_LOCAL_X, 9.0, -40);
  halls.add(interiorLight);

  const startPos = halls.worldToLocal(toVector3(AERIAL_WORLD_POSITION));
  const startLook = halls.worldToLocal(toVector3(AERIAL_WORLD_LOOK));
  const cameraPose: CameraPose = {
    px: startPos.x, py: startPos.y, pz: startPos.z,
    lx: startLook.x, ly: startLook.y, lz: startLook.z,
  };

  const pointer = { x: 0, y: 0 };
  const listeners = new Set<() => void>();
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();
  const tmpProject = new THREE.Vector3();

  let frameId = 0;
  let lastT = performance.now();

  const advanceLoop = (obj: THREE.Object3D, dz: number, loop: { startZ: number; endZ: number }) => {
    obj.position.z -= dz;
    if (obj.position.z < loop.endZ) obj.position.z = loop.startZ;
  };

  let active = true;

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    interiorLight.position.z = cameraPose.pz - 12;
    carts.forEach((c) => advanceLoop(c, dt * CART_LOOP.speed, CART_LOOP));
    paintStands.forEach((s) => advanceLoop(s, dt * PAINT_STAND_LOOP.speed, PAINT_STAND_LOOP));

    halls.localToWorld(tmpPos.set(cameraPose.px, cameraPose.py, cameraPose.pz));
    halls.localToWorld(tmpLook.set(
      cameraPose.lx + pointer.x * POINTER_PARALLAX.x,
      cameraPose.ly - pointer.y * POINTER_PARALLAX.y,
      cameraPose.lz,
    ));
    camera.position.copy(tmpPos);
    camera.lookAt(tmpLook);

    renderer.render(scene, camera);
    listeners.forEach((l) => l());
  };
  animate();

  return {
    cameraPose,
    setSize(w, h) {
      if (w === 0 || h === 0) return;
      width = w;
      height = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    },
    setActive(next) {
      if (next === active) return;
      active = next;
      if (active) {
        lastT = performance.now();
        animate();
      } else {
        cancelAnimationFrame(frameId);
      }
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    applyStage(stage) {
      const { theme } = stage;
      background.setHex(theme.background);
      scene.background = theme.sky ? skyTex : background;
      fog.color.setHex(theme.fog);
      lights.hemi.intensity = 0.45 * theme.interiorFill;
      lights.ambient.intensity = 0.25 * theme.interiorFill;
      litMaterials.forEach((mat) => { mat.envMapIntensity = theme.reflections; });
      renderer.toneMappingExposure = theme.exposure;
      if (deep.visible !== stage.showDeepInterior) renderer.shadowMap.needsUpdate = true;
      deep.visible = stage.showDeepInterior;
      orchard.visible = !stage.showDeepInterior;
    },
    projectToScreen(point) {
      tmpProject.set(point.x, point.y, point.z).project(camera);
      return {
        x: (tmpProject.x * 0.5 + 0.5) * width,
        y: (-tmpProject.y * 0.5 + 0.5) * height,
      };
    },
    getViewportSize: () => ({ width, height }),
    onFrame(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      active = false;
      cancelAnimationFrame(frameId);
      listeners.clear();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) geometries.add(m.geometry);
        if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => materials.add(mat));
      });
      Object.values(mats).forEach((mat) => materials.add(mat));
      geometries.forEach((g) => g.dispose());
      materials.forEach((mat) => {
        Object.values(mat).forEach((value) => {
          if (value instanceof THREE.Texture) value.dispose();
        });
        mat.dispose();
      });
      skyTex.dispose();
      envTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
