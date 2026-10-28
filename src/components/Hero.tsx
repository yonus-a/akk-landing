import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { HeroContent, HeroStatsCompact } from './HeroContent';
import { useMediaQuery } from '../hooks/useMediaQuery';

const FactoryTour = lazy(() => import('../features/factory-tour').then((m) => ({ default: m.FactoryTour })));

const DESKTOP_QUERY = '(min-width: 1024px)';

/** Scroll progress over which the hero copy fades out as the camera dives into the factory. */
const COPY_FADE = { from: 0.06, to: 0.15 };
/** The tour HUD appears once the copy is gone. */
const HUD_REVEAL_AT = 0.15;

/** Sticky offset that keeps content taller than the viewport bottom-aligned instead of clipped. */
function useStickyTop(ref: React.RefObject<HTMLElement | null>) {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setTop(Math.min(0, window.innerHeight - el.offsetHeight));
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref]);
  return top;
}

interface HeroProps {
  lang: Language;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaContact: string;
  stats: { value: string; label: string }[];
  heroImage: string;
  factoryBanner: string;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  tag,
  title,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  ctaContact,
  stats,
}) => {
  const isRtl = lang === 'fa';
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const stickyTop = useStickyTop(stickyRef);

  // Written straight to the DOM so scrolling doesn't re-render the hero.
  const handleTourProgress = useCallback((progress: number) => {
    const t = Math.min(1, Math.max(0, (progress - COPY_FADE.from) / (COPY_FADE.to - COPY_FADE.from)));
    const opacity = String(1 - t);
    if (copyRef.current) {
      copyRef.current.style.opacity = opacity;
      copyRef.current.style.visibility = t >= 1 ? 'hidden' : '';
    }
    if (scrimRef.current) scrimRef.current.style.opacity = opacity;
  }, []);

  return (
    // Desktop: the section is a 600vh scroll runway with a sticky viewport, so the
    // factory walkthrough scrubs while the hero stays on screen.
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 overflow-clip lg:h-[600vh]"
    >
      <div
        ref={stickyRef}
        className="relative overflow-clip pt-24 sm:pt-28 pb-4 lg:pb-16 lg:sticky lg:min-h-screen lg:flex lg:items-center"
        style={isDesktop ? { top: stickyTop } : undefined}
      >
        {/* Subtle ambient corporate blue tint */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

        {/* Desktop: full-bleed factory walkthrough behind the copy */}
        {isDesktop && (
          <>
            <Suspense fallback={null}>
              <FactoryTour
                lang={lang}
                triggerRef={sectionRef}
                start="top top"
                end="bottom bottom"
                hudRevealAt={HUD_REVEAL_AT}
                showProtractor={false}
                topOffset="6.5rem"
                onProgress={handleTourProgress}
                className="absolute inset-0 z-0"
              />
            </Suspense>
            {/* Light wash behind the copy so it stays legible over the aerial shot */}
            <div
              ref={scrimRef}
              aria-hidden="true"
              className="absolute inset-0 z-[1] pointer-events-none transition-opacity duration-300"
              style={{
                background: `linear-gradient(${isRtl ? 'to left' : 'to right'}, rgba(248,250,252,0.96) 0%, rgba(248,250,252,0.85) 38%, rgba(248,250,252,0) 68%)`,
              }}
            />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 lg:pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center">

            {/* Main Editorial Text Column */}
            <div
              ref={copyRef}
              className={`relative z-10 lg:col-span-6 lg:pointer-events-auto transition-opacity duration-300 ${isRtl ? '' : 'lg:col-start-7'}`}
            >
              <HeroContent
                lang={lang}
                tag={tag}
                title={title}
                subtitle={subtitle}
                description={description}
                ctaPrimary={ctaPrimary}
                ctaSecondary={ctaSecondary}
                ctaContact={ctaContact}
                stats={stats}
                showStats={isDesktop}
              />
            </div>

            {/* Mobile: a full-screen stage pinned while the camera flies through the factory,
                with the key figures docked underneath. */}
            {!isDesktop && (
              <div ref={mobileTrackRef} className="relative h-[450svh] mt-6">
                <div className="sticky top-0 h-svh flex flex-col gap-3 pt-20 pb-4">
                  <div className="relative flex-1 min-h-0 -mx-4 sm:-mx-6 overflow-hidden">
                    <Suspense fallback={null}>
                      <FactoryTour
                        lang={lang}
                        triggerRef={mobileTrackRef}
                        start="top top"
                        end="bottom bottom"
                        compact
                        showProtractor={false}
                        topOffset="10px"
                        className="absolute inset-0"
                      />
                    </Suspense>
                  </div>
                  <HeroStatsCompact stats={stats} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};
