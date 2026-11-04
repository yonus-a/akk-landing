import { Language } from '../../../types';

type Localized<T = string> = Record<Language, T>;

export interface FilmChapter {
  /** Where the chapter's shot begins in the film, in seconds. */
  start: number;
  label: Localized;
  /** Omitted for the opening shot, which keeps the hero's own subtitle and description. */
  title?: Localized;
  caption?: Localized;
}

/** Shots in `hero-scrub.mp4`; the start times match its cuts. */
export const FILM_CHAPTERS: FilmChapter[] = [
  {
    start: 0,
    label: { fa: 'نمای هوایی', en: 'Aerial view' },
  },
  {
    start: 2.5,
    label: { fa: 'واحد تولید', en: 'Production' },
    title: { fa: 'سالن تزریق پلاستیک؛ قلب تولید سپر', en: 'The injection molding hall, where bumpers are born' },
    caption: {
      fa: 'ردیف دستگاه‌های تزریق رو به راهروی اصلی؛ سپرها پس از قالب‌گیری، در همان ایستگاه پلیسه‌گیری و کنترل کیفی می‌شوند.',
      en: 'Rows of injection presses face the main aisle; bumpers are deflashed and quality-checked right beside the press they came from.',
    },
  },
  {
    start: 5.0,
    label: { fa: 'سالن رنگ', en: 'Paint shop' },
    title: { fa: 'کابین رنگ ایزوله با کف مشبک', en: 'An isolated paint booth with a grated floor' },
    caption: {
      fa: 'پاشش روی استندهای سپر زیر هودهای مکش سقفی، با کف مشبک گالوانیزه برای مکش تحت کف و سطحی یکدست و بدون گردوغبار.',
      en: 'Bumpers are sprayed on stands under overhead extraction hoods, above a galvanized downdraft floor that keeps the finish clean and even.',
    },
  },
  {
    start: 7.4,
    label: { fa: 'انبار و ارسال', en: 'Warehouse' },
    title: { fa: 'بسته‌بندی، انبارش و ارسال به سراسر کشور', en: 'Packed, stored and shipped nationwide' },
    caption: {
      fa: 'سپرهای نایلون‌پیچ روی پالت، ایستگاه‌های بسته‌بندی و لیفتراک‌ها؛ محصول آماده از اینجا راهی شبکه توزیع کشوری می‌شود.',
      en: 'Stretch-wrapped bumpers on pallets, packing stations and forklifts — finished parts leave here for the nationwide distribution network.',
    },
  },
];

export function chapterIndexAt(time: number) {
  let index = 0;
  FILM_CHAPTERS.forEach((c, i) => { if (time >= c.start) index = i; });
  return index;
}
