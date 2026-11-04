import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Factory, PhoneCall } from 'lucide-react';
import { Language } from '../types';
import { FILM_CHAPTERS, chapterIndexAt } from '../features/hero-film';
import { HeroStage, STAT_ICONS } from './HeroContent';

// Regular-GOP 720p cut of the film: plays back smoothly, unlike the all-keyframe scrub encodes.
const VIDEO_SRC = '/assets/official/hero.mp4';
const POSTER = '/assets/official/hero-poster.jpg';

function canAutoplay() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !connection?.saveData && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface MobileHeroProps {
  lang: Language;
  tag: string;
  title: string;
  stages: HeroStage[];
  ctaPrimary: string;
  ctaSecondary: string;
  ctaContact: string;
  stats: { value: string; label: string }[];
}

/**
 * Phone hero: the factory film loops behind the copy (no scroll scrubbing, which stutters on mobile decoders),
 * with story-style segments that track the film's chapters and jump to one on tap.
 */
export const MobileHero: React.FC<MobileHeroProps> = ({
  lang,
  tag,
  title,
  stages,
  ctaPrimary,
  ctaSecondary,
  ctaContact,
  stats,
}) => {
  const isRtl = lang === 'fa';
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [autoplay] = useState(canAutoplay);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!autoplay || !video || !stage) return;
    // React does not reflect `muted` as an attribute, and iOS refuses to autoplay without it.
    video.muted = true;

    let frame = 0;
    let current = 0;
    const tick = () => {
      const t = video.currentTime;
      const duration = video.duration || FILM_CHAPTERS[FILM_CHAPTERS.length - 1].start + 2.5;
      FILM_CHAPTERS.forEach((chapter, i) => {
        const end = FILM_CHAPTERS[i + 1]?.start ?? duration;
        const k = Math.min(1, Math.max(0, (t - chapter.start) / (end - chapter.start)));
        const fill = fillRefs.current[i];
        if (fill) fill.style.transform = `scaleX(${k})`;
      });
      const index = chapterIndexAt(t);
      if (index !== current) {
        current = index;
        setActive(index);
      }
      frame = requestAnimationFrame(tick);
    };

    // Only decode and animate while the hero is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        video.play().catch(() => {});
        frame = requestAnimationFrame(tick);
      } else {
        video.pause();
      }
    });
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [autoplay]);

  const select = (index: number) => {
    const video = videoRef.current;
    if (autoplay && video) {
      video.currentTime = FILM_CHAPTERS[index].start + 0.01;
      video.play().catch(() => {});
    } else {
      setActive(index);
    }
  };

  const number = (n: number) =>
    new Intl.NumberFormat(isRtl ? 'fa-IR' : 'en-US', { minimumIntegerDigits: 2 }).format(n);
  const titleWords = title.trim().split(/\s+/);
  const lastWord = titleWords.length > 1 ? titleWords.pop() : undefined;

  return (
    <div>
      <div
        ref={stageRef}
        className="relative isolate flex flex-col justify-end min-h-svh overflow-hidden bg-slate-950 text-white"
      >
        {/* Film, faded into the dark lower half where the copy sits */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[66%] -z-10">
          {autoplay ? (
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              poster={POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={POSTER} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/10 to-slate-950" />
        </div>
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -start-24 w-80 h-80 -z-10 rounded-full bg-blue-600/25 blur-3xl"
        />

        <div className="px-5 sm:px-8 pt-28 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          <span className="inline-flex items-center gap-2 max-w-full ps-2 pe-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-medium text-white/85">
            <span className="relative flex w-1.5 h-1.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-sky-400 animate-ping motion-reduce:animate-none" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-sky-400" />
            </span>
            <span className="truncate">{tag}</span>
          </span>

          <h1 className="mt-4 text-[2.15rem] sm:text-5xl font-extrabold tracking-tight leading-[1.15] rtl:leading-[1.4] text-balance">
            {titleWords.join(' ')}{' '}
            {lastWord && (
              <span className="bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">{lastWord}</span>
            )}
          </h1>

          {/* Chapter segments: fill with the film, tap to jump */}
          <div className="mt-6">
            <div role="tablist" aria-label={isRtl ? 'فصل‌های فیلم' : 'Film chapters'} className="flex gap-1.5">
              {stages.map((stage, i) => (
                <button
                  key={stage.label}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={stage.label}
                  onClick={() => select(i)}
                  className="flex-1 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
                >
                  <span className="block h-[3px] rounded-full bg-white/20 overflow-hidden">
                    <span
                      ref={(el) => {
                        fillRefs.current[i] = el;
                      }}
                      className="block h-full bg-white origin-left rtl:origin-right"
                      style={autoplay ? { transform: 'scaleX(0)' } : { transform: `scaleX(${i <= active ? 1 : 0})` }}
                    />
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-1 flex items-center gap-2 text-[11px] font-bold tracking-wider text-sky-300">
              <span className="tabular-nums">
                {number(active + 1)}
                <span className="text-white/40"> / {number(stages.length)}</span>
              </span>
              <span aria-hidden="true" className="w-5 h-px bg-sky-300/50" />
              <span>{stages[active]?.label}</span>
            </p>

            {/* All captions share one grid cell, so the block never changes height between chapters */}
            <div aria-live="polite" className="grid mt-2.5">
              {stages.map((stage, i) => (
                <div
                  key={stage.label}
                  aria-hidden={i !== active}
                  className={`[grid-area:1/1] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                    i === active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                >
                  <h2 className="text-[15px] font-semibold leading-snug text-white">{stage.title}</h2>
                  <p className="mt-1.5 text-[13px] leading-6 text-slate-300 line-clamp-3">{stage.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2.5">
            <a
              href="#about"
              className="flex items-center justify-between gap-3 min-h-13 ps-5 pe-1.5 py-1.5 rounded-full bg-white text-slate-900 text-sm font-semibold shadow-lg shadow-black/20 active:scale-[0.98] transition-transform"
            >
              <span className="leading-snug">{ctaPrimary}</span>
              <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-blue-600 text-white">
                <ForwardArrow className="w-4 h-4" strokeWidth={2.2} />
              </span>
            </a>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="#factory-tour"
                className="flex items-center justify-center gap-2 min-h-12 px-3 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[13px] font-semibold active:bg-white/20 transition-colors"
              >
                <Factory className="w-4 h-4 shrink-0 text-sky-300" strokeWidth={1.75} />
                <span className="truncate">{ctaSecondary}</span>
              </a>
              <a
                href="#contact"
                className="flex items-center justify-center gap-2 min-h-12 px-3 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[13px] font-semibold active:bg-white/20 transition-colors"
              >
                <PhoneCall className="w-4 h-4 shrink-0 text-sky-300" strokeWidth={1.75} />
                <span className="truncate">{ctaContact}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Key figures */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 bg-white">
        {stats.map((stat, idx) => {
          const Icon = STAT_ICONS[idx];
          return (
            <div
              key={idx}
              className="flex items-center gap-3 min-w-0 px-4 py-4 sm:px-6 border-slate-100 odd:border-e [&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-b-0 sm:border-e sm:last:border-e-0"
            >
              {Icon && (
                <span className="grid place-items-center w-10 h-10 shrink-0 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100/80">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                </span>
              )}
              <div className="min-w-0 flex flex-col-reverse">
                <dt className="text-[11px] font-medium text-slate-500 leading-snug line-clamp-2">{stat.label}</dt>
                <dd className="text-lg font-extrabold tabular-nums tracking-tight leading-tight text-slate-900">
                  {stat.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
};
