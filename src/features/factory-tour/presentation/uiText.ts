import { Localized } from '../domain/locale';

export const UI_TEXT: Record<'loading' | 'scrollHint' | 'protractorToggle', Localized> = {
  loading: { fa: 'در حال بارگذاری صحنه سه‌بعدی…', en: 'Loading the 3D scene…' },
  scrollHint: { fa: 'اسکرول کنید تا وارد جریان تولید شوید ⬇', en: 'Scroll to enter the production flow ⬇' },
  protractorToggle: { fa: '📐 نقاله زاویه‌ها', en: '📐 Site angles' },
};
