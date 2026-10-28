import React from 'react';
import { Locale } from '../../domain/locale';
import { TourStep } from '../../domain/tourSteps';
import { UI_TEXT } from '../uiText';

interface HudNavProps {
  lang: Locale;
  steps: TourStep[];
  activeIndex: number;
  onSelectStep: (step: TourStep) => void;
  /** Omit to hide the protractor toggle. */
  protractorOn?: boolean;
  onToggleProtractor?: () => void;
}

export const HudNav: React.FC<HudNavProps> = ({ lang, steps, activeIndex, onSelectStep, protractorOn, onToggleProtractor }) => (
  <nav className="ft-nav">
    {steps.map((step, i) => (
      <button key={step.scrollTarget} type="button" className={`ft-btn${i === activeIndex ? ' is-active' : ''}`} onClick={() => onSelectStep(step)}>
        {step.navLabel[lang]}
      </button>
    ))}
    {onToggleProtractor && (
      <button
        type="button"
        className={`ft-btn ft-protractor-toggle${protractorOn ? ' is-on' : ''}`}
        aria-pressed={protractorOn}
        onClick={onToggleProtractor}
      >
        {UI_TEXT.protractorToggle[lang]}
      </button>
    )}
  </nav>
);
