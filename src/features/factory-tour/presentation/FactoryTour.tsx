import React, { useState } from 'react';
import { Locale } from '../domain/locale';
import { TOUR_STEPS } from '../domain/tourSteps';
import { ZONES } from '../domain/zones';
import { useTourTimeline } from '../application/useTourTimeline';
import { FactoryScene } from '../infrastructure/three/createFactoryScene';
import { FactoryCanvas } from './components/FactoryCanvas';
import { HudNav } from './components/HudNav';
import { InfoCard } from './components/InfoCard';
import { ProtractorOverlay } from './components/ProtractorOverlay';
import { ProgressBar, ScrollHint, SkyHaze } from './components/ScrollOverlays';
import { ZoneLegend } from './components/ZoneLegend';
import './factoryTour.css';

export interface FactoryTourProps {
  lang: Locale;
  /** Element whose scroll range drives the camera flight. */
  triggerRef: React.RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
  refreshKey?: unknown;
  /** The HUD (nav, info card, legend) stays hidden until scroll progress reaches this value. */
  hudRevealAt?: number;
  /** Trimmed HUD for small inline stages. */
  compact?: boolean;
  showProtractor?: boolean;
  /** Distance of the floating nav from the top of the stage, e.g. to clear a site header. */
  topOffset?: string;
  onProgress?: (progress: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Scroll-driven 3D factory walkthrough that fills its (sized) container. */
export const FactoryTour: React.FC<FactoryTourProps> = ({
  lang,
  triggerRef,
  start,
  end,
  refreshKey,
  hudRevealAt = 0,
  compact = false,
  showProtractor = true,
  topOffset,
  onProgress,
  className = '',
  style,
}) => {
  const [scene, setScene] = useState<FactoryScene | null>(null);
  const [protractorOn, setProtractorOn] = useState(true);
  const { progress, stepIndex, step, overlays, scrollToStep } = useTourTimeline(scene, triggerRef, {
    start,
    end,
    refreshKey: `${String(refreshKey)}|${lang}`,
    onProgress,
  });

  const hudVisible = progress >= hudRevealAt;
  const rootStyle = topOffset ? ({ ...style, '--ft-top': topOffset } as React.CSSProperties) : style;

  return (
    <div className={`factory-tour${compact ? ' is-compact' : ''} ${className}`} style={rootStyle} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <FactoryCanvas onSceneChange={setScene} />
      <ProgressBar progress={progress} />
      <SkyHaze opacity={overlays.skyHaze} />
      {showProtractor && (
        <ProtractorOverlay lang={lang} scene={scene} enabled={protractorOn} opacity={hudVisible ? overlays.protractor : 0} />
      )}

      <div className={`ft-hud${hudVisible ? '' : ' is-hidden'}`} style={{ opacity: hudVisible ? 1 : 0 }} aria-hidden={!hudVisible}>
        <HudNav
          lang={lang}
          steps={TOUR_STEPS}
          activeIndex={stepIndex}
          onSelectStep={scrollToStep}
          protractorOn={protractorOn}
          onToggleProtractor={showProtractor ? () => setProtractorOn((on) => !on) : undefined}
        />
        <ZoneLegend lang={lang} zones={ZONES} opacity={overlays.zoneLegend} />
        <InfoCard lang={lang} step={step} loading={scene === null} compact={compact} />
        <ScrollHint lang={lang} opacity={overlays.scrollHint} />
      </div>
    </div>
  );
};
