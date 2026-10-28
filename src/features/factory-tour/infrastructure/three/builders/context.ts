import * as THREE from 'three';
import { Materials } from '../materials';
import { Parts } from '../primitives';

export interface BuildContext {
  scene: THREE.Scene;
  mats: Materials;
  parts: Parts;
  /** Group aligned with the four halls; the interior is modelled in its local space. */
  halls: THREE.Group;
  /** Deep-interior objects, only shown once the camera is inside the hall. */
  deep: THREE.Group;
}
