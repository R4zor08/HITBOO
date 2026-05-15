import { describe, expect, it } from 'vitest';
import { getSkillBehavior } from './skillBehaviorConfig';

describe('getSkillBehavior', () => {
  it('gives dual spear a burst and cooldown', () => {
    const b = getSkillBehavior('dual_spear');
    expect(b.extraProjectiles).toBeGreaterThan(0);
    expect(b.cooldownMs).toBeGreaterThan(0);
    expect(b.burstDamageFactor).toBeLessThan(1);
  });

  it('treats scout arrow as spammable', () => {
    const b = getSkillBehavior('basic_arrow_kit');
    expect(b.cooldownMs).toBe(0);
    expect(b.extraProjectiles).toBe(0);
  });

  it('defines repair spray as heal', () => {
    const b = getSkillBehavior('repair_spray');
    expect(b.healSelfAmount).toBeGreaterThan(0);
    expect(b.healMaxUsesPerMatch).toBeGreaterThan(0);
  });
});
