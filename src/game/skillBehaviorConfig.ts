/**
 * Per-weapon skill tuning: cooldowns, multi-shot, wind coupling, healing.
 * Gameplay still uses `Weapon` damage/velocity from the catalog; these flags
 * adjust volleys and special rules at fire time.
 */
export interface SkillBehavior {
  /** ms before this weapon can be fired again */
  cooldownMs: number;
  /** Extra simultaneous projectiles after the first (0 = single). */
  extraProjectiles: number;
  /** Per-projectile damage multiplier when extraProjectiles > 0. */
  burstDamageFactor: number;
  /** Slight angle jitter (deg) applied to follow-up burst shots. */
  burstAngleSpreadDeg: number;
  /** ms gap before enqueueing follow-up burst volley. */
  burstDelayMs: number;
  /** Multiplier on horizontal wind acceleration for this shot (1 = default). */
  windAccelScale: number;
  /** If > 0, firing applies self-heal instead of spawning projectiles. */
  healSelfAmount: number;
  /** Max heal activations per match (only when healSelfAmount > 0). */
  healMaxUsesPerMatch: number;
  /** Reserved for future energy / stamina systems. */
  energyCost: number;
}

const DEFAULT: SkillBehavior = {
  cooldownMs: 0,
  extraProjectiles: 0,
  burstDamageFactor: 1,
  burstAngleSpreadDeg: 2.5,
  burstDelayMs: 72,
  windAccelScale: 1,
  healSelfAmount: 0,
  healMaxUsesPerMatch: 0,
  energyCost: 0
};

/** Overrides keyed by `Weapon.id` / catalog id. */
const BY_ID: Record<string, Partial<SkillBehavior>> = {
  basic_arrow_kit: { cooldownMs: 0, energyCost: 0 },
  dual_spear: {
    cooldownMs: 2200,
    extraProjectiles: 1,
    burstDamageFactor: 0.56,
    burstAngleSpreadDeg: 3.2,
    burstDelayMs: 80
  },
  energy_slicer: { cooldownMs: 3400, windAccelScale: 1.05 },
  stone_hammer: { cooldownMs: 5200, windAccelScale: 1.12 },
  pass_ball: { cooldownMs: 2800, windAccelScale: 0.68 },
  sharpened_log: { cooldownMs: 900 },
  steel_shovel: { cooldownMs: 1400 },
  baguette_toss: { cooldownMs: 600 },
  mallow_twist: { cooldownMs: 600 },
  cursed_shovel: { cooldownMs: 3600 },
  kunai_kit: { cooldownMs: 2600 },
  molotov_kit: { cooldownMs: 4800 },
  ring_disc: { cooldownMs: 3000, windAccelScale: 0.62 },
  knight_shortsword: { cooldownMs: 2200 },
  slugger: { cooldownMs: 3200 },
  fancy_arrow_bow: { cooldownMs: 400 },
  nodachi_fan: { cooldownMs: 3800 },
  fire_chopper: { cooldownMs: 4000 },
  gilded_spear: { cooldownMs: 2400 },
  tri_fan: { cooldownMs: 3600 },
  firework_pod: { cooldownMs: 4200 },
  cutter_machete: { cooldownMs: 2800 },
  chain_reaper: { cooldownMs: 5500 },
  tube_launcher: { cooldownMs: 4400 },
  repair_spray: {
    cooldownMs: 8000,
    healSelfAmount: 26,
    healMaxUsesPerMatch: 2,
    energyCost: 0
  }
};

export function getSkillBehavior(weaponId: string): SkillBehavior {
  return { ...DEFAULT, ...(BY_ID[weaponId] ?? {}) };
}
