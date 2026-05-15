import type { CharacterId } from './game/charactersCatalog';

export type ScreenState =
  | 'loading'
  | 'menu'
  | 'map_select'
  | 'matchmaking'
  | 'local2p_setup'
  | 'game'
  | 'victory';

/** Arena ids aligned with `public/maps/*` and `game/maps.ts`. */
export type MapId =
  | 'birch_night_glade'
  | 'midnight_grove'
  | 'cavern_glow'
  | 'golden_canopy'
  | 'lakeside_clearing'
  | 'forest_trail'
  | 'skyline_grove'
  | 'mountain_highway'
  | 'alpine_dawn'
  | 'pine_ridge_deck';

export interface MapDefinition {
  id: MapId;
  name: string;
  theme: string;
  biome: string;
  previewSrc: string;
  backgroundSrc: string;
  overlayTint: string;
  /** Extra average wind speed on this map (0–3 typical). */
  windBias?: number;
}

/** Character pose for sticker lean / charge feedback. */
export type PlayerStance = 'standing' | 'crouching' | 'prone' | 'jumping';

/** Throwable visuals aligned to public/art/weapons-ref.png (+ launcher). */
export type ProjectileStyle =
  | 'dual_spear'
  | 'energy_sword'
  | 'warhammer'
  | 'football'
  | 'sharpened_log'
  | 'shovel'
  | 'basic_arrow'
  | 'baguette'
  | 'marshmallow_stick'
  | 'spooky_shovel'
  | 'kunai'
  | 'molotov'
  | 'energy_ring'
  | 'short_sword'
  | 'baseball_bat'
  | 'fancy_arrow'
  | 'katana'
  | 'fire_axe'
  | 'magic_spear'
  | 'tri_blade'
  | 'firework'
  | 'machete'
  | 'chainsaw'
  | 'launcher_bolt';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  hp: number;
  maxHp: number;
  rank: number;
  coins: number;
  color: string;
}

export interface Weapon {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  damage: number;
  /** Multiplier on launch speed (higher = flatter / faster). */
  velocityScale: number;
  projectileStyle: ProjectileStyle;
}

/** Session-only loadout for Local 2 players (hot-seat); not persisted. */
export interface Local2pLoadout {
  p1CharacterId: CharacterId;
  p1WeaponId: string;
  p2CharacterId: CharacterId;
  p2WeaponId: string;
}
