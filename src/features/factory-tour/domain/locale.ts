export type Locale = 'fa' | 'en';

export type Localized<T = string> = Record<Locale, T>;
