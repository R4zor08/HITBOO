import type { Weapon } from '../types';
import { PLAYABLE_WEAPON_PRESETS, WEAPONS_CATALOG, catalogEntryToWeapon } from './weaponsCatalog';

/** Full sheet-backed loadout presets (balanced via physics tiers in catalog). */
export const WEAPON_PRESETS = PLAYABLE_WEAPON_PRESETS;

const enemyEntry =
  WEAPONS_CATALOG.find((e) => e.id === 'basic_arrow_kit') ?? WEAPONS_CATALOG[0];
if (!enemyEntry) {
  throw new Error('WEAPONS_CATALOG empty');
}

export const ENEMY_WEAPON: Weapon = catalogEntryToWeapon(enemyEntry);
