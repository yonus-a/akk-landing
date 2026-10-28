import React, { useEffect, useState } from 'react';
import { Locale } from '../../domain/locale';
import { PROTRACTOR_ORIGIN, SITE_ANGLES } from '../../domain/protractor';
import { FactoryScene } from '../../infrastructure/three/createFactoryScene';

interface ProtractorOverlayProps {
  lang: Locale;
  scene: FactoryScene | null;
  enabled: boolean;
  opacity: number;
}

interface OverlayGeometry {
  cx: number;
  cy: number;
  radius: number;
}

const TICKS = Array.from({ length: 19 }, (_, i) => i * 10);

const polar = (g: OverlayGeometry, deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: g.cx - Math.cos(rad) * r, y: g.cy - Math.sin(rad) * r };
};

export const ProtractorOverlay: React.FC<ProtractorOverlayProps> = ({ lang, scene, enabled, opacity }) => {
  const [geometry, setGeometry] = useState<OverlayGeometry | null>(null);
  const active = enabled && opacity > 0 && scene !== null;

  useEffect(() => {
    if (!active || !scene) return;
    return scene.onFrame(() => {
      const { x, y } = scene.projectToScreen(PROTRACTOR_ORIGIN);
      const { width, height } = scene.getViewportSize();
      const radius = Math.min(width, height) * 0.42;
      setGeometry((prev) =>
        prev && Math.abs(prev.cx - x) < 0.5 && Math.abs(prev.cy - y) < 0.5 && prev.radius === radius
          ? prev
          : { cx: x, cy: y, radius },
      );
    });
  }, [active, scene]);

  return (
    <svg className="ft-protractor" style={{ display: enabled ? 'block' : 'none', opacity }}>
      {active && geometry && <ProtractorShape lang={lang} g={geometry} />}
    </svg>
  );
};

const ProtractorShape: React.FC<{ lang: Locale; g: OverlayGeometry }> = ({ lang, g }) => {
  const { cx, cy, radius } = g;
  return (
    <>
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="rgba(8, 22, 48, 0.16)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={6} fill="#00e1ff" stroke="#fff" strokeWidth={2} />

      {TICKS.map((deg) => {
        const inner = polar(g, deg, radius - 8);
        const outer = polar(g, deg, radius);
        return <line key={deg} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />;
      })}

      {SITE_ANGLES.map((angle) => {
        const end = polar(g, angle.deg, radius * 1.35);
        const label = polar(g, angle.deg, radius * 0.92);
        return (
          <g key={angle.deg}>
            <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={angle.color} strokeWidth={2.5} strokeDasharray="8 4" />
            <circle cx={label.x} cy={label.y} r={4} fill={angle.color} />
            <g transform={`translate(${label.x}, ${label.y - 10})`}>
              <rect x={-82} y={-22} width={164} height={24} rx={12} fill="rgba(7, 18, 38, 0.88)" stroke={angle.color} strokeWidth={1.2} />
              <text x={0} y={-6} fill="#fff" fontSize={11.2} fontWeight="bold" textAnchor="middle">
                {angle.label[lang]}
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
};
