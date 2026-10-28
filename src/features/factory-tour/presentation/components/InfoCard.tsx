import React from 'react';
import { Locale } from '../../domain/locale';
import { TourStep } from '../../domain/tourSteps';
import { UI_TEXT } from '../uiText';

interface InfoCardProps {
  lang: Locale;
  step: TourStep;
  loading: boolean;
  compact?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({ lang, step, loading, compact = false }) => (
  <div className="ft-info-card" aria-live="polite">
    <span className="ft-step-tag">{step.tag[lang]}</span>
    <h2>{step.title[lang]}</h2>
    {!compact && <p>{loading ? UI_TEXT.loading[lang] : step.description[lang]}</p>}
    {!compact && !loading && (
      <div className="ft-chips">
        {step.chips[lang].map((chip) => (
          <span key={chip} className="ft-chip">✓ {chip}</span>
        ))}
      </div>
    )}
  </div>
);
