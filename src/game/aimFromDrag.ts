/** Client pixels → arena percent (same space as P1_POS / P2_POS). */

export type ArenaPercent = { x: number; y: number };

export function clientToArenaPercent(
  clientX: number,
  clientY: number,
  rect: DOMRect
): ArenaPercent {
  const w = rect.width || 1;
  const h = rect.height || 1;
  return {
    x: ((clientX - rect.left) / w) * 100,
    y: ((clientY - rect.top) / h) * 100
  };
}

export function pointerNearAnchor(
  px: number,
  py: number,
  ax: number,
  ay: number,
  radiusPct: number
): boolean {
  return Math.hypot(px - ax, py - ay) <= radiusPct;
}

export interface SlingshotAimResult {
  aimAngle: number;
  aimPower: number;
  /** Screen-space pull angle (deg) for character lean; atan2 from anchor to pointer. */
  aimPullDeg: number;
}

/**
 * Bowmasters-style drag from shooter: distance → power; direction → launch angle
 * (same convention as `initialVelocity`: elevation 0–90°, power 0–100).
 */
export function slingshotAimFromPointer(
  pointer: ArenaPercent,
  anchor: ArenaPercent,
  facingRight: boolean,
  sensitivity: number
): SlingshotAimResult {
  const relX = pointer.x - anchor.x;
  const relY = pointer.y - anchor.y;
  const towardEnemy = facingRight ? relX : -relX;
  const up = anchor.y - pointer.y;
  const angleRad = Math.atan2(up, Math.max(0.75, towardEnemy));
  let aimAngle = (angleRad * 180) / Math.PI;
  aimAngle = Math.max(5, Math.min(90, aimAngle));

  const dist = Math.hypot(relX, relY);
  const maxDragPct = 28 / Math.max(0.5, sensitivity);
  const aimPower = Math.min(100, (dist / maxDragPct) * 100);

  const aimPullDeg = (Math.atan2(relY, relX) * 180) / Math.PI;

  return { aimAngle, aimPower, aimPullDeg };
}
