import React from 'react';
import { Locale } from '../../domain/locale';
import { Zone } from '../../domain/zones';

interface ZoneLegendProps {
  lang: Locale;
  zones: Zone[];
  opacity: number;
}

export const ZoneLegend: React.FC<ZoneLegendProps> = ({ lang, zones, opacity }) => (
  <div className="ft-legend" style={{ opacity }}>
    {zones.map((zone) => (
      <div key={zone.id} className="ft-legend-row">
        <span className="ft-legend-dot" style={{ background: zone.color }} /> {zone.label[lang]}
      </div>
    ))}
  </div>
);
