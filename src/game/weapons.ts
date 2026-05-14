import type { Weapon } from '../types';
import type { HitBowDifficulty } from './difficulty';
import { getSkillBehavior } from '../config/skillBehaviorConfig';
import { PLAYABLE_WEAPON_PRESETS, WEAPONS_CATALOG, catalogEntryToWeapon } from './weaponsCatalog';

/** Full sheet-backed loadout presets (balanced via physics tiers in catalog). */
export const WEAPON_PRESETS = PLAYABLE_WEAPON_PRESETS;

function catalogWeaponOrFallback(id: string): Weapon {
  const entry =
    WEAPONS_CATALOG.find((e) => e.id === id) ??
    WEAPONS_CATALOG.find((e) => e.id === 'basic_arrow_kit') ??
    WEAPONS_CATALOG[0];
  if (!entry) {
    throw new Error('WEAPONS_CATALOG empty');
  }
  return catalogEntryToWeapon(entry);
}

/** Resolve a playable or catalog weapon by id (for runtime loadout / AI picks). */
export function getWeaponById(id: string): Weapon {
  return WEAPON_PRESETS.find((w) => w.id === id) ?? catalogWeaponOrFallback(id);
}

/**
 * Offline AI weapon pick: prefers tier-appropriate weapons, falls back when the
 * preferred choice is still on skill cooldown.
 */
export function pickEnemyWeaponId(
  tier: HitBowDifficulty,
  cooldownUntilById: Record<string, number>,
  now: number
): string {
  const order: string[] =
    tier === 'hard'
      ? ['stone_hammer', 'energy_slicer', 'basic_arrow_kit', 'sharpened_log']
      : tier === 'casual'
        ? ['sharpened_log', 'basic_arrow_kit', 'stone_hammer']
        : ['basic_arrow_kit', 'sharpened_log', 'stone_hammer'];
  for (const id of order) {
    const cdMs = getSkillBehavior(id).cooldownMs;
    if (cdMs <= 0 || now >= (cooldownUntilById[id] ?? 0)) return id;
  }
  return order[0] ?? 'basic_arrow_kit';
}

/** Enemy loadout by match difficulty (casual = lighter kit, hard = heavier). */
export function getEnemyWeapon(tier: HitBowDifficulty): Weapon {
  const id =
    tier === 'casual'
      ? 'sharpened_log'
      : tier === 'hard'
        ? 'stone_hammer'
        : 'basic_arrow_kit';
  return catalogWeaponOrFallback(id);
}

/** Default standard-tier enemy weapon (legacy export). */
export const ENEMY_WEAPON: Weapon = getEnemyWeapon('standard');
