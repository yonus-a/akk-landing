import { Vec3, vec3 } from './geometry';
import { Localized } from './locale';

/** World-space origin from which every site angle on the master plan is measured. */
export const PROTRACTOR_ORIGIN: Vec3 = vec3(8, 0, 62);

/** Compensates for the plan drawing being foreshortened along the depth axis. */
export const PERSPECTIVE_Z_SCALE = 1.55;

export interface ProtractorDirection {
  ux: number;
  uz: number;
  rotY: number;
}

export function getProtractorDir(deg: number): ProtractorDirection {
  const rad = (deg * Math.PI) / 180;
  const dx = -Math.cos(rad);
  const dz = -Math.sin(rad) * PERSPECTIVE_Z_SCALE;
  const len = Math.hypot(dx, dz);
  return { ux: dx / len, uz: dz / len, rotY: Math.atan2(-dx, -dz) };
}

export function getProtractorPoint(deg: number, dist: number, lateral = 0): Vec3 {
  const dir = getProtractorDir(deg);
  const nx = -dir.uz;
  const nz = dir.ux;
  return vec3(
    PROTRACTOR_ORIGIN.x + dir.ux * dist + nx * lateral,
    0,
    PROTRACTOR_ORIGIN.z + dir.uz * dist + nz * lateral,
  );
}

export interface SiteAngle {
  deg: number;
  color: string;
  label: Localized;
}

export const SITE_ANGLES: SiteAngle[] = [
  { deg: 30, color: '#38bdf8', label: { fa: '۳۰° خیابان اول', en: '30° First street' } },
  { deg: 50, color: '#60a5fa', label: { fa: '۵۰° ساختمان‌های بهم پیوسته', en: '50° Connected buildings' } },
  { deg: 130, color: '#facc15', label: { fa: '۱۳۰° چهار سوله عریض', en: '130° Four wide halls' } },
  { deg: 150, color: '#4ade80', label: { fa: '۱۵۰° ساختمان راست', en: '150° Right building' } },
  { deg: 165, color: '#f472b6', label: { fa: '۱۶۵° خیابان دوم', en: '165° Second street' } },
];
