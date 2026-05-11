export type ScreenState =
  | 'loading'
  | 'menu'
  | 'matchmaking'
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
