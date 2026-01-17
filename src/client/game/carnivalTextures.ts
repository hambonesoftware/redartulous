import * as THREE from "three";

type Rng = () => number;

function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randRange(rng: Rng, min: number, max: number): number {
  return min + (max - min) * rng();
}

function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(randRange(rng, min, max + 1));
}

function drawWrapped(
  draw: (xOffset: number) => void,
  width: number,
): void {
  draw(0);
  draw(-width);
  draw(width);
}

function drawSky(ctx: CanvasRenderingContext2D, size: number, rng: Rng): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "#040611");
  gradient.addColorStop(0.6, "#1a1233");
  gradient.addColorStop(1, "#0c0b1d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(size * 0.5, size * 0.55, size * 0.1, size * 0.5, size * 0.55, size * 0.6);
  glow.addColorStop(0, "rgba(110, 84, 166, 0.25)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  const haze = ctx.createLinearGradient(0, size * 0.1, 0, size * 0.6);
  haze.addColorStop(0, "rgba(63, 70, 110, 0.25)");
  haze.addColorStop(1, "rgba(10, 12, 28, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let i = 0; i < 220; i += 1) {
    const x = rng() * size;
    const y = rng() * size * 0.7;
    const r = rng() * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSilhouettes(ctx: CanvasRenderingContext2D, size: number, rng: Rng): void {
  ctx.fillStyle = "rgba(9, 10, 22, 0.65)";
  ctx.strokeStyle = "rgba(12, 12, 26, 0.6)";
  ctx.lineWidth = 3;

  const wheelX = size * 0.2;
  const wheelY = size * 0.72;
  const wheelR = size * 0.22;

  ctx.beginPath();
  ctx.arc(wheelX, wheelY, wheelR, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(wheelX, wheelY);
    ctx.lineTo(wheelX + Math.cos(angle) * wheelR, wheelY + Math.sin(angle) * wheelR);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(0, size * 0.8);
  for (let i = 0; i <= 5; i += 1) {
    const x = (i / 5) * size;
    const y = size * 0.6 + Math.sin(i * 1.3) * size * 0.05;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(size, size);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fill();

  const tentCount = 4;
  for (let i = 0; i < tentCount; i += 1) {
    const baseX = (i / tentCount) * size + randRange(rng, -20, 20);
    const baseY = size * 0.82 + randRange(rng, -10, 10);
    const peakH = size * 0.18 + randRange(rng, -10, 10);
    ctx.beginPath();
    ctx.moveTo(baseX - size * 0.08, baseY);
    ctx.lineTo(baseX, baseY - peakH);
    ctx.lineTo(baseX + size * 0.08, baseY);
    ctx.closePath();
    ctx.fill();
  }

  drawWrapped(
    (xOffset) => {
      ctx.fillStyle = "rgba(6, 8, 16, 0.5)";
      ctx.fillRect(xOffset + size * 0.55, size * 0.68, size * 0.2, size * 0.25);
    },
    size,
  );
}

function drawBokeh(ctx: CanvasRenderingContext2D, size: number, rng: Rng): void {
  const bandY = size * 0.35;
  const bandHeight = size * 0.2;
  const colours = [
    "rgba(255, 198, 117, 0.35)",
    "rgba(255, 166, 84, 0.25)",
    "rgba(255, 221, 152, 0.3)",
  ];

  for (let i = 0; i < 35; i += 1) {
    const x = rng() * size;
    const y = bandY + rng() * bandHeight;
    const r = randRange(rng, 10, 28);
    const colour = colours[randInt(rng, 0, colours.length - 1)];
    drawWrapped(
      (offset) => {
        ctx.fillStyle = colour;
        for (let ring = 0; ring < 3; ring += 1) {
          ctx.globalAlpha = 0.5 - ring * 0.15;
          ctx.beginPath();
          ctx.arc(x + offset, y, r + ring * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
      size,
    );
  }
}

function drawTentStripes(ctx: CanvasRenderingContext2D, size: number, rng: Rng): void {
  ctx.save();
  ctx.translate(size * 0.5, size * 0.95);
  ctx.rotate(-0.2);
  ctx.lineWidth = size * 0.05;
  const stripeColours = [
    "rgba(162, 86, 86, 0.2)",
    "rgba(226, 210, 186, 0.15)",
  ];

  for (let i = 0; i < 8; i += 1) {
    const colour = stripeColours[i % stripeColours.length];
    const radius = size * (0.35 + i * 0.05) + randRange(rng, -8, 8);
    ctx.strokeStyle = colour;
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.restore();

  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 6; i += 1) {
    const x = (i / 6) * size;
    ctx.fillStyle = i % 2 === 0 ? "rgba(177, 98, 98, 0.2)" : "rgba(234, 220, 204, 0.15)";
    ctx.fillRect(x, size * 0.55, size * 0.08, size * 0.45);
  }
  ctx.globalAlpha = 1;
}

function drawVignette(ctx: CanvasRenderingContext2D, size: number, rng: Rng): void {
  const vignette = ctx.createRadialGradient(size * 0.5, size * 0.6, size * 0.25, size * 0.5, size * 0.6, size * 0.75);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.6)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(8, 8, 14, 0.65)";
  const postCount = 6;
  for (let i = 0; i < postCount; i += 1) {
    const x = (i / (postCount - 1)) * size + randRange(rng, -10, 10);
    drawWrapped(
      (offset) => {
        ctx.fillRect(x + offset, size * 0.7, size * 0.015, size * 0.3);
      },
      size,
    );
  }
}

export function makeCarnivalLayerTexture(layer: number, seed: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rng = makeRng((seed << 3) + layer * 17);

  switch (layer) {
    case 1:
      drawSky(ctx, size, rng);
      break;
    case 2:
      drawSky(ctx, size, rng);
      drawSilhouettes(ctx, size, rng);
      break;
    case 3:
      drawSky(ctx, size, rng);
      drawBokeh(ctx, size, rng);
      break;
    case 4:
      drawSky(ctx, size, rng);
      drawTentStripes(ctx, size, rng);
      break;
    case 5:
      drawSky(ctx, size, rng);
      drawVignette(ctx, size, rng);
      break;
    default:
      drawSky(ctx, size, rng);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
