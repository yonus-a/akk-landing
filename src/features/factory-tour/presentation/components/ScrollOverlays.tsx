import React from 'react';
import { Locale } from '../../domain/locale';
import { UI_TEXT } from '../uiText';

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="ft-progress" style={{ width: `${progress * 100}%` }} />
);

export const SkyHaze: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div className="ft-sky-haze" style={{ opacity }} />
);

export const ScrollHint: React.FC<{ lang: Locale; opacity: number }> = ({ lang, opacity }) => (
  <div className="ft-scroll-hint" style={{ opacity }}>
    <span>{UI_TEXT.scrollHint[lang]}</span>
  </div>
);
