import React, { useRef } from 'react';
import { Locale } from '../domain/locale';
import { FactoryTour } from './FactoryTour';

/** Full-page version of the tour: a fixed stage over an 850vh scroll runway. */
export const FactoryTourPage: React.FC<{ lang?: Locale }> = ({ lang = 'fa' }) => {
  const spacerRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <FactoryTour lang={lang} triggerRef={spacerRef} style={{ position: 'fixed', inset: 0 }} />
      <div ref={spacerRef} style={{ position: 'relative', zIndex: 2, height: '850vh', pointerEvents: 'none' }} />
    </>
  );
};
