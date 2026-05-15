import type { ArenaPercent } from './aimFromDrag';

/** Normalize axis to [-1, 1] after linear dead zone (values inside ±dead become 0). */
export function applyAxisDeadZone(value: number, dead: number): number {
  const d = Math.max(0, dead);
  if (Math.abs(value) <= d) return 0;
  const sign = value > 0 ? 1 : -1;
  return sign * ((Math.abs(value) - d) / (1 - d));
}

/**
 * Apply a circular dead zone in the unit square; returns adjusted (x, y) with length ≤ 1.
 */
export function applyStickCircularDeadZone(
  x: number,
  y: number,
  dead: number
): { x: number; y: number } {
  const d = Math.max(0, Math.min(0.99, dead));
  const len = Math.hypot(x, y);
  if (len <= d || len < 1e-6) return { x: 0, y: 0 };
  const scale = (len - d) / (1 - d) / len;
  return { x: x * scale, y: y * scale };
}

/**
 * Map right-stick deflection (after dead zone, roughly -1..1) to a synthetic pointer
 * in arena percent space for {@link slingshotAimFromPointer}.
 */
export function stickToArenaPointer(
  anchor: ArenaPercent,
  stickX: number,
  stickY: number,
  maxDeflectionPct: number
): ArenaPercent {
  const m = Math.max(0.1, maxDeflectionPct);
  // Browser stick Y: negative = physical up → lower arena y (pull “up” on screen).
  return {
    x: anchor.x + stickX * m,
    y: anchor.y + stickY * m
  };
}

/**
 * True on the frame the fire button transitions from pressed to released (release-to-fire).
 */
export function detectFireButtonReleasedEdge(
  wasPressed: boolean,
  isPressed: boolean
): boolean {
  return wasPressed && !isPressed;
}

/** Standard mapping: pressed flag or analog value threshold. */
export function readButtonPressed(
  b: { pressed?: boolean; value?: number } | undefined
): boolean {
  if (!b) return false;
  if (typeof b.pressed === 'boolean' && b.pressed) return true;
  return (b.value ?? 0) > 0.5;
}

/**
 * Analog triggers (RT/LT) often report `value` 0–1 while `pressed` stays false until fully
 * bottomed-out. Use this for consistent pull strength.
 */
export function readAnalogTriggerNorm(
  b: { pressed?: boolean; value?: number } | undefined
): number {
  if (!b) return 0;
  const v = Math.max(0, Math.min(1, b.value ?? 0));
  if (typeof b.pressed === 'boolean' && b.pressed) return Math.max(v, 1);
  return v;
}

export type TriggerReleaseParams = {
  /** Treat trigger as pulled when norm exceeds this (default 0.2). */
  pullAbove?: number;
  /** Release edge when norm drops below this (default 0.12). Must be < pullAbove. */
  releaseBelow?: number;
};

/**
 * True when the trigger was pulled past `pullAbove` last frame and is now below `releaseBelow`.
 * Hysteresis avoids chatter on analog triggers.
 */
export function detectAnalogTriggerReleasedEdge(
  prevNorm: number,
  norm: number,
  params?: TriggerReleaseParams
): boolean {
  const pullAbove = params?.pullAbove ?? 0.2;
  const releaseBelow = params?.releaseBelow ?? 0.12;
  return prevNorm > pullAbove && norm < releaseBelow;
}
