import * as THREE from "three";

/**
 * Normalized board radii and wedge order. These constants mirror the values
 * used on the server so that the client visuals match the scoring logic.
 */
const BOARD = {
  doubleOuter: 1.0,
  doubleInner: 0.92,
  tripleOuter: 0.60,
  tripleInner: 0.53,
  singleBullRadius: 0.13,
  doubleBullRadius: 0.06,
};

const WEDGE_ORDER: number[] = [
  20, 1, 18, 4, 13,
  6, 10, 15, 2, 17,
  3, 19, 7, 16, 8,
  11, 14, 9, 12, 5,
];

/**
 * Draw a flat dartboard texture into a canvas and return it as a THREE.Texture.
 * This function is pure on every call and caches nothing; call once at
 * initialization. The resulting texture uses sRGB colorspace for vibrant
 * colors. The board is drawn in 2D with rings and wedge colors.
 */
export function makeDartboardTexture(sizePx: number = 1024): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context");
  const cx = sizePx / 2;
  const cy = sizePx / 2;
  // Fill background
  ctx.fillStyle = "#101218";
  ctx.fillRect(0, 0, sizePx, sizePx);
  function rToPx(rNorm: number): number {
    return rNorm * (sizePx * 0.5);
  }
  // Draw ring segments helper
  function drawRingSegment(
    innerR: number,
    outerR: number,
    startAngle: number,
    endAngle: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle, false);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  // For canvas arc: start angle is relative to +x axis and increases clockwise
  // because canvas uses y downwards. Real boards have the 20 centered at the
  // top, meaning wedge boundaries are +/- 9 degrees from the top axis.
  // We model that by offsetting the wedge boundary start by half a wedge.
  const wedge = (Math.PI * 2) / 20;
  const top = -Math.PI / 2 - wedge / 2;
  // Radii in pixels
  const rDoubleOuter = rToPx(BOARD.doubleOuter);
  const rDoubleInner = rToPx(BOARD.doubleInner);
  const rTripleOuter = rToPx(BOARD.tripleOuter);
  const rTripleInner = rToPx(BOARD.tripleInner);
  const rBullOuter = rToPx(BOARD.singleBullRadius);
  const rBullInner = rToPx(BOARD.doubleBullRadius);
  // Outer and inner singles
  for (let i = 0; i < 20; i++) {
    const a0 = top + i * wedge;
    const a1 = a0 + wedge;
    const base = i % 2 === 0 ? "#f2f2f2" : "#1a1a1a";
    // Outer single: between tripleOuter and doubleInner
    drawRingSegment(rTripleOuter, rDoubleInner, a0, a1, base);
    // Inner single: between bullOuter and tripleInner
    drawRingSegment(rBullOuter, rTripleInner, a0, a1, base);
  }
  // Triple ring (alternate red/green)
  for (let i = 0; i < 20; i++) {
    const a0 = top + i * wedge;
    const a1 = a0 + wedge;
    const color = i % 2 === 0 ? "#d21f2b" : "#1aa14a";
    drawRingSegment(rTripleInner, rTripleOuter, a0, a1, color);
  }
  // Double ring (alternate red/green)
  for (let i = 0; i < 20; i++) {
    const a0 = top + i * wedge;
    const a1 = a0 + wedge;
    const color = i % 2 === 0 ? "#d21f2b" : "#1aa14a";
    drawRingSegment(rDoubleInner, rDoubleOuter, a0, a1, color);
  }
  // Bulls
  ctx.beginPath();
  ctx.arc(cx, cy, rBullOuter, 0, Math.PI * 2);
  ctx.fillStyle = "#1aa14a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, rBullInner, 0, Math.PI * 2);
  ctx.fillStyle = "#d21f2b";
  ctx.fill();
  // Outline circle
  ctx.beginPath();
  ctx.arc(cx, cy, rDoubleOuter, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = Math.max(2, sizePx * 0.003);
  ctx.stroke();
  // Numbers on outer edge
  // Increase contrast by drawing a dark stroke behind the light fill. The
  // stroke provides an outline that helps the white numerals stand out
  // against both dark and light wedge backgrounds. Use a semi‑transparent
  // black stroke so it blends softly. Font size scales with texture size.
  ctx.font = `${Math.floor(sizePx * 0.04)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const numberRadius = rToPx(1.10);
  for (let i = 0; i < 20; i++) {
    const aMid = top + (i + 0.5) * wedge;
    const x = cx + Math.cos(aMid) * numberRadius;
    const y = cy + Math.sin(aMid) * numberRadius;
    const label = String(WEDGE_ORDER[i]);
    // Stroke outline for contrast
    ctx.lineWidth = Math.max(2, sizePx * 0.0035);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.strokeText(label, x, y);
    // Fill text on top
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(label, x, y);
  }

  // --- Begin custom ring labels ---
  // Draw labels for the scoring rings and bull values. This helps new
  // players understand which rings correspond to double and triple
  // scores, and identifies the single and double bullseye values.
  // Choose a smaller font size so the letters don't overpower the wedge
  // numbers. The opacity is reduced to avoid visual clutter.
  const ringFontSize = Math.floor(sizePx * 0.025);
  ctx.font = `${ringFontSize}px system-ui, sans-serif`;
  // Slightly increase opacity of D/T labels for better readability
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 20; i++) {
    const aMid = top + (i + 0.5) * wedge;
    // Position the 'D' between the inner and outer radii of the double ring.
    const rDoubleMid = ((BOARD.doubleInner + BOARD.doubleOuter) / 2) * 0.985;
    const xD = cx + Math.cos(aMid) * rToPx(rDoubleMid);
    const yD = cy + Math.sin(aMid) * rToPx(rDoubleMid);
    ctx.fillText("D", xD, yD);
    // Position the 'T' between the inner and outer radii of the triple ring.
    const rTripleMid = ((BOARD.tripleInner + BOARD.tripleOuter) / 2) * 0.985;
    const xT = cx + Math.cos(aMid) * rToPx(rTripleMid);
    const yT = cy + Math.sin(aMid) * rToPx(rTripleMid);
    ctx.fillText("T", xT, yT);
  }
  // Draw bull values. Place '25' just above the single bull ring and '50'
  // at the centre of the board. Offset slightly along the negative y
  // axis so the text doesn't interfere with the aim marker.
  ctx.font = `${Math.floor(sizePx * 0.03)}px system-ui, sans-serif`;
  const bull25Radius = BOARD.singleBullRadius * 0.6;
  // Draw bull values with a dark outline for contrast
  const writeBull = (text: string, x: number, y: number) => {
    ctx.lineWidth = Math.max(2, sizePx * 0.0035);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(text, x, y);
  };
  writeBull("25", cx, cy - rToPx(bull25Radius));
  writeBull("50", cx, cy);
  // --- End custom ring labels ---
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}