import { describe, expect, it } from 'vitest';
import {
  GROUND_Y,
  OFFSCREEN_X_MAX,
  OFFSCREEN_X_MIN,
  P1_POS,
  P2_POS,
  PROJECTILE_START_Y_OFFSET,
  computeHitDamage,
  computeHitDamageWithZone,
  findBestAim,
  initialVelocity,
  resolveHitZone,
  simulateShotUntilEnd
} from './artilleryPhysics';

describe('initialVelocity', () => {
  it('faces right with positive horizontal component for shallow angles', () => {
    const v = initialVelocity(80, 45, true, 1);
    expect(v.vx).toBeGreaterThan(0);
    expect(v.vy).toBeLessThan(0);
  });

  it('faces left with negative horizontal component', () => {
    const v = initialVelocity(80, 45, false, 1);
    expect(v.vx).toBeLessThan(0);
    expect(v.vy).toBeLessThan(0);
  });

  it('scales magnitude with velocityScale', () => {
    const a = initialVelocity(50, 40, true, 1);
    const b = initialVelocity(50, 40, true, 0.5);
    expect(Math.abs(b.vx)).toBeLessThan(Math.abs(a.vx));
    expect(Math.abs(b.vy)).toBeLessThan(Math.abs(a.vy));
  });
});

describe('simulateShotUntilEnd', () => {
  it('returns ground miss for a shot straight down with no forward velocity', () => {
    const r = simulateShotUntilEnd({
      power: 1,
      angleDeg: 0,
      shooterFacingRight: true,
      velocityScale: 0.01,
      windSpeed: 0,
      windDirection: 'right',
      startX: P1_POS.x,
      startY: P1_POS.y + PROJECTILE_START_Y_OFFSET,
      targetX: P2_POS.x,
      targetY: P2_POS.y
    });
    expect(r.outcome).toBe('miss');
    if (r.outcome === 'miss') expect(r.reason).toBe('ground');
  });

  it('returns offscreen miss when projectile flies past horizontal bounds', () => {
    const r = simulateShotUntilEnd({
      power: 100,
      angleDeg: 5,
      shooterFacingRight: true,
      velocityScale: 3,
      windSpeed: 0,
      windDirection: 'right',
      startX: P1_POS.x,
      startY: P1_POS.y + PROJECTILE_START_Y_OFFSET,
      targetX: P2_POS.x,
      targetY: P2_POS.y
    });
    expect(r.outcome).toBe('miss');
    if (r.outcome === 'miss') expect(r.reason).toBe('offscreen');
  });

  it('registers a hit for the grid-search solution toward the enemy', () => {
    const sol = findBestAim({
      shooterFacingRight: true,
      velocityScale: 0.85,
      windSpeed: 8,
      windDirection: 'right',
      startX: P1_POS.x,
      startY: P1_POS.y + PROJECTILE_START_Y_OFFSET,
      targetX: P2_POS.x,
      targetY: P2_POS.y
    });
    const r = simulateShotUntilEnd({
      power: sol.power,
      angleDeg: sol.angleDeg,
      shooterFacingRight: true,
      velocityScale: 0.85,
      windSpeed: 8,
      windDirection: 'right',
      startX: P1_POS.x,
      startY: P1_POS.y + PROJECTILE_START_Y_OFFSET,
      targetX: P2_POS.x,
      targetY: P2_POS.y
    });
    expect(r.outcome).toBe('hit');
  });
});

describe('computeHitDamage', () => {
  it('is at least 1 for any power', () => {
    expect(computeHitDamage(20, 0)).toBeGreaterThanOrEqual(1);
    expect(computeHitDamage(20, 100)).toBeGreaterThanOrEqual(1);
  });

  it('increases monotonically with power for fixed base damage', () => {
    const base = 24;
    let prev = 0;
    for (let p = 15; p <= 100; p += 5) {
      const d = computeHitDamage(base, p);
      expect(d).toBeGreaterThanOrEqual(prev);
      prev = d;
    }
  });
});

describe('resolveHitZone / computeHitDamageWithZone', () => {
  const tx = 85;
  const ty = 70;

  it('classifies high impacts as head', () => {
    const r = resolveHitZone(tx, ty - 8, tx, ty);
    expect(r.zone).toBe('head');
    expect(r.multiplier).toBeGreaterThan(1);
  });

  it('classifies near-anchor as torso', () => {
    const r = resolveHitZone(tx, ty - 1, tx, ty);
    expect(r.zone).toBe('torso');
    expect(r.multiplier).toBe(1);
  });

  it('classifies low impacts as legs', () => {
    const r = resolveHitZone(tx, ty + 4, tx, ty);
    expect(r.zone).toBe('legs');
    expect(r.multiplier).toBeLessThan(1);
  });

  it('applies head >= torso >= legs for same base and power', () => {
    const base = 22;
    const p = 55;
    const head = computeHitDamageWithZone(base, p, tx, ty - 6, tx, ty);
    const torso = computeHitDamageWithZone(base, p, tx, ty, tx, ty);
    const legs = computeHitDamageWithZone(base, p, tx, ty + 4, tx, ty);
    expect(head).toBeGreaterThanOrEqual(torso);
    expect(torso).toBeGreaterThanOrEqual(legs);
  });

  it('is always at least 1', () => {
    expect(
      computeHitDamageWithZone(5, 10, tx, ty + 10, tx, ty)
    ).toBeGreaterThanOrEqual(1);
  });
});

describe('constants sanity', () => {
  it('keeps playfield bounds consistent', () => {
    expect(OFFSCREEN_X_MIN).toBeLessThan(0);
    expect(OFFSCREEN_X_MAX).toBeGreaterThan(100);
    expect(GROUND_Y).toBeGreaterThan(0);
    expect(GROUND_Y).toBeLessThan(100);
  });
});
