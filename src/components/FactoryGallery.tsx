import React, { useState, useEffect, useRef } from 'react';
import {
  Factory,
  Maximize2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import { Language, FactoryGalleryItem } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';

const DESKTOP_QUERY = '(min-width: 1024px)';
const AUTOPLAY_MS = 5000;

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Phone gallery: native swipe with scroll-snap; the next slide peeks in to invite the gesture. */
const MobileCarousel: React.FC<{
  items: FactoryGalleryItem[];
  isRTL: boolean;
  activeIndex: number;
  onActiveChange: (index: number) => void;
  onOpen: () => void;
}> = ({ items, isRTL, activeIndex, onActiveChange, onOpen }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  const slideStep = () => {
    const [first, second] = slideRefs.current;
    if (!first) return 1;
    return second ? Math.abs(second.offsetLeft - first.offsetLeft) : first.offsetWidth;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // RTL tracks report negative scrollLeft.
      const scrolled = Math.abs(track.scrollLeft);
      const atEnd = scrolled >= track.scrollWidth - track.clientWidth - 4;
      const index = atEnd ? items.length - 1 : Math.round(scrolled / slideStep());
      onActiveChange(Math.min(items.length - 1, Math.max(0, index)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items.length, onActiveChange]);

  const goTo = (index: number) => {
    trackRef.current?.scrollTo({ left: (isRTL ? -1 : 1) * index * slideStep(), behavior: 'smooth' });
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="-mx-4 sm:-mx-6 px-4 sm:px-6 scroll-px-4 sm:scroll-px-6 flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain scrollbar-none"
      >
        {items.map((item, idx) => (
          <article
            key={item.id}
            ref={(el) => {
              slideRefs.current[idx] = el;
            }}
            aria-roledescription="slide"
            aria-label={`${idx + 1} / ${items.length}`}
            className="relative shrink-0 w-[86%] sm:w-[60%] aspect-[4/5] snap-start snap-always rounded-3xl overflow-hidden bg-slate-900 border border-white/10"
          >
            <img
              src={item.imageSrc}
              alt={item.title}
              loading={idx > 1 ? 'lazy' : undefined}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/10" />

            <div className="absolute top-3 start-3 end-16 flex flex-wrap items-center gap-1.5">
              <span className="bg-blue-600/90 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-blue-400/30">
                {item.badge}
              </span>
              <span className="bg-slate-950/60 backdrop-blur-md text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/10">
                {item.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onActiveChange(idx);
                onOpen();
              }}
              aria-label={isRTL ? 'بزرگنمایی تصویر' : 'Fullscreen view'}
              className="absolute top-3 end-3 w-11 h-11 grid place-items-center rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 text-white active:bg-blue-600 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="absolute bottom-0 inset-x-0 p-5">
              <div className="flex items-center gap-2 min-w-0 text-[11px] font-semibold text-blue-300">
                <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
                  {pad2(idx + 1)}
                  <span className="text-white/40"> / {pad2(items.length)}</span>
                </span>
                <span aria-hidden="true" className="w-4 h-px shrink-0 bg-blue-300/50" />
                <span className="truncate">{item.subtitle}</span>
              </div>
              <h3 className="mt-1.5 text-xl font-bold text-white tracking-tight leading-snug">{item.title}</h3>
              <p className="mt-1.5 text-[13px] text-slate-300 leading-6 line-clamp-3">{item.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center">
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(idx)}
            aria-label={item.title}
            aria-current={idx === activeIndex ? 'true' : undefined}
            className="h-11 px-1 grid place-items-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-6 bg-blue-400' : 'w-1.5 bg-white/25'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

interface FactoryGalleryProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  items: FactoryGalleryItem[];
}

export const FactoryGallery: React.FC<FactoryGalleryProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  items,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [isInView, setIsInView] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const goTo = (index: number) => {
    setIsAutoplay(false);
    setActiveIndex(Math.max(0, Math.min(items.length - 1, index)));
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isDesktop || !isAutoplay || !isInView || isLightboxOpen || items.length < 2) return;
    const id = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % items.length),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [isDesktop, isAutoplay, isInView, isLightboxOpen, activeIndex, items.length]);

  const isRTL = lang === 'fa';
  const activeItem = items[activeIndex] || items[0];
  // Desktop: keep the 2-card window scrolled to the active item
  useEffect(() => {
    if (!isDesktop) return;
    const container = listContainerRef.current;
    const targetCard = cardRefs.current[activeIndex];
    if (container && targetCard) {
      container.scrollTo({
        top: targetCard.offsetTop - container.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [activeIndex, isDesktop]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen]);

  if (!items || items.length === 0) return null;

  return (
    <section
      id="factory-tour"
      ref={sectionRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative bg-slate-950 text-white border-b border-slate-800/80 selection:bg-blue-500 selection:text-white"
    >
      <div className="relative flex flex-col justify-center overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="absolute -top-16 left-1/4 w-[32rem] h-[32rem] bg-radial-[closest-side] from-blue-600/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-radial-[closest-side] from-cyan-500/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-10 gap-4">
            <div className="max-w-3xl min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                <Factory className="w-3.5 h-3.5 shrink-0" />
                <span>{kicker}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-3 self-end shrink-0 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800">
              <span className="text-xs font-mono font-bold text-blue-400 px-1 tabular-nums whitespace-nowrap">
                {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 disabled:opacity-35 transition-all"
                  aria-label="Previous unit"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  disabled={activeIndex === items.length - 1}
                  className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 disabled:opacity-35 transition-all"
                  aria-label="Next unit"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {!isDesktop && (
            <MobileCarousel
              items={items}
              isRTL={isRTL}
              activeIndex={activeIndex}
              onActiveChange={setActiveIndex}
              onOpen={() => setIsLightboxOpen(true)}
            />
          )}

          {isDesktop && (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Main image */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-3 sm:p-4 shadow-2xl">
              <div className="flex items-center justify-between px-2 pb-2.5 mb-2.5 border-b border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 truncate">
                    {isRTL ? 'مانیتورینگ زنده واحد عملیاتی' : 'LIVE UNIT INSPECTION'}
                  </span>
                </div>
                <div className="font-mono text-xs text-blue-400 font-bold shrink-0 tabular-nums">
                  UNIT {String(activeIndex + 1).padStart(2, '0')}
                </div>
              </div>

              <div
                onClick={() => setIsAutoplay(false)}
                className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800/60 group"
              >
                {items.map((item, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <img
                      key={item.id}
                      src={item.imageSrc}
                      alt={item.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
                        isCurrent
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-105 z-0 pointer-events-none'
                      }`}
                    />
                  );
                })}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent z-20 pointer-events-none" />

                <div className="absolute top-3 start-3 sm:top-4 sm:start-4 z-30 flex flex-wrap items-center gap-2 max-w-[75%]">
                  <span className="bg-blue-600/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-mono font-bold px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-lg border border-blue-400/30">
                    {activeItem.badge}
                  </span>
                  <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/10">
                    {activeItem.category}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  title={isRTL ? 'بزرگنمایی تصویر' : 'Fullscreen View'}
                  className="absolute top-3 end-3 sm:top-4 sm:end-4 z-30 min-h-11 min-w-11 grid place-items-center rounded-xl bg-slate-900/75 hover:bg-blue-600 text-white backdrop-blur-md border border-white/15 transition-all duration-200"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 z-30">
                  <p className="text-xs font-semibold text-blue-400 mb-1 leading-snug">
                    {activeItem.subtitle}
                  </p>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 tracking-tight leading-snug">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                    {activeItem.description}
                  </p>
                </div>
              </div>

              {/* Progress — taller hit area on mobile */}
              <div className="mt-3.5 px-1 flex items-center gap-1.5 sm:gap-2">
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(idx)}
                    className="flex-1 min-h-11 flex items-center"
                    aria-label={item.title}
                    aria-current={idx === activeIndex ? 'true' : undefined}
                  >
                    <span className="w-full h-2 sm:h-1.5 rounded-full overflow-hidden bg-slate-800">
                      <span
                        className={`block h-full rounded-full transition-all duration-500 ${
                          idx === activeIndex
                            ? 'w-full bg-gradient-to-r from-blue-500 to-cyan-400'
                            : idx < activeIndex
                            ? 'w-full bg-blue-900/70'
                            : 'w-0'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: fixed 2-card window */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                <span>
                  {isRTL
                    ? 'انتخاب واحد عملیاتی جهت مشاهده'
                    : 'Select Operational Unit to Inspect'}
                </span>
                <span className="text-[11px] font-mono text-blue-400 tabular-nums">
                  {activeIndex + 1} / {items.length}
                </span>
              </div>

              <div className="relative">
                <div
                  ref={listContainerRef}
                  className="h-[384px] overflow-hidden space-y-4 px-1 py-1"
                >
                  {items.map((item, index) => {
                    const isSelected = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        ref={(el) => {
                          cardRefs.current[index] = el;
                        }}
                        type="button"
                        onClick={() => goTo(index)}
                        className={`w-full h-[184px] text-start p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between focus:outline-none ${
                          isSelected
                            ? 'bg-slate-900/95 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/50'
                            : 'bg-slate-900/45 hover:bg-slate-900/75 border-slate-800/90 opacity-65 hover:opacity-95'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 w-full">
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950 relative">
                            <img
                              src={item.imageSrc}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 start-1 bg-blue-600/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-bold text-blue-400 truncate flex items-center gap-1">
                                <Sparkles className="w-3 h-3 shrink-0" />
                                {item.category}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                {item.badge}
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-white truncate mb-1">
                              {item.title}
                            </h4>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="w-full flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 truncate max-w-[65%]">
                            {item.subtitle}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isSelected ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isRTL
                              ? isSelected
                                ? 'واحد فعال'
                                : 'مشاهده'
                              : isSelected
                              ? 'Active Unit'
                              : 'Inspect'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="h-[184px] shrink-0 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 end-4 z-10 min-h-11 min-w-11 grid place-items-center rounded-full bg-slate-950/80 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeItem.imageSrc}
              alt={activeItem.title}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-5 bg-slate-900">
              <div className="text-xs font-bold text-blue-400 mb-1">
                {activeItem.category} — {activeItem.badge}
              </div>
              <h4 className="text-xl font-bold text-white mb-1 leading-snug">
                {activeItem.title}
              </h4>
              <p className="text-sm text-slate-300">{activeItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
