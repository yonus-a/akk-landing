import { Localized } from './locale';

export interface TourStep {
  navLabel: Localized;
  /** Normalised scroll position (0..1) the nav button jumps to. */
  scrollTarget: number;
  tag: Localized;
  title: Localized;
  description: Localized;
  chips: Localized<string[]>;
}

export const TOUR_STEPS: TourStep[] = [
  {
    navLabel: { fa: '۱. نمای هوایی', en: '1. Aerial' },
    scrollTarget: 0,
    tag: { fa: 'بخش اول • نمای کلی سایت | AERIAL VIEW', en: 'Part 1 • Site overview | AERIAL VIEW' },
    title: { fa: 'کارخانه AKK — طرح بازطراحی داخلی', en: 'AKK Factory — Interior Redesign Plan' },
    description: {
      fa: 'چیدمان جدید با جریان خطی یک‌طرفه «تزریق ← رنگ ← انبار»، راهروی اصلی ۶ متری، واک‌وی سبز جدای عابر پیاده، روشنایی LED و نورگیر سقفی. چهار سوله ۲۳.۵ متری در راستای ۱۳۰ درجه حفظ شده است.',
      en: 'A new layout with a one-way linear flow “Molding → Paint → Warehouse”, a 6 m main aisle, a separate green pedestrian walkway, LED lighting and roof skylights. The four 23.5 m halls along the 130° axis are preserved.',
    },
    chips: {
      fa: ['جریان خطی یک‌طرفه', 'عابر جدا از لیفتراک', 'LED + نورگیر سقفی'],
      en: ['One-way linear flow', 'Pedestrians apart from forklifts', 'LED + roof skylights'],
    },
  },
  {
    navLabel: { fa: '۲. تولید', en: '2. Molding' },
    scrollTarget: 0.35,
    tag: { fa: 'بخش دوم • واحد تولید | MOLDING', en: 'Part 2 • Production | MOLDING' },
    title: { fa: 'سالن تزریق پلاستیک — ۸ دستگاه LIVA', en: 'Injection Molding Hall — 8 LIVA Presses' },
    description: {
      fa: 'دو ردیف دستگاه تزریق طولی رو به راهروی اصلی، نیم‌طبقه فلزی با خشک‌کن‌های مواد و انبار قطعات، میزهای پلیسه‌گیری کنار هر دستگاه، ترولی‌های انتقال سپر به سالن رنگ و ایستگاه کنترل کیفیت.',
      en: 'Two lengthwise rows of injection presses facing the main aisle, a steel mezzanine carrying material dryers and stored parts, deflashing stands beside each press, trolleys moving bumpers to the paint shop and a quality-control station.',
    },
    chips: {
      fa: ['نیم‌طبقه خشک‌کن مواد', 'میز پلیسه‌گیری', 'ایستگاه QC'],
      en: ['Dryer mezzanine', 'Deflashing stands', 'QC station'],
    },
  },
  {
    navLabel: { fa: '۳. رنگ', en: '3. Paint' },
    scrollTarget: 0.68,
    tag: { fa: 'بخش سوم • فروشگاه رنگ | PAINT SHOP', en: 'Part 3 • Paint shop | PAINT SHOP' },
    title: { fa: 'سالن رنگ ایزوله با کف مشبک و استندهای سپر', en: 'Isolated Paint Shop, Grating Floor & Bumper Stands' },
    description: {
      fa: 'اتاقک کاملاً بسته با پارتیشن شیشه‌ای و قاب آبی، دیوار کاشی سفید، کف مشبک گالوانیزه برای مکش تحت کف، هودهای آویز روی خط، کابین‌های پاشش، استندهای سپر روی کانوایر زنجیری کف، زون فلش‌آف و خروجی مستقل به انبار.',
      en: 'A fully enclosed room with blue-framed glass partitions, a white tiled wall, a galvanized grating floor for downdraft extraction, hoods hung over the line, spray booths, bumper stands on a floor chain conveyor, a flash-off zone and a dedicated exit to the warehouse.',
    },
    chips: {
      fa: ['کف مشبک + مکش تحت کف', 'کانوایر زنجیری کف', 'فلش‌آف و خروجی جدا'],
      en: ['Grating floor + downdraft', 'Floor chain conveyor', 'Flash-off & separate exit'],
    },
  },
  {
    navLabel: { fa: '۴. انبار', en: '4. Warehouse' },
    scrollTarget: 0.98,
    tag: { fa: 'بخش چهارم • انبار و بارگیری | WAREHOUSE', en: 'Part 4 • Warehouse & shipping | WAREHOUSE' },
    title: { fa: 'انبار پالتی رک‌دار و اسکله اکسپدیشن', en: 'Racked Pallet Warehouse & Shipping Dock' },
    description: {
      fa: 'سقف شبکه فلزی آبی با چراغ‌های هایبی، سکوهای بسته‌بندی با سپرهای نایلون‌پیچ، رک‌های پالتی سه‌طبقه، لاین دوطرفه لیفتراک، گاردریل جداکننده واک‌وی عابر، لاین‌های استیجینگ و دو درب اسکله با بولارد محافظ.',
      en: 'A blue steel ceiling grid with high-bay lamps, packing platforms stacked with stretch-wrapped bumpers, three-level pallet racks, a two-way forklift lane, guardrails separating the pedestrian walkway, staging lanes and two dock doors with protective bollards.',
    },
    chips: {
      fa: ['رک ۳ طبقه پالتی', 'لاین استیجینگ', 'درب اسکله + بولارد'],
      en: ['3-level pallet racks', 'Staging lanes', 'Dock doors + bollards'],
    },
  },
];

export interface SceneTheme {
  /** Hazy daylight sky outside; a flat colour once indoors. */
  sky: boolean;
  background: number;
  fog: number;
  /** Indoor fill light, matching each zone's mood in the reference photos. */
  interiorFill: number;
  /** Strength of environment reflections on painted steel, plastic and glass. */
  reflections: number;
  exposure: number;
}

const STAGE_THRESHOLDS = [0.24, 0.52, 0.8];

const STAGE_THEMES: SceneTheme[] = [
  { sky: true, background: 0xdfe2e0, fog: 0xdcdcd4, interiorFill: 0.55, reflections: 0.3, exposure: 0.95 },
  { sky: false, background: 0x9aa4ad, fog: 0xb4bcc4, interiorFill: 0.65, reflections: 0.35, exposure: 0.95 },
  { sky: false, background: 0x55606c, fog: 0x8a939c, interiorFill: 0.7, reflections: 0.35, exposure: 0.9 },
  { sky: false, background: 0x0c1118, fog: 0x121822, interiorFill: 0.35, reflections: 0.15, exposure: 0.85 },
];

/** Past this point the camera is inside the hall, so the deep interior replaces the rear orchard. */
const DEEP_INTERIOR_THRESHOLD = 0.22;

export interface TourStage {
  stepIndex: number;
  theme: SceneTheme;
  showDeepInterior: boolean;
}

export function resolveStage(progress: number): TourStage {
  let stepIndex = STAGE_THRESHOLDS.findIndex((t) => progress < t);
  if (stepIndex === -1) stepIndex = STAGE_THRESHOLDS.length;
  return {
    stepIndex,
    theme: STAGE_THEMES[stepIndex],
    showDeepInterior: progress >= DEEP_INTERIOR_THRESHOLD,
  };
}

export interface OverlayVisibility {
  scrollHint: number;
  skyHaze: number;
  protractor: number;
  zoneLegend: number;
}

export function resolveOverlayVisibility(progress: number): OverlayVisibility {
  return {
    scrollHint: progress > 0.04 ? 0 : 1,
    skyHaze: progress < 0.18 ? 1 - progress * 5 : 0,
    protractor: progress < 0.08 ? Math.max(0, 1 - progress * 12) : 0,
    zoneLegend: progress > 0.12 ? 1 : 0,
  };
}
