import React, { useEffect, useRef, useState } from 'react';
import { chapterIndexAt } from '../domain/chapters';
import { useBufferedVideo } from '../application/useBufferedVideo';
import { useScrollVideo } from '../application/useScrollVideo';
import './heroFilm.css';

const SOURCES = { full: '/assets/official/hero-scrub.mp4', light: '/assets/official/hero-scrub-480.mp4' };
const POSTER = '/assets/official/hero-poster.jpg';

function pickSource() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData ? SOURCES.light : SOURCES.full;
}

export interface HeroFilmProps {
  /** Element whose scroll range scrubs the film. */
  triggerRef: React.RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
  /** Changing this re-measures trigger positions (e.g. after a language/layout switch). */
  refreshKey?: unknown;
  /** Frame the film away from hero copy laid over its right side. */
  clearCopy?: boolean;
  /** Fires only when the playhead crosses into another chapter. */
  onChapterChange?: (index: number) => void;
  className?: string;
}

/** Scroll-scrubbed factory film that fills its (sized) container. */
export const HeroFilm: React.FC<HeroFilmProps> = ({
  triggerRef,
  start,
  end,
  refreshKey,
  clearCopy = false,
  onChapterChange,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src] = useState(pickSource);
  const [ready, setReady] = useState(false);
  const { url } = useBufferedVideo(src);

  const chapterRef = useRef(0);
  const onChapterChangeRef = useRef(onChapterChange);
  onChapterChangeRef.current = onChapterChange;

  useScrollVideo(videoRef, triggerRef, ready, {
    start,
    end,
    refreshKey,
    onPlayhead: (time) => {
      const index = chapterIndexAt(time);
      if (index === chapterRef.current) return;
      chapterRef.current = index;
      onChapterChangeRef.current?.(index);
    },
  });

  // iOS only paints seeked frames once the video has been played at least once.
  useEffect(() => {
    if (!ready) return;
    const unlock = () => {
      const video = videoRef.current;
      video?.play().then(() => video.pause()).catch(() => {});
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    return () => window.removeEventListener('touchstart', unlock);
  }, [ready]);

  return (
    <div className={`hero-film${clearCopy ? ' is-clear-copy' : ''} ${className}`} aria-hidden="true">
      <div className="hf-stage">
        <video
          ref={videoRef}
          className="hf-video"
          src={url ?? undefined}
          poster={POSTER}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onLoadedData={() => setReady(true)}
        />
      </div>
      <div className="hf-tint" />
      <div className="hf-grade" />
    </div>
  );
};
