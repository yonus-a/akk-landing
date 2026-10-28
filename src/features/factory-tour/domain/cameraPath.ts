import { vec3 } from './geometry';
import { BAY3_LOCAL_X } from './factoryLayout';

/** Camera position and look-at target, expressed in the hall group's local space. */
export interface CameraPose {
  px: number;
  py: number;
  pz: number;
  lx: number;
  ly: number;
  lz: number;
}

export interface CameraKeyframe {
  pose: CameraPose;
  duration: number;
  ease: string;
}

/** Opening aerial shot, in world space (converted to hall-local space by the scene). */
export const AERIAL_WORLD_POSITION = vec3(6, 98, 170);
export const AERIAL_WORLD_LOOK = vec3(2, 0, 8);

const X = BAY3_LOCAL_X;

export const CAMERA_PATH: CameraKeyframe[] = [
  { pose: { px: X, py: 4.0, pz: 16, lx: X, ly: 3.0, lz: -24 }, duration: 2.8, ease: 'power2.inOut' },
  { pose: { px: X - 0.6, py: 3.8, pz: -44, lx: X, ly: 2.9, lz: -70 }, duration: 3.2, ease: 'none' },
  { pose: { px: X, py: 3.55, pz: -88, lx: X, ly: 2.8, lz: -116 }, duration: 3.2, ease: 'none' },
  { pose: { px: X - 0.4, py: 3.4, pz: -140, lx: X, ly: 2.7, lz: -178 }, duration: 3.0, ease: 'power1.out' },
];

/** How far the pointer can sway the look-at target. */
export const POINTER_PARALLAX = { x: 1.4, y: 0.9 };
