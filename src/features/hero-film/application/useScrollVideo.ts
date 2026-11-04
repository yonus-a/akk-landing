import { RefObject, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** How fast (per second) the playhead closes the gap to the scroll position: higher is snappier, lower is silkier. */
const CATCH_UP_RATE = 7;
/** Seeking closer than this to the current frame is pointless (the film runs at 24 fps). */
const SEEK_EPSILON = 1 / 48;
/** Seeking exactly to the duration shows a blank frame in some browsers. */
const END_GUARD = 0.05;

export interface ScrollVideoOptions {
  start?: string;
  end?: string;
  /** Changing this re-measures trigger positions (e.g. after a language/layout switch). */
  refreshKey?: unknown;
  /** Called every animation frame the playhead moves, with the time in seconds. Must not set React state per call. */
  onPlayhead?: (time: number) => void;
}

/**
 * Binds scroll progress over `triggerRef` to the playhead of `videoRef`, easing seeks so the film glides.
 * Runs entirely outside React state, and only while the playhead is catching up.
 */
export function useScrollVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  ready: boolean,
  { start = 'top top', end = 'bottom bottom', refreshKey, onPlayhead }: ScrollVideoOptions = {},
) {
  const targetRef = useRef(0);
  const shownRef = useRef(0);
  const frameRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const onPlayheadRef = useRef(onPlayhead);
  onPlayheadRef.current = onPlayhead;

  const tick = useCallback((now: number) => {
    frameRef.current = 0;
    const video = videoRef.current;
    if (!video || !(video.duration > 0)) return;

    const dt = lastFrameAtRef.current ? Math.min(0.1, (now - lastFrameAtRef.current) / 1000) : 1 / 60;
    lastFrameAtRef.current = now;

    const target = targetRef.current * Math.max(0, video.duration - END_GUARD);
    const delta = target - shownRef.current;
    shownRef.current = Math.abs(delta) < 0.004 ? target : shownRef.current + delta * (1 - Math.exp(-CATCH_UP_RATE * dt));

    // One seek at a time: queuing seeks while the decoder is busy makes the picture stall.
    const drift = Math.abs(video.currentTime - shownRef.current);
    if (!video.seeking && drift >= SEEK_EPSILON) video.currentTime = shownRef.current;
    onPlayheadRef.current?.(shownRef.current);

    if (shownRef.current !== target || video.seeking || drift >= SEEK_EPSILON) {
      frameRef.current = requestAnimationFrame(tick);
    } else {
      lastFrameAtRef.current = 0;
    }
  }, [videoRef]);

  const kick = useCallback(() => {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const st = ScrollTrigger.create({
      trigger,
      start,
      end,
      onUpdate: (self) => {
        targetRef.current = self.progress;
        kick();
      },
    });
    targetRef.current = st.progress;
    kick();
    return () => {
      st.kill();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastFrameAtRef.current = 0;
    };
  }, [triggerRef, start, end, kick]);

  useEffect(() => {
    if (ready) kick();
  }, [ready, kick]);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [refreshKey]);
}
