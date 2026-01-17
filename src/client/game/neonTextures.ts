import * as THREE from "three";

/**
 * Convert a hex colour (e.g. "#22D3EE") into RGBA string with given alpha.
 */
function hexToRgba(hex: string, alpha = 1): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Simple pseudo‑random number generator based on Mulberry32.
 * Provides deterministic randomness for procedural textures.
 */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return function (): number {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw horizontal scanlines on the given 2D context.
 */
function drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number, colour: string, spacing = 4): void {
  ctx.fillStyle = colour;
  for (let y = 0; y < height; y += spacing) {
    ctx.fillRect(0, y, width, 1);
  }
}

/**
 * Draw a perspective‑ish neon grid on the given context.
 * The grid lines fade towards the top to imply depth.
 */
function drawNeonGrid(ctx: CanvasRenderingContext2D, width: number, height: number, colour: string, rng: () => number): void {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  // horizontal lines
  const rows = 10;
  for (let i = 1; i < rows; i++) {
    const y = (i / rows) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  // vertical lines with slight perspective skew
  const cols = 12;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (rng() - 0.5) * 10, height);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw random neon glyphs (simple circles, crosses, triangles) on the canvas.
 * These add interest to the grid layer. Uses RNG for positions and sizes.
 */
function drawNeonGlyphs(ctx: CanvasRenderingContext2D, width: number, height: number, colours: string[], rng: () => number): void {
  const glyphCount = 40;
  for (let i = 0; i < glyphCount; i++) {
    const shape = Math.floor(rng() * 3);
    const x = rng() * width;
    const y = rng() * height;
    const size = 4 + rng() * 12;
    const colour = colours[Math.floor(rng() * colours.length)];
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1;
    ctx.fillStyle = colour;
    ctx.globalAlpha = 0.7 + rng() * 0.3;
    ctx.beginPath();
    if (shape === 0) {
      // circle
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 1) {
      // cross
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    } else {
      // triangle
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x - size, y + size);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Generate a neon layer texture. Variant selects different colour palettes.
 *
 * @param variant - 1 or 2 selects the palette combination
 * @param seed - Seed for RNG to vary the glyph placement
 */
export function makeNeonLayerTexture(variant = 1, seed = 1): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, size);
  if (variant === 1) {
    bgGradient.addColorStop(0, "#070A12");
    bgGradient.addColorStop(1, "#0B1020");
  } else {
    bgGradient.addColorStop(0, "#0B1020");
    bgGradient.addColorStop(1, "#070A12");
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  // Draw scanlines
  drawScanlines(ctx, size, size, "rgba(255, 255, 255, 0.03)", 4);

  // Seeded RNG
  const rng = makeRng((seed << 1) + variant);

  // Draw grid and glyphs with variant colours
  if (variant === 1) {
    drawNeonGrid(ctx, size, size, hexToRgba("#22D3EE", 0.3), rng);
    drawNeonGlyphs(ctx, size, size, ["#22D3EE", "#A3E635", "#FBBF24"], rng);
  } else {
    drawNeonGrid(ctx, size, size, hexToRgba("#F472B6", 0.3), rng);
    drawNeonGlyphs(ctx, size, size, ["#F472B6", "#A3E635", "#FBBF24"], rng);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}