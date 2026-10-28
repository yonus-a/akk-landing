import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CAMERA_PATH } from '../domain/cameraPath';
import { resolveOverlayVisibility, resolveStage, TOUR_STEPS, TourStep } from '../domain/tourSteps';
import { FactoryScene } from '../infrastructure/three/createFactoryScene';

gsap.registerPlugin(ScrollTrigger);

export interface TourTimelineOptions {
  start?: string;
  end?: string;
  /** Changing this re-measures trigger positions (e.g. after a language/layout switch). */
  refreshKey?: unknown;
  onProgress?: (progress: number) => void;
}

/** Binds scroll position over `triggerRef` to the camera path and derives the current tour stage. */
export function useTourTimeline(
  scene: FactoryScene | null,
  triggerRef: RefObject<HTMLElement | null>,
  { start = 'top top', end = 'bottom bottom', refreshKey, onProgress }: TourTimelineOptions = {},
) {
  const [progress, setProgress] = useState(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!scene || !trigger) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub: 1.2,
          onUpdate: (self) => {
            setProgress(self.progress);
            onProgressRef.current?.(self.progress);
          },
        },
      });
      CAMERA_PATH.forEach(({ pose, duration, ease }) => {
        tl.to(scene.cameraPose, { ...pose, duration, ease });
      });
      scrollTriggerRef.current = tl.scrollTrigger ?? null;
    });

    return () => {
      scrollTriggerRef.current = null;
      ctx.revert();
    };
  }, [scene, triggerRef, start, end]);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [refreshKey]);

  const stage = resolveStage(progress);
  const { stepIndex, showDeepInterior } = stage;

  useEffect(() => {
    scene?.applyStage(stage);
  }, [scene, stepIndex, showDeepInterior]);

  const scrollToStep = useCallback((step: TourStep) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    window.scrollTo({ top: st.start + step.scrollTarget * (st.end - st.start), behavior: 'smooth' });
  }, []);

  return {
    progress,
    stepIndex,
    step: TOUR_STEPS[stepIndex],
    overlays: resolveOverlayVisibility(progress),
    scrollToStep,
  };
}
