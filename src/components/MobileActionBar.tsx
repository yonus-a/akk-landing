import React, { useEffect, useState } from 'react';
import { ArrowUp, Phone, Send } from 'lucide-react';
import { Language } from '../types';

interface MobileActionBarProps {
  lang: Language;
  phone: string;
}

const toTelHref = (phone: string) =>
  `tel:${phone.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/[^0-9+]/g, '')}`;

/**
 * Thumb-reach actions for phones. Shows once the hero is scrolled away and steps aside over the
 * contact form and footer, where it would cover the fields and links.
 */
export const MobileActionBar: React.FC<MobileActionBarProps> = ({ lang, phone }) => {
  const [visible, setVisible] = useState(false);
  const isFa = lang === 'fa';

  useEffect(() => {
    const hero = document.querySelector('main > section');
    const covered = [document.getElementById('contact'), document.querySelector('footer')];
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const pastHero = (hero?.getBoundingClientRect().bottom ?? 0) < vh * 0.4;
      const overCovered = covered.some((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < vh * 0.85 && rect.bottom > 0;
      });
      setVisible(pastHero && !overCovered);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      inert={!visible}
      className={`lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-300 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
      }`}
    >
      <nav
        aria-label={isFa ? 'دسترسی سریع' : 'Quick actions'}
        className="mx-auto max-w-md flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-900/15"
      >
        <a
          href={toTelHref(phone)}
          className="flex items-center gap-2 h-11 ps-1.5 pe-4 rounded-full bg-slate-100 text-slate-800 text-[13px] font-semibold active:bg-slate-200 transition-colors"
        >
          <span className="grid place-items-center w-8 h-8 rounded-full bg-white text-blue-700 shadow-xs">
            <Phone className="w-4 h-4" strokeWidth={1.9} />
          </span>
          {isFa ? 'تماس' : 'Call'}
        </a>
        <a
          href="#contact"
          className="flex-1 min-w-0 flex items-center justify-center gap-2 h-11 px-3 rounded-full bg-blue-700 text-white text-[13px] font-semibold shadow-lg shadow-blue-700/25 active:bg-blue-800 transition-colors"
        >
          <Send className="w-4 h-4 shrink-0 rtl:-scale-x-100" strokeWidth={1.9} />
          <span className="truncate">{isFa ? 'ارسال پیام' : 'Send a message'}</span>
        </a>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={isFa ? 'بازگشت به بالا' : 'Back to top'}
          className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-slate-900 text-white active:bg-slate-700 transition-colors"
        >
          <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.25} />
        </button>
      </nav>
    </div>
  );
};
