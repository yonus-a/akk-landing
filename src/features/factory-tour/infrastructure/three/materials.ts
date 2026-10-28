import * as THREE from 'three';
import {
  createConcreteFloorTex,
  createCorrugatedTex,
  createExteriorPanelTex,
  createFoilCeilingTex,
  createGlowTex,
  createGratingTex,
  createGridWinTex,
  createHazardTex,
  createRollerShutterTex,
  createSandwichPanelTex,
  createStretchWrapTex,
  createTileTex,
  createXMarkTex,
} from './textures';

const std = (params: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(params);
const basic = (params: THREE.MeshBasicMaterialParameters) => new THREE.MeshBasicMaterial(params);

/** Colours sampled from the reference photos of the AKK plant. */
const PALETTE = {
  roofBlue: '#2a66dc',
  roofShade: 'rgba(10,40,120,0.35)',
  frameBlue: 0x3d9ad8,
  deepBlue: '#1f4fb8',
  lavender: 0x9aa8db,
  lavenderTrim: 0x7383bd,
};

export function createMaterials() {
  return {
    // Exterior
    blueRoof: std({ map: createCorrugatedTex(PALETTE.roofBlue, PALETTE.roofShade, 26, 18), roughness: 0.5, metalness: 0.15, side: THREE.DoubleSide }),
    facadeBlue: std({ map: createCorrugatedTex('#2459cc', 'rgba(5,30,100,0.35)', 14, 7), roughness: 0.45, metalness: 0.25, side: THREE.DoubleSide }),
    exteriorPanel: std({ map: createExteriorPanelTex(4, 2), roughness: 0.85 }),
    ridgeCap: std({ color: 0xdfe4ea, roughness: 0.5, metalness: 0.4 }),
    blueSteel: std({ color: 0x1f5ed6, roughness: 0.4, metalness: 0.5 }),
    concreteWall: std({ color: 0xc2c7cd, roughness: 0.85 }),
    lightDoor: std({ map: createRollerShutterTex(), roughness: 0.5, metalness: 0.45 }),
    darkOpening: std({ color: 0x14181e, roughness: 0.95 }),
    curb: std({ color: 0xb4b9be, roughness: 0.75 }),
    gridWin: basic({ map: createGridWinTex(5, 3) }),
    bush: std({ color: 0x3d6b26, roughness: 0.9, flatShading: true }),
    bushDark: std({ color: 0x2c5520, roughness: 0.9, flatShading: true }),
    trunk: std({ color: 0x5a4632, roughness: 0.9 }),
    pallet: std({ color: 0xa47b4e, roughness: 0.9 }),
    steelColumn: std({ color: 0x24508f, roughness: 0.4, metalness: 0.55 }),
    acUnit: std({ color: 0xeef1f3, roughness: 0.5, metalness: 0.2 }),
    carGlass: std({ color: 0x1b232c, roughness: 0.1, metalness: 0.6 }),
    tyre: std({ color: 0x141414, roughness: 0.85 }),

    // Production hall shell
    floorFront: std({ map: createConcreteFloorTex(4, 14), color: 0xc2c5c8, roughness: 0.3, metalness: 0.05 }),
    floorDeep: std({ map: createConcreteFloorTex(4, 18), color: 0x8f949a, roughness: 0.45, metalness: 0.05 }),
    // Additive light pools on the polished floor under each high-bay lamp.
    floorSheen: basic({ map: createGlowTex(), color: 0xfff4dc, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }),
    // These three are mapped with world-metre UVs (see wallPlane/quad), so their repeat stays 1.
    interiorPanel: std({ map: createSandwichPanelTex(1, 1), color: 0xcfd3d7, roughness: 0.6, metalness: 0.1 }),
    interiorBlueWall: std({ map: createCorrugatedTex(PALETTE.deepBlue, 'rgba(0,15,60,0.4)', 1, 1), roughness: 0.5, metalness: 0.3 }),
    foilCeiling: std({ map: createFoilCeilingTex(1, 1), color: 0xeef0f2, roughness: 0.45, metalness: 0.3, side: THREE.DoubleSide }),
    frameBlue: std({ color: PALETTE.frameBlue, roughness: 0.45, metalness: 0.35 }),
    gridBlue: std({ color: 0x2452c0, roughness: 0.5, metalness: 0.35 }),
    darkCeiling: std({ color: 0x1a1f27, roughness: 0.9 }),
    clerestory: basic({ color: 0xf3f7fb }),
    lineWhite: basic({ color: 0xf4f6f8 }),
    lineYellow: basic({ color: 0xf2c230 }),
    walkGreen: basic({ color: 0x3f8f4f, transparent: true, opacity: 0.75 }),
    hazard: basic({ map: createHazardTex() }),

    // Machines and equipment
    machineLavender: std({ color: PALETTE.lavender, roughness: 0.38, metalness: 0.15 }),
    machineTrim: std({ color: PALETTE.lavenderTrim, roughness: 0.4, metalness: 0.2 }),
    machineDark: std({ color: 0x30353d, roughness: 0.55, metalness: 0.5 }),
    machineGlass: new THREE.MeshPhysicalMaterial({ color: 0x2a3440, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.85 }),
    silver: std({ color: 0xc7cdd3, roughness: 0.25, metalness: 0.85 }),
    darkSteel: std({ color: 0x2b3240, roughness: 0.5, metalness: 0.55 }),
    cabinet: std({ color: 0xe4e8ec, roughness: 0.4 }),
    screen: basic({ color: 0x2b5c8a }),
    dryerWhite: std({ color: 0xf0f2f4, roughness: 0.3, metalness: 0.2 }),
    bumperBlack: std({ color: 0x16191d, roughness: 0.32, metalness: 0.15 }),
    tubeBlue: std({ color: 0x2862cf, roughness: 0.4, metalness: 0.4 }),
    tubeWhite: std({ color: 0xeef1f4, roughness: 0.35, metalness: 0.3 }),
    wood: std({ color: 0xb8895a, roughness: 0.85 }),
    jumboBag: std({ color: 0xefeee8, roughness: 0.95 }),
    rackBlue: std({ color: 0x1d4ed8, roughness: 0.45, metalness: 0.3 }),
    beamOrange: std({ color: 0xf97316, roughness: 0.5, metalness: 0.2 }),
    wrap: std({ map: createStretchWrapTex(), roughness: 0.25, metalness: 0.05 }),
    wrapDark: std({ map: createStretchWrapTex(), color: 0x50575f, roughness: 0.25, metalness: 0.1 }),
    foamYellow: std({ color: 0xd8c174, roughness: 0.9 }),
    platformBlue: std({ map: createCorrugatedTex('#2357c4', 'rgba(0,20,80,0.35)', 6, 1), roughness: 0.5, metalness: 0.3 }),

    // Paint shop
    glass: new THREE.MeshPhysicalMaterial({ color: 0xd8f1ff, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    tile: std({ map: createTileTex(18, 4), roughness: 0.2, metalness: 0.05 }),
    grating: std({ map: createGratingTex(16, 16), roughness: 0.45, metalness: 0.6 }),
    paintCeiling: std({ map: createCorrugatedTex('#1f4fb8', 'rgba(0,15,60,0.4)', 10, 4), roughness: 0.55, metalness: 0.25 }),
    hood: std({ color: 0xe9edf0, roughness: 0.4, metalness: 0.45, side: THREE.DoubleSide }),
    chain: std({ color: 0x9aa1a8, roughness: 0.4, metalness: 0.8 }),
    flashGlow: basic({ color: 0xffb35c }),
    xMark: basic({ map: createXMarkTex(), transparent: true, depthWrite: false }),
    boothLight: basic({ color: 0xfdfdf8 }),

    // Lighting fixtures
    ledDisc: basic({ color: 0xfffaf0 }),
    glow: new THREE.PointsMaterial({ map: createGlowTex(), size: 4.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff6e0 }),
    skylight: basic({ color: 0xeaf4ff }),
    bollard: std({ color: 0xf2b705, roughness: 0.5 }),
    extinguisher: std({ color: 0xdc2626, roughness: 0.4 }),
  };
}

export type Materials = ReturnType<typeof createMaterials>;
