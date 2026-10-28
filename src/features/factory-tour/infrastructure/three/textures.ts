import * as THREE from 'three';

const FA_FONT = 'Vazirmatn, Tahoma, sans-serif';

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function repeating(canvas: HTMLCanvasElement, rx: number, ry: number) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, ry);
  tex.anisotropy = 4;
  return tex;
}

/** Sprinkles low-contrast specks so flat fills read as a real surface. */
function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, light: number, dark: number, size = 2) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * light})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, size, size);
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * dark})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, size, size);
  }
}

/** Trapezoidal-rib roof/wall sheeting with soft light/shadow on each rib. */
export function createCorrugatedTex(baseHex: string, shadeHex: string, rx = 24, ry = 18) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 16) {
    const g = ctx.createLinearGradient(i, 0, i + 16, 0);
    g.addColorStop(0, 'rgba(255,255,255,0.16)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.03)');
    g.addColorStop(0.55, shadeHex);
    g.addColorStop(0.75, 'rgba(0,0,0,0.05)');
    g.addColorStop(1, 'rgba(255,255,255,0.12)');
    ctx.fillStyle = g;
    ctx.fillRect(i, 0, 16, 256);
  }
  ctx.globalAlpha = 0.5;
  speckle(ctx, 256, 256, 500, 0.04, 0.05);
  ctx.globalAlpha = 1;
  return repeating(canvas, rx, ry);
}

/** Light-grey insulated sandwich panel: fine micro-ribs and a seam at the top of each panel. */
export function createSandwichPanelTex(rx: number, ry: number) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#d9dde1';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    ctx.fillStyle = 'rgba(0,0,0,0.035)';
    ctx.fillRect(0, y + 14, 256, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, y + 17, 256, 1);
  }
  ctx.fillStyle = 'rgba(70,80,90,0.45)';
  ctx.fillRect(0, 0, 256, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(0, 3, 256, 1);
  speckle(ctx, 256, 256, 400, 0.05, 0.03);
  return repeating(canvas, rx, ry);
}

/** Exterior precast/panel wall: light grey with horizontal joints and weathering streaks. */
export function createExteriorPanelTex(rx: number, ry: number) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#c4c9cf';
  ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 3) {
    ctx.fillStyle = `rgba(90,95,100,${Math.random() * 0.05})`;
    ctx.fillRect(x, 0, 2, 256 * Math.random());
  }
  ctx.fillStyle = 'rgba(60,66,72,0.35)';
  ctx.fillRect(0, 0, 256, 2);
  ctx.fillRect(0, 128, 256, 2);
  speckle(ctx, 256, 256, 700, 0.06, 0.05);
  return repeating(canvas, rx, ry);
}

/** Reflective foil roof insulation held up by a lattice of straps, as seen under the production roof. */
export function createFoilCeilingTex(rx: number, ry: number) {
  const { canvas, ctx } = makeCanvas(256, 256);
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, '#d7dce2');
  g.addColorStop(0.5, '#b9c0c8');
  g.addColorStop(1, '#dfe3e8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    const x = Math.random() * 256;
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 30, 80, x - 30, 170, x + 10, 256);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120,130,140,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
  }
  return repeating(canvas, rx, ry);
}

/** Light polished concrete with saw-cut joints, trowel marks and scuffs. */
export function createConcreteFloorTex(rx: number, ry: number) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#c3c7cb';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 20 + Math.random() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = Math.random() < 0.5 ? '255,255,255' : '80,85,90';
    g.addColorStop(0, `rgba(${tone},${0.04 + Math.random() * 0.05})`);
    g.addColorStop(1, `rgba(${tone},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  speckle(ctx, 512, 512, 3500, 0.08, 0.08, 1.5);
  ctx.strokeStyle = 'rgba(40,44,48,0.12)';
  for (let i = 0; i < 14; i++) {
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 160, y + (Math.random() - 0.5) * 60);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(60,64,70,0.35)';
  ctx.fillRect(0, 0, 512, 2);
  ctx.fillRect(0, 0, 2, 512);
  return repeating(canvas, rx, ry);
}

/** White ceramic tiles with grey grout (paint shop wash wall). */
export function createTileTex(rx: number, ry: number) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#b9bec4';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      const g = ctx.createLinearGradient(x, y, x + 64, y + 64);
      g.addColorStop(0, '#f6f8fa');
      g.addColorStop(1, '#e3e7eb');
      ctx.fillStyle = g;
      ctx.fillRect(x + 2, y + 2, 60, 60);
    }
  }
  return repeating(canvas, rx, ry);
}

/** Galvanized bar grating. */
export function createGratingTex(rx: number, ry: number) {
  const { canvas, ctx } = makeCanvas(128, 128);
  ctx.fillStyle = '#2b2f33';
  ctx.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 8) {
    const g = ctx.createLinearGradient(x, 0, x + 5, 0);
    g.addColorStop(0, '#d5dadf');
    g.addColorStop(1, '#8d959c');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 5, 128);
  }
  for (let y = 0; y < 128; y += 32) {
    ctx.fillStyle = '#a9b0b7';
    ctx.fillRect(0, y, 128, 3);
  }
  return repeating(canvas, rx, ry);
}

/** Stretch-wrap film: near-white with folds and glossy streaks. */
export function createStretchWrapTex() {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#e9edf1';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    const y = Math.random() * 256;
    ctx.strokeStyle = Math.random() < 0.5 ? `rgba(255,255,255,${0.3 + Math.random() * 0.5})` : `rgba(120,130,145,${0.1 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(80, y + (Math.random() - 0.5) * 30, 170, y + (Math.random() - 0.5) * 30, 256, y + (Math.random() - 0.5) * 20);
    ctx.stroke();
  }
  return repeating(canvas, 1, 1);
}

/** Galvanized roller shutter slats. */
export function createRollerShutterTex() {
  const { canvas, ctx } = makeCanvas(64, 256);
  ctx.fillStyle = '#b8bec5';
  ctx.fillRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 10) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, y, 64, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, y + 8, 64, 2);
  }
  return repeating(canvas, 1, 1);
}

export function createLivaLogoTex() {
  const { canvas, ctx } = makeCanvas(256, 64);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('LIVA', 10, 34);
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('甬华', 130, 34);
  return new THREE.CanvasTexture(canvas);
}

/** Hazy summer sky, used as the screen-space background in the aerial shot. */
export function createSkyTex() {
  const { canvas, ctx } = makeCanvas(4, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#9fb4c9');
  g.addColorStop(0.45, '#c9d3dc');
  g.addColorStop(0.75, '#e6e4dc');
  g.addColorStop(1, '#d9d6cc');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  return new THREE.CanvasTexture(canvas);
}

/** Soft radial glow for lamp halos. */
export function createGlowTex() {
  const { canvas, ctx } = makeCanvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,250,235,0.65)');
  g.addColorStop(0.55, 'rgba(255,245,225,0.12)');
  g.addColorStop(1, 'rgba(255,245,225,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

/** Soft rectangular darkening used as a fake ambient-occlusion footprint under objects. */
export function createContactShadowTex() {
  const size = 128;
  const { canvas, ctx } = makeCanvas(size, size);
  const inset = 30;
  // Draw the rect off-canvas and keep only its blurred shadow (ctx.filter isn't supported everywhere).
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetX = size * 4;
  ctx.fillStyle = '#000';
  ctx.fillRect(inset - size * 4, inset, size - inset * 2, size - inset * 2);
  return new THREE.CanvasTexture(canvas);
}

export function createGridWinTex(cols = 5, rows = 3) {
  const { canvas, ctx } = makeCanvas(320, 192);
  const g = ctx.createLinearGradient(0, 0, 320, 192);
  g.addColorStop(0, '#5d7896');
  g.addColorStop(0.5, '#1d2f45');
  g.addColorStop(1, '#3f5a78');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 320, 192);
  ctx.strokeStyle = '#dfe6ee';
  ctx.lineWidth = 6;
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath(); ctx.moveTo((i / cols) * 320, 0); ctx.lineTo((i / cols) * 320, 192); ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath(); ctx.moveTo(0, (j / rows) * 192); ctx.lineTo(320, (j / rows) * 192); ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

export function createRoadTex(repeats = 16) {
  const { canvas, ctx } = makeCanvas(128, 256);
  ctx.fillStyle = '#3d4247';
  ctx.fillRect(0, 0, 128, 256);
  speckle(ctx, 128, 256, 900, 0.07, 0.1, 1.5);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = 'rgba(20,22,25,0.18)';
    ctx.fillRect(20 + Math.random() * 80, 0, 6 + Math.random() * 8, 256);
  }
  ctx.fillStyle = '#e2e5e8';
  ctx.fillRect(61, 30, 6, 95);
  return repeating(canvas, 1, repeats);
}

/** Vineyard rows, as in the fields flanking the site. */
export function createFieldTex() {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#4b5a32';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 10) {
    ctx.fillStyle = '#2f5a1f';
    ctx.fillRect(0, y, 256, 6);
    for (let x = 0; x < 256; x += 4) {
      ctx.fillStyle = `rgba(${60 + Math.random() * 40},${110 + Math.random() * 50},40,0.6)`;
      ctx.fillRect(x, y + Math.random() * 3, 3, 3);
    }
  }
  return repeating(canvas, 18, 18);
}

export function createHazardTex() {
  const { canvas, ctx } = makeCanvas(128, 128);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#111827';
  for (let i = -128; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i + 16, 0); ctx.lineTo(i + 16 + 128, 128); ctx.lineTo(i + 128, 128);
    ctx.closePath(); ctx.fill();
  }
  return repeating(canvas, 4, 0.5);
}

export function createXMarkTex() {
  const { canvas, ctx } = makeCanvas(128, 128);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(18, 18); ctx.lineTo(110, 110); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(110, 18); ctx.lineTo(18, 110); ctx.stroke();
  return new THREE.CanvasTexture(canvas);
}

export function createSignTex(fa: string, en: string, color: string) {
  const { canvas, ctx } = makeCanvas(512, 128);
  ctx.fillStyle = '#0b1e3a';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.strokeRect(7, 7, 498, 114);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 46px ${FA_FONT}`;
  ctx.fillText(fa, 256, 58);
  ctx.font = 'bold 27px Arial, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(en, 256, 102);
  return new THREE.CanvasTexture(canvas);
}

export function createFloorDecalTex(fa: string, en: string, color: string) {
  const { canvas, ctx } = makeCanvas(512, 192);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.font = `bold 64px ${FA_FONT}`;
  ctx.fillText(fa, 256, 88);
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.fillText(en, 256, 152);
  return new THREE.CanvasTexture(canvas);
}

export function createSafetyBoardTex() {
  const { canvas, ctx } = makeCanvas(320, 200);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 0, 320, 200);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 308, 188);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = `bold 26px ${FA_FONT}`;
  ctx.fillText('تابلو ایمنی', 160, 40);
  ctx.font = 'bold 17px Arial, sans-serif';
  ctx.fillText('SAFETY BOARD', 160, 64);
  const rows = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa'];
  rows.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(28, 82 + i * 26, 264, 14);
  });
  return new THREE.CanvasTexture(canvas);
}

export function createAkkLogoTex() {
  const { canvas, ctx } = makeCanvas(512, 256);
  ctx.fillStyle = '#1d3fe0';
  ctx.strokeStyle = '#0b1f8f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(35, 132);
  ctx.quadraticCurveTo(215, 12, 465, 65);
  ctx.lineTo(443, 100);
  ctx.quadraticCurveTo(225, 52, 65, 152);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.font = 'italic 900 126px sans-serif';
  ctx.fillText('AKK', 62, 224);
  ctx.strokeText('AKK', 62, 224);
  return new THREE.CanvasTexture(canvas);
}
