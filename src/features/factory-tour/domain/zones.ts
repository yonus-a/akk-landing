import { Localized } from './locale';

export type ZoneId = 'production' | 'paint' | 'warehouse' | 'walkway';

export interface Zone {
  id: ZoneId;
  label: Localized;
  color: string;
}

export const ZONES: Zone[] = [
  { id: 'production', label: { fa: 'تولید (تزریق پلاستیک)', en: 'Production (injection molding)' }, color: '#3b82f6' },
  { id: 'paint', label: { fa: 'فروشگاه رنگ (ایزوله)', en: 'Paint shop (isolated)' }, color: '#f97316' },
  { id: 'warehouse', label: { fa: 'انبار پالتی', en: 'Pallet warehouse' }, color: '#14b8a6' },
  { id: 'walkway', label: { fa: 'واک‌وی عابر پیاده', en: 'Pedestrian walkway' }, color: '#22c55e' },
];
