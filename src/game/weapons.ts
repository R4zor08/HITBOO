import type { Weapon } from '../types';
import type { HitBowDifficulty } from './difficulty';
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
