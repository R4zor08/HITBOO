/** Shared artillery simulation (percent coords, one frame = one integration step). */

export const GRAVITY_PER_FRAME = 0.4;
/** Maps HUD wind speed (0–20) to horizontal acceleration per frame. */
export const WIND_SPEED_TO_ACCEL = 0.0045;
export const POWER_TO_VELOCITY = 0.3;
export const HIT_RADIUS = 5;
export const GROUND_Y = 90;
export const OFFSCREEN_X_MIN = -20;
export const OFFSCREEN_X_MAX = 120;
export const MAX_SIM_STEPS = 2500;

export const P1_POS = { x: 20, y: 70 };
export const P2_POS = { x: 80, y: 70 };
export const PROJECTILE_START_Y_OFFSET = -5;

export type WindDirection = 'left' | 'right';

export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function windAccelPerFrame(
  windSpeed: number,
  direction: WindDirection
): number {
  const sign = direction === 'right' ? 1 : -1;
  return (windSpeed / 20) * WIND_SPEED_TO_ACCEL * 20 * sign;
}

export function initialVelocity(
  power: number,
  angleDeg: number,
  facingRight: boolean,
  velocityScale: number
): Pick<PhysicsBody, 'vx' | 'vy'> {
  const rad = (angleDeg * Math.PI) / 180;
  const dirX = facingRight ? 1 : -1;
  const base = power * POWER_TO_VELOCITY * velocityScale;
  return {
    vx: Math.cos(rad) * base * dirX,
    vy: -Math.sin(rad) * base
  };
}

export function simulateStep(
  body: PhysicsBody,
  windAcceleration: number
): PhysicsBody {
  return {
    x: body.x + body.vx,
    y: body.y + body.vy,
    vx: body.vx + windAcceleration,
    vy: body.vy + GRAVITY_PER_FRAME
  };
}

export interface ShotParams {
  power: number;
  angleDeg: number;
  shooterFacingRight: boolean;
  velocityScale: number;
  windSpeed: number;
  windDirection: WindDirection;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  /** Miss when trajectory Y exceeds this (percent). Defaults to {@link GROUND_Y}. */
  groundY?: number;
}

export type ShotSimResult =
  | { outcome: 'hit'; hitX: number; hitY: number }
  | { outcome: 'miss'; reason: 'ground' | 'offscreen' };

export function simulateShotUntilEnd(params: ShotParams): ShotSimResult {
  const gy = params.groundY ?? GROUND_Y;
  const wind = windAccelPerFrame(params.windSpeed, params.windDirection);
  const v0 = initialVelocity(
    params.power,
    params.angleDeg,
    params.shooterFacingRight,
    params.velocityScale
  );
  let body: PhysicsBody = {
    x: params.startX,
    y: params.startY,
    vx: v0.vx,
    vy: v0.vy
  };
  for (let i = 0; i < MAX_SIM_STEPS; i++) {
    body = simulateStep(body, wind);
    const { x, y } = body;
    if (y > gy || x < OFFSCREEN_X_MIN || x > OFFSCREEN_X_MAX) {
      return {
        outcome: 'miss',
        reason: y > gy ? 'ground' : 'offscreen'
      };
    }
    const dist = Math.hypot(x - params.targetX, y - params.targetY);
    if (dist < HIT_RADIUS) {
      return { outcome: 'hit', hitX: x, hitY: y };
    }
  }
  return { outcome: 'miss', reason: 'offscreen' };
}

export interface PointPct {
  x: number;
  y: number;
}

/** Preview path using the same step integrator (subsample for display). */
export function sampleTrajectoryPoints(
  params: Omit<ShotParams, 'targetX' | 'targetY'>,
  maxPoints = 80,
  sampleEvery = 3
): PointPct[] {
  const gy = params.groundY ?? GROUND_Y;
  const wind = windAccelPerFrame(params.windSpeed, params.windDirection);
  const v0 = initialVelocity(
    params.power,
    params.angleDeg,
    params.shooterFacingRight,
    params.velocityScale
  );
  let body: PhysicsBody = {
    x: params.startX,
    y: params.startY,
    vx: v0.vx,
    vy: v0.vy
  };
  const pts: PointPct[] = [{ x: body.x, y: body.y }];
  for (let i = 0; i < MAX_SIM_STEPS; i++) {
    body = simulateStep(body, wind);
    const { x, y } = body;
    if (i % sampleEvery === 0) pts.push({ x, y });
    if (y > gy || x < OFFSCREEN_X_MIN || x > OFFSCREEN_X_MAX) break;
    if (pts.length >= maxPoints) break;
  }
  return pts;
}

/** Arc samples plus last simulated point when ground/offscreen is reached (for impact marker). */
export function sampleTrajectoryWithTerminal(
  params: Omit<ShotParams, 'targetX' | 'targetY'>,
  maxPoints = 100,
  sampleEvery = 2
): { points: PointPct[]; terminal: PointPct } {
  const gy = params.groundY ?? GROUND_Y;
  const wind = windAccelPerFrame(params.windSpeed, params.windDirection);
  const v0 = initialVelocity(
    params.power,
    params.angleDeg,
    params.shooterFacingRight,
    params.velocityScale
  );
  let body: PhysicsBody = {
    x: params.startX,
    y: params.startY,
    vx: v0.vx,
    vy: v0.vy
  };
  const pts: PointPct[] = [{ x: body.x, y: body.y }];
  let terminal: PointPct = { x: body.x, y: body.y };
  for (let i = 0; i < MAX_SIM_STEPS; i++) {
    body = simulateStep(body, wind);
    const { x, y } = body;
    terminal = { x, y };
    if (i % sampleEvery === 0) pts.push({ x, y });
    if (y > gy || x < OFFSCREEN_X_MIN || x > OFFSCREEN_X_MAX) break;
    if (pts.length >= maxPoints) break;
  }
  return { points: pts, terminal };
}

export function computeHitDamage(
  baseDamage: number,
  powerPct: number
): number {
  const factor = 0.55 + (powerPct / 100) * 0.45;
  return Math.max(1, Math.round(baseDamage * factor));
}

/** Sticker hit regions vs foot anchor (percent coords; Y increases downward). */
export type HitBodyZone = 'head' | 'torso' | 'legs';
export type HitboxStance = 'standing' | 'jumping' | 'crouching' | 'prone';

export function hitRadiusForStance(stance: HitboxStance): number {
  switch (stance) {
    case 'prone':
      return HIT_RADIUS * 0.65;
    case 'crouching':
      return HIT_RADIUS * 0.78;
    case 'jumping':
      return HIT_RADIUS * 0.9;
    default:
      return HIT_RADIUS;
  }
}

/**
 * Classify impact relative to defender anchor. Positive dy means impact above
 * anchor (smaller Y) — treated as head/upper body.
 */
export function resolveHitZone(
  impactX: number,
  impactY: number,
  targetX: number,
  targetY: number
): { zone: HitBodyZone; multiplier: number } {
  const dy = targetY - impactY;
  const dx = Math.abs(impactX - targetX);

  let zone: HitBodyZone;
  if (dy > 3) {
    zone = 'head';
  } else if (dy < -2) {
    zone = 'legs';
  } else {
    zone = 'torso';
  }

  let multiplier =
    zone === 'head' ? 1.35 : zone === 'legs' ? 0.75 : 1.0;
  if (dx > 3) {
    multiplier *= 0.92;
  }

  return { zone, multiplier };
}

/** Base power-scaled damage times body-zone multiplier (Local 2P). */
export function computeHitDamageWithZone(
  baseDamage: number,
  powerPct: number,
  impactX: number,
  impactY: number,
  targetX: number,
  targetY: number
): number {
  const base = computeHitDamage(baseDamage, powerPct);
  const { multiplier } = resolveHitZone(
    impactX,
    impactY,
    targetX,
    targetY
  );
  return Math.max(1, Math.round(base * multiplier));
}

export interface AimSolution {
  power: number;
  angleDeg: number;
  missDistance: number;
}

/** Closest approach to target along trajectory; 0 if hit. */
export function measureShotToTarget(params: ShotParams): number {
  const gy = params.groundY ?? GROUND_Y;
  const wind = windAccelPerFrame(params.windSpeed, params.windDirection);
  const v0 = initialVelocity(
    params.power,
    params.angleDeg,
    params.shooterFacingRight,
    params.velocityScale
  );
  let body: PhysicsBody = {
    x: params.startX,
    y: params.startY,
    vx: v0.vx,
    vy: v0.vy
  };
  let minD = Infinity;
  for (let i = 0; i < MAX_SIM_STEPS; i++) {
    body = simulateStep(body, wind);
    const { x, y } = body;
    if (y > gy || x < OFFSCREEN_X_MIN || x > OFFSCREEN_X_MAX) {
      break;
    }
    const d = Math.hypot(x - params.targetX, y - params.targetY);
    minD = Math.min(minD, d);
    if (d < HIT_RADIUS) return 0;
  }
  return minD;
}

/** Grid search for enemy AI: minimize distance to target (0 = hitting line). */
export function findBestAim(
  params: Omit<ShotParams, 'power' | 'angleDeg'> & {
    startX: number;
    startY: number;
  }
): AimSolution {
  let best: AimSolution = {
    power: 70,
    angleDeg: 50,
    missDistance: Infinity
  };
  for (let angle = 28; angle <= 82; angle += 2) {
    for (let power = 25; power <= 100; power += 5) {
      const minD = measureShotToTarget({
        ...params,
        power,
        angleDeg: angle
      });
      if (minD < best.missDistance) {
        best = { power, angleDeg: angle, missDistance: minD };
      }
    }
  }
  return best;
}

export function applyAimError(
  power: number,
  angleDeg: number,
  errorPower: number,
  errorDeg: number
): { power: number; angleDeg: number } {
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };
  let p = power + gauss() * errorPower;
  let a = angleDeg + gauss() * errorDeg;
  p = Math.max(15, Math.min(100, p));
  a = Math.max(15, Math.min(85, a));
  return { power: p, angleDeg: a };
}
