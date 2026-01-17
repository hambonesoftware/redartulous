import type { ThrowSegment } from "../shared/types/game";
import { toUint32 } from "./gameStore";

/**
 * Normalized board radii. All distances are relative to an outer radius of 1.0
 * for the edge of the double ring. Adjust these constants if you wish to
 * fine tune the feel of the game or the visual representation.
 */
export const BOARD = {
  outerRadius: 1.0,
  // Bullseye radii
  doubleBullRadius: 0.06,
  singleBullRadius: 0.13,
  // Triple ring band
  tripleInner: 0.53,
  tripleOuter: 0.60,
  // Double ring band
  doubleInner: 0.92,
  doubleOuter: 1.0,
};

/**
 * Server/client "tuning" constants for the probability circle.
 *
 * IMPORTANT:
 * - These should match the client’s DartGame configuration so that what the
 *   player sees is what the server actually uses.
 * - If the client is allowed to show a bigger idle circle (e.g. 0.48 with a pulse),
 *   the server must allow that max or else it will silently clamp, causing mismatch.
 *
 * Current client intent:
 * - probRadiusBase ~= 0.48
 * - idle pulse can push it slightly higher (~+10%)
 * - so server max should be comfortably above ~0.53
 */
export const PROB_RADIUS = {
  // Match DartGame.probRadiusMin (and the server’s prior minimum).
  min: 0.02,

  // Server fallback if client sends NaN/undefined. Should be a "reasonable" mid value.
  // Keep this aligned with what you want the feel to be if the client glitches.
  fallback: 0.12,

  // Allow the Stardew-style larger idle circle to exist without being clamped.
  // Client base 0.48 with breathing up to ~0.53, so 0.60 gives comfortable headroom.
  max: 0.60,
};

/**
 * Standard dartboard wedge order clockwise starting from the top (20). See
 * NON-NEGOTIABLES in the user spec.
 */
export const WEDGE_ORDER: number[] = [
  20, 1, 18, 4, 13,
  6, 10, 15, 2, 17,
  3, 19, 7, 16, 8,
  11, 14, 9, 12, 5,
];

/**
 * Pseudo random number generator using Xorshift32. Given an initial seed,
 * returns a function that yields deterministic unsigned 32-bit integers on
 * successive calls. This is used server-side to derive the random offset
 * within the probability circle so that clients cannot cheat by sending
 * perfect coordinates.
 */
export function xorshift32(seed: number): () => number {
  let x = toUint32(seed);
  return () => {
    x ^= toUint32(x << 13);
    x ^= toUint32(x >>> 17);
    x ^= toUint32(x << 5);
    return toUint32(x);
  };
}

/**
 * Convert an unsigned 32 bit integer into a floating point number in [0,1).
 */
export function rand01(nextU32: () => number): number {
  return (nextU32() >>> 0) / 4294967296;
}

/**
 * Sample a uniform random point inside a circle of the given radius. Uses
 * sqrt(u) trick to ensure even distribution over area. Returns the delta
 * from the circle centre.
 */
export function sampleUniformInCircle(
  nextU32: () => number,
  radius: number
): { dx: number; dy: number } {
  const u = rand01(nextU32);
  const v = rand01(nextU32);
  const r = Math.sqrt(u) * radius;
  const theta = v * Math.PI * 2;
  return { dx: r * Math.cos(theta), dy: r * Math.sin(theta) };
}

/**
 * Score a hit given x/y coordinates in normalized board space. The y axis
 * points up and x axis points right. Angles are measured clockwise from the
 * +Y axis. Returns segment details along with the polar radius and the
 * angle in radians from the top. Small tolerances are applied around ring
 * boundaries to reduce flicker.
 */
export function scoreHit(
  x: number,
  y: number
): { segment: ThrowSegment; r: number; angleFromTopRad: number } {
  const r = Math.sqrt(x * x + y * y);

  // Anything beyond the double ring is a miss
  if (r > BOARD.doubleOuter) {
    return {
      segment: { number: 0, multiplier: 1, label: "MISS", points: 0 },
      r,
      angleFromTopRad: 0,
    };
  }

  // Bulls
  if (r <= BOARD.doubleBullRadius) {
    return {
      segment: { number: 50, multiplier: 1, label: "DBULL", points: 50 },
      r,
      angleFromTopRad: 0,
    };
  }
  if (r <= BOARD.singleBullRadius) {
    return {
      segment: { number: 25, multiplier: 1, label: "SBULL", points: 25 },
      r,
      angleFromTopRad: 0,
    };
  }

  // Compute angle in radians from the top (+Y) clockwise. Math.atan2 returns
  // angle relative to the +X axis counter-clockwise; by swapping x/y we
  // effectively rotate the coordinate system so that 0 rad corresponds to +Y.
  let angleFromTopRad = Math.atan2(x, y);
  if (angleFromTopRad < 0) angleFromTopRad += Math.PI * 2;

  // Real boards have the 20 centered at the top, meaning wedge boundaries are
  // +/- 9 degrees around that center. To model that correctly, shift the angle
  // by half a wedge before bucketing.
  const wedgeSize = (Math.PI * 2) / 20;
  const wedgeHalf = wedgeSize / 2;
  const wedgeIndex =
    Math.floor(((angleFromTopRad + wedgeHalf) % (Math.PI * 2)) / wedgeSize) % 20;
  const number = WEDGE_ORDER[wedgeIndex];

  // Determine multiplier by radial band. Apply a small epsilon so that hits
  // exactly on boundaries lean toward the higher multiplier (visual flicker
  // reduction). You can tweak eps values to taste.
  const eps = 0.001;
  let multiplier: 1 | 2 | 3 = 1;
  if (r + eps >= BOARD.doubleInner && r <= BOARD.doubleOuter + eps) {
    multiplier = 2;
  } else if (r + eps >= BOARD.tripleInner && r <= BOARD.tripleOuter + eps) {
    multiplier = 3;
  }

  const points = number * multiplier;
  const prefix = multiplier === 1 ? "" : multiplier === 2 ? "D" : "T";
  const label = multiplier === 1 ? String(number) : `${prefix}${number}`;

  return {
    segment: { number, multiplier, label, points },
    r,
    angleFromTopRad,
  };
}

/**
 * Clamp an aim coordinate into a reasonable range. Disallows extreme values
 * sent by misbehaving clients.
 */
export function clampAim(v: number): number {
  if (!Number.isFinite(v)) return 0;
  if (v > 1.25) return 1.25;
  if (v < -1.25) return -1.25;
  return v;
}

/**
 * Clamp a radius for the probability circle into a reasonable range.
 *
 * IMPORTANT: keep this aligned with client-side DartGame's visible radius range.
 */
export function clampRadius(r: number): number {
  if (!Number.isFinite(r)) return PROB_RADIUS.fallback;
  if (r < PROB_RADIUS.min) return PROB_RADIUS.min;
  if (r > PROB_RADIUS.max) return PROB_RADIUS.max;
  return r;
}
