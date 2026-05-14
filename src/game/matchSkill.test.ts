import { describe, expect, it } from 'vitest';
import { getSkillBehavior } from '../config/skillBehaviorConfig';
import { pickEnemyWeaponId } from './weapons';
import { simulateStep } from './artilleryPhysics';

describe('getSkillBehavior', () => {
  it('grants dual volleys for dual_spear', () => {
    expect(getSkillBehavior('dual_spear').projectileCount).toBe(2);
  });

  it('treats pass_ball as heal with limited uses', () => {
    const b = getSkillBehavior('pass_ball');
    expect(b.kind).toBe('heal');
    expect(b.maxUsesPerMatch).toBe(2);
  });
});

describe('pickEnemyWeaponId', () => {
  it('prefers the first ready weapon in the hard-tier order', () => {
    const now = 500_000;
    const cd = {
      stone_hammer: now + 9000,
      energy_slicer: now + 9000
    };
    expect(pickEnemyWeaponId('hard', cd, now)).toBe('basic_arrow_kit');
  });

  it('returns the top pick when nothing is on cooldown', () => {
    expect(pickEnemyWeaponId('hard', {}, 0)).toBe('stone_hammer');
  });
});

describe('simulateStep', () => {
  it('advances a body when sim is not gated here', () => {
    const next = simulateStep({ x: 10, y: 20, vx: 1, vy: 0.5 }, 0.02);
    expect(next.x).toBeGreaterThan(10);
    expect(next.y).toBeGreaterThan(20);
  });
});
