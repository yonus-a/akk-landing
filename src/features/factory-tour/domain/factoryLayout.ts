/** Hall dimensions and the redesigned third bay's floor plan (hall-local metres). */

export const BAY_WIDTH = 23.5;
export const BAY_CENTERS_X = [-35.25, -11.75, 11.75, 35.25];
export const MAIN_HALL_HEIGHT = 12.2;
export const HALL_LENGTH = 84;

/** The four halls run along this plan angle, starting 60m out on the 90° ray. */
export const HALLS_ANGLE_DEG = 130;
export const HALLS_ORIGIN = { deg: 90, dist: 60 };

export const BAY3_LOCAL_X = 11.75;

/** Third bay interior shell: eave height under the roof and the far end wall. */
export const BAY3_INTERIOR = { x0: 0, x1: 23.5, eaveY: 12.0, ridgeRise: 2.9, endZ: -190, frontRoofEndZ: -84 };

export const PAINT_SHOP = { x0: 2.75, x1: 20.75, frontZ: -64, rearZ: -108, ceilingY: 7.2 };

/** Injection machines run lengthwise along the hall in two rows facing the central aisle. */
export const INJECTION_MACHINES = { leftX: 4.6, rightX: 18.9, length: 9, rowZ: [-11, -22, -33, -44] };

/** Two-level steel mezzanine along the left wall carrying dryers and stored parts. */
export const MEZZANINE = { x0: 0.5, x1: 3.2, z0: -4, z1: -56, levels: [4.4, 8.2] };

/** Trolleys of fresh bumpers pushed down the aisle from the presses to the paint shop. */
export const CART_LOOP = { startZ: -4, endZ: -58, speed: 1.1 };
/** Bumper stands travelling on the paint shop's floor chain conveyor. */
export const PAINT_STAND_LOOP = { startZ: -66, endZ: -106, speed: 0.6, spacing: 2.5 };

export const WAREHOUSE = { gridY: 8.4, startZ: -108 };

export interface FloorSign {
  fa: string;
  en: string;
  color: string;
  z: number;
}

export const HANGING_SIGNS: FloorSign[] = [
  { fa: '۱- واحد تولید تزریق', en: 'PRODUCTION', color: '#3b82f6', z: -10 },
  { fa: '۲- فروشگاه رنگ', en: 'PAINT SHOP', color: '#f97316', z: -61.5 },
  { fa: '۳- انبار پالتی', en: 'WAREHOUSE', color: '#14b8a6', z: -124 },
  { fa: '۴- بارگیری و اکسپدیشن', en: 'SHIPPING', color: '#22c55e', z: -168 },
];

export const FLOOR_DECALS: (FloorSign & { x: number })[] = [
  { fa: 'تولید', en: 'PRODUCTION', color: '#1d4ed8', x: 10.2, z: -30 },
  { fa: 'رنگ', en: 'PAINT', color: '#ea580c', x: 13.3, z: -58.6 },
  { fa: 'انبار', en: 'WAREHOUSE', color: '#0f766e', x: 10.2, z: -121 },
  { fa: 'بارگیری', en: 'SHIPPING', color: '#15803d', x: 10.2, z: -166 },
];
