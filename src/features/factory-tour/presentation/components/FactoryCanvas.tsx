import React, { useEffect, useRef } from 'react';
import { createFactoryScene, FactoryScene } from '../../infrastructure/three/createFactoryScene';
import { waitForFonts } from '../../infrastructure/waitForFonts';

interface FactoryCanvasProps {
  onSceneChange: (scene: FactoryScene | null) => void;
}

export const FactoryCanvas: React.FC<FactoryCanvasProps> = ({ onSceneChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    waitForFonts().then(() => {
      if (cancelled) return;

      // A canvas keeps returning its first WebGL context even after it is lost on dispose,
      // so every mount (including StrictMode remounts) needs a fresh canvas.
      const canvas = document.createElement('canvas');
      canvas.className = 'ft-canvas';
      container.appendChild(canvas);

      let scene: FactoryScene;
      try {
        scene = createFactoryScene(canvas);
      } catch (error) {
        console.error('FactoryCanvas: WebGL initialisation failed', error);
        canvas.remove();
        return;
      }

      const resizeObserver = new ResizeObserver(([entry]) => {
        scene.setSize(entry.contentRect.width, entry.contentRect.height);
      });
      resizeObserver.observe(container);

      let inView = false;
      const syncActive = () => scene.setActive(inView && document.visibilityState === 'visible');
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncActive();
      });
      intersectionObserver.observe(container);
      document.addEventListener('visibilitychange', syncActive);

      const onPointerMove = (e: PointerEvent) => {
        scene.setPointer((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });

      onSceneChange(scene);

      teardown = () => {
        onSceneChange(null);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', syncActive);
        window.removeEventListener('pointermove', onPointerMove);
        scene.dispose();
        canvas.remove();
      };
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [onSceneChange]);

  return <div ref={containerRef} className="ft-canvas-host" />;
};
