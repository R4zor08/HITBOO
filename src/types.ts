import type { CharacterId } from './game/charactersCatalog';

export type ScreenState =
  | 'loading'
  | 'menu'
  | 'map_select_online'
  | 'map_select_local'
  | 'matchmaking'
  | 'local2p_setup'
  | 'game'
  | 'victory';

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
  mapId: MapId;
}

export type MapId =
  | 'birch_night_glade'
  | 'cavern_glow'
  | 'golden_canopy'
  | 'lakeside_clearing'
  | 'skyline_grove'
  | 'mountain_highway'
  | 'midnight_grove'
  | 'alpine_dawn'
  | 'forest_trail'
  | 'pine_ridge_deck';

export interface MapDefinition {
  id: MapId;
  name: string;
  theme: string;
  biome: string;
  /** Web-served image for card previews. */
  previewSrc: string;
  /** Web-served image used by battlefield backdrop. */
  backgroundSrc: string;
  overlayTint?: string;
  windBias?: number;
  /**
   * Projectile / miss ground plane in arena percent Y (down = larger).
   * Omit to use engine default; tune per map art so hits match the painted floor.
   */
  groundYPercent?: number;
}

export interface TurnTimerConfig {
  durationSec: number;
}

export type PlayerStance = 'standing' | 'jumping' | 'crouching' | 'prone';

export interface PlayerMovementState {
  x: number;
  yOffset: number;
  vy: number;
  grounded: boolean;
  stance: PlayerStance;
}
