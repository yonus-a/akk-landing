import React, { useMemo, useRef } from 'react';
import { Package, ChevronRight, Car } from 'lucide-react';
import { Language, ProductShowcaseItem } from '../types';
import { PorscheShowcase } from './porsche/PorscheShowcase';
import { useMediaQuery } from '../hooks/useMediaQuery';

const DESKTOP_QUERY = '(min-width: 1024px)';

interface ProductShowcaseProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  items: ProductShowcaseItem[];
}

const MAX_TILT_DEG = 7;

/** Deterministic barcode bars derived from the part code, so every tag gets its own pattern. */
function useBarcode(code: string) {
  return useMemo(() => {
    const bars: { x: number; w: number }[] = [];
    let x = 0;
    for (const ch of code) {
      const c = ch.charCodeAt(0);
      for (const w of [1 + (c % 3), 1 + ((c >> 2) % 2), 1 + ((c >> 3) % 3)]) {
        bars.push({ x, w });
        x += w + 1 + ((c + w) % 2);
      }
    }
    return { bars, width: x };
  }, [code]);
}

const ProductCard: React.FC<{ prod: ProductShowcaseItem; lang: Language }> = ({ prod, lang }) => {
  const cardRef = useRef<HTMLElement>(null);
  const barcode = useBarcode(prod.code);
  const stampText =
    lang === 'fa' ? 'رنگ‌آمیزی مکانیزه • کنترل کیفی شده • آریان خودرو خاورمیانه • ' : 'MECHANIZED COAT • QUALITY CHECKED • ARIAN KHODRO MIDDLE EAST • ';
  const stampPathId = `stamp-${prod.id}`;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT_DEG}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT_DEG}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
  };

  const resetTilt = () => {
    cardRef.current?.style.setProperty('--rx', '0deg');
    cardRef.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className="group relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-300 transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform"
      style={{ transform: 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }}
    >
      {/* Product stage */}
      <div className="relative aspect-[4/3] rounded-t-2xl overflow-hidden bg-[radial-gradient(ellipse_at_center,_#ffffff_0%,_#f1f5f9_70%)]">
        {/* Blueprint grid + crosshair revealed on hover */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(59 130 246 / 0.10) 1px, transparent 1px), linear-gradient(to bottom, rgb(59 130 246 / 0.10) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-6 top-1/2 border-t border-dashed border-blue-400/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        <div aria-hidden="true" className="absolute inset-y-6 left-1/2 border-s border-dashed border-blue-400/40 scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />

        {/* Registration corner marks */}
        {['top-3 start-3 border-t-2 border-s-2', 'top-3 end-3 border-t-2 border-e-2', 'bottom-3 start-3 border-b-2 border-s-2', 'bottom-3 end-3 border-b-2 border-e-2'].map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            className={`absolute w-3 h-3 border-slate-300 group-hover:border-blue-500 group-hover:w-4 group-hover:h-4 transition-all duration-300 ${pos}`}
          />
        ))}

        {/* Vehicle chip */}
        <span className="absolute top-3.5 end-6 inline-flex items-center gap-1 max-w-[calc(100%-3rem)] bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
          <Car className="w-3 h-3 shrink-0" />
          <span className="truncate">{prod.carModel}</span>
        </span>

        {/* Floor shadow that shrinks as the part lifts */}
        <span
          aria-hidden="true"
          className="absolute bottom-[14%] left-1/2 -translate-x-1/2 w-3/5 h-3 rounded-[50%] bg-slate-900/15 blur-md transition-all duration-500 group-hover:w-2/5 group-hover:bg-slate-900/10"
        />

        <img
          src={prod.imageSrc}
          alt={prod.name}
          loading="lazy"
          className="absolute inset-0 m-auto max-h-[68%] max-w-[78%] object-contain drop-shadow-[0_10px_14px_rgba(15,23,42,0.18)] transition-transform duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-110 group-hover:-rotate-2 motion-reduce:transition-none"
        />

        {/* Cursor-following glare */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.7), transparent 45%)',
            mixBlendMode: 'soft-light',
          }}
        />

      </div>

      {/* Tear line with ticket notches and the quality stamp riding on it */}
      <div aria-hidden="true" className="relative h-0 border-t-2 border-dashed border-slate-200">
        <div className="absolute -top-9 end-4 z-10 hidden sm:block w-[72px] h-[72px] text-emerald-600 opacity-85 group-hover:opacity-100 group-hover:-rotate-6 transition-all duration-500">
          <svg viewBox="0 0 100 100" className="w-full h-full group-hover:animate-[spin_10s_linear_infinite] motion-reduce:animate-none">
            <defs>
              <path id={stampPathId} d="M 50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" />
            </defs>
            <circle cx="50" cy="50" r="47" fill="white" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
            <text fill="currentColor" fontSize="10.5" fontWeight="700" letterSpacing={lang === 'fa' ? 0 : 0.5}>
              <textPath href={`#${stampPathId}`} textLength="236">{stampText}</textPath>
            </text>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black">QC</span>
        </div>
        <span className="absolute -start-2.5 -top-2.5 w-5 h-5 rounded-full bg-slate-50 border border-slate-200 [clip-path:inset(0_0_0_50%)] rtl:[clip-path:inset(0_50%_0_0)]" />
        <span className="absolute -end-2.5 -top-2.5 w-5 h-5 rounded-full bg-slate-50 border border-slate-200 [clip-path:inset(0_50%_0_0)] rtl:[clip-path:inset(0_0_0_50%)]" />
      </div>

      {/* Part label */}
      <div className="p-3 pt-4 sm:p-4 sm:pt-5">
        <div className="pe-0 sm:pe-20">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1 line-clamp-1">
            {prod.category}
          </span>
          <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug text-pretty group-hover:text-blue-700 transition-colors">
            {prod.name}
          </h3>
        </div>

        <div className="mt-3 min-w-0">
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${barcode.width} 20`}
              preserveAspectRatio="none"
              className="h-5 sm:h-6 w-24 max-w-full sm:w-28 text-slate-800 group-hover:text-blue-800 transition-colors"
            >
              {barcode.bars.map((bar, i) => (
                <rect key={i} x={bar.x} y="0" width={bar.w} height="20" fill="currentColor" />
              ))}
            </svg>
            <div dir="ltr" className="mt-1 font-mono text-[10px] text-slate-500 tracking-[0.15em] truncate">
              {prod.code}
            </div>
        </div>
      </div>
    </article>
  );
};

const SectionHeader: React.FC<{ kicker: string; title: string; subtitle: string }> = ({ kicker, title, subtitle }) => (
  <div className="max-w-3xl">
    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
      <Package className="w-4 h-4" />
      <span>{kicker}</span>
    </div>
    <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
      {title}
    </h2>
    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
      {subtitle}
    </p>
  </div>
);

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  items,
}) => {
  const isRtl = lang === 'fa';
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const explodedTrackRef = useRef<HTMLDivElement>(null);
  const scrollHint = isRtl ? 'برای مشاهده جداسازی قطعات اسکرول کنید' : 'Scroll to explore the disassembly';

  return (
    <section id="products" className="pt-20 lg:pt-0 pb-20 lg:pb-28 bg-slate-50 relative border-b border-slate-200">
      {!isDesktop && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader kicker={kicker} title={title} subtitle={subtitle} />
        </div>
      )}

      {/* Exploded-view runway: the stage stays pinned while scrolling disassembles the car.
          Desktop puts the header beside the drawing; mobile pins the drawing alone under the header. */}
      <div ref={explodedTrackRef} className="relative h-[200svh] lg:h-[300vh] mb-10 lg:mb-14">
        <div className="sticky top-0 h-svh lg:h-screen overflow-clip flex flex-col pt-20 pb-4 lg:pb-0 lg:justify-center">
          {isDesktop ? (
            <>
              <PorscheShowcase
                variant="backdrop"
                refreshKey={lang}
                triggerRef={explodedTrackRef}
                start="top top"
                end="bottom bottom"
              />
              <div className="relative max-w-7xl mx-auto px-8 w-full z-10 pointer-events-none">
                <div className="grid grid-cols-12 gap-12 items-center">
                  <div className={`col-span-5 pointer-events-auto ${isRtl ? '' : 'col-start-8'}`}>
                    <SectionHeader kicker={kicker} title={title} subtitle={subtitle} />
                    <p className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      {scrollHint}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative flex-1 min-h-0">
              <PorscheShowcase
                variant="inline"
                refreshKey={lang}
                triggerRef={explodedTrackRef}
                start="top top"
                end="bottom bottom"
              />
              <span className="absolute bottom-2 inset-x-0 mx-auto w-fit px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-[11px] font-medium text-slate-500 pointer-events-none">
                {scrollHint}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Products as part tags */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((prod) => (
            <ProductCard key={prod.id} prod={prod} lang={lang} />
          ))}
        </div>

        {/* Note on Product Catalog */}
        <div className="mt-8 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-blue-900">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 min-w-0 text-pretty leading-relaxed">
            <span className="font-bold shrink-0">{lang === 'fa' ? 'تنوع کامل محصولات:' : 'Complete Parts Catalog:'}</span>
            <span>
              {lang === 'fa' 
                ? 'پژو ۲۰۶، ۲۰۷، پارس، ۴۰۵، پراید، تیبا، ساینا، سمند و دنا (انواع سپر، جلوپنجره، قالپاق و تریم‌های پلیمری).' 
                : 'Covering Peugeot 206, 207, Pars, 405, Saina, Tiba, Samand and Dena exterior polymer components.'}
            </span>
          </div>

          <a
            href="https://akk.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 shrink-0 hover:underline"
          >
            <span>{lang === 'fa' ? 'مشاهده کاتالوگ آنلاین' : 'Online Catalog'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
