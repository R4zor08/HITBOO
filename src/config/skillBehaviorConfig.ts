/**
 * Gameplay layer on top of catalog {@link Weapon} — cooldowns, multi-shot, heal, wind coupling.
 * Keyed by weapon `id` from `weaponsCatalog`. Omitted ids use defaults.
 */
export type SkillBehaviorKind = 'projectile' | 'heal';

export interface SkillBehaviorConfig {
  kind: SkillBehaviorKind;
  cooldownMs: number;
  maxUsesPerMatch?: number;
  projectileCount: number;
  perProjectileDamageMultiplier: number;
  /** Multiplies wind acceleration for this shot only (1 = normal, <1 = steadier). */
  windEffectOnProjectile: number;
  velocityScaleMultiplier: number;
  /** Multiplies simulation gravity for this shot (heavier arc when >1). */
  gravityScaleMultiplier: number;
  healAmount?: number;
}

const DEFAULTS: SkillBehaviorConfig = {
  kind: 'projectile',
  cooldownMs: 0,
  projectileCount: 1,
  perProjectileDamageMultiplier: 1,
  windEffectOnProjectile: 1,
  velocityScaleMultiplier: 1,
  gravityScaleMultiplier: 1
};

const OVERRIDES: Partial<Record<string, Partial<SkillBehaviorConfig>>> = {
  dual_spear: {
    cooldownMs: 2400,
    projectileCount: 2,
    perProjectileDamageMultiplier: 0.58,
    windEffectOnProjectile: 1,
    velocityScaleMultiplier: 1,
    gravityScaleMultiplier: 1
  },
  energy_slicer: {
    cooldownMs: 1900,
    projectileCount: 1,
    perProjectileDamageMultiplier: 1,
    windEffectOnProjectile: 0.92,
    velocityScaleMultiplier: 1.02,
    gravityScaleMultiplier: 0.96
  },
  stone_hammer: {
    cooldownMs: 3400,
    projectileCount: 1,
    perProjectileDamageMultiplier: 1.12,
    windEffectOnProjectile: 1.08,
    velocityScaleMultiplier: 0.94,
    gravityScaleMultiplier: 1.14
  },
  pass_ball: {
    kind: 'heal',
    cooldownMs: 5200,
    maxUsesPerMatch: 2,
    projectileCount: 0,
    perProjectileDamageMultiplier: 0,
    windEffectOnProjectile: 1,
    velocityScaleMultiplier: 1,
    gravityScaleMultiplier: 1,
    healAmount: 24
  },
  sharpened_log: {
    cooldownMs: 800,
    projectileCount: 1,
    perProjectileDamageMultiplier: 1,
    windEffectOnProjectile: 1,
    velocityScaleMultiplier: 1,
    gravityScaleMultiplier: 1
  },
  basic_arrow_kit: {
    cooldownMs: 0,
    projectileCount: 1,
    perProjectileDamageMultiplier: 1,
    windEffectOnProjectile: 1,
    velocityScaleMultiplier: 1,
    gravityScaleMultiplier: 1
  }
};

export function getSkillBehavior(weaponId: string): SkillBehaviorConfig {
  const o = OVERRIDES[weaponId];
  if (!o) return { ...DEFAULTS };
  return {
    ...DEFAULTS,
    ...o,
    kind: o.kind ?? DEFAULTS.kind,
    projectileCount: o.projectileCount ?? DEFAULTS.projectileCount,
    perProjectileDamageMultiplier:
      o.perProjectileDamageMultiplier ?? DEFAULTS.perProjectileDamageMultiplier,
    windEffectOnProjectile:
      o.windEffectOnProjectile ?? DEFAULTS.windEffectOnProjectile,
    velocityScaleMultiplier:
      o.velocityScaleMultiplier ?? DEFAULTS.velocityScaleMultiplier,
    gravityScaleMultiplier:
      o.gravityScaleMultiplier ?? DEFAULTS.gravityScaleMultiplier,
    cooldownMs: o.cooldownMs ?? DEFAULTS.cooldownMs
  };
}
