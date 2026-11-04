import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Language } from '../types';
import { HeroContent, HeroStage } from './HeroContent';
import { MobileHero } from './MobileHero';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { FILM_CHAPTERS, HeroFilm } from '../features/hero-film';

const DESKTOP_QUERY = '(min-width: 1024px)';

/** Sticky offset that keeps content taller than the viewport bottom-aligned instead of clipped. */
function useStickyTop(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const update = () => setTop(Math.min(0, window.innerHeight - el.offsetHeight));
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref, enabled]);
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
  const stickyTop = useStickyTop(stickyRef, isDesktop);
  const [activeStage, setActiveStage] = useState(0);

  // The opening shot keeps the hero's own subtitle and description; later shots bring their own copy.
  const stages = useMemo<HeroStage[]>(
    () =>
      FILM_CHAPTERS.map((chapter) => ({
        label: chapter.label[lang],
        title: chapter.title?.[lang] ?? subtitle,
        text: chapter.caption?.[lang] ?? description,
      })),
    [lang, subtitle, description],
  );

  if (!isDesktop) {
    return (
      <section className="relative border-b border-slate-200 overflow-clip">
        <MobileHero
          lang={lang}
          tag={tag}
          title={title}
          stages={stages}
          ctaPrimary={ctaPrimary}
          ctaSecondary={ctaSecondary}
          ctaContact={ctaContact}
          stats={stats}
        />
      </section>
    );
  }

  return (
    // The section is a 300vh scroll runway with a sticky viewport, so the
    // factory film scrubs behind the hero while its copy follows each shot.
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 overflow-clip h-[300vh]"
    >
      <div
        ref={stickyRef}
        className="sticky overflow-clip pt-28 pb-16 min-h-screen flex items-center "
        style={{ top: stickyTop }}
      >
        {/* Subtle ambient corporate blue tint */}
        <div className="absolute top-0 right-1/4 w-[740px] h-[560px] -translate-y-24 bg-radial-[closest-side] from-blue-100/60 to-transparent pointer-events-none" />

        {/* Full-bleed factory film behind the copy */}

        <HeroFilm
          triggerRef={sectionRef}
          start="top top"
          end="bottom bottom"
          refreshKey={lang}
          clearCopy
          onChapterChange={setActiveStage}
          className="absolute inset-0 z-0 "
        />

        {/* Light wash behind the copy (on the right in both languages) so it stays legible over the film */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(248,250,252,0.96) 0%, rgba(248,250,252,0.85) 38%, rgba(248,250,252,0) 68%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-8 w-full z-10 pointer-events-none">
          <div className="grid grid-cols-12 gap-12 items-center">
            <div className={`relative z-10 col-span-6 pointer-events-auto ${isRtl ? '' : 'col-start-7'}`}>
              <HeroContent
                lang={lang}
                tag={tag}
                title={title}
                stages={stages}
                activeStage={activeStage}
                ctaPrimary={ctaPrimary}
                ctaSecondary={ctaSecondary}
                ctaContact={ctaContact}
                stats={stats}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
