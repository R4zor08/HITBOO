import type { ProjectileStyle, Weapon } from '../types';

/** Re-use tuned curves instead of tuning every sheet item uniquely. */
export type PhysicsPreset = 'arc_default' | 'arc_light' | 'line_fast' | 'lob_slow';

export const PHYSICS_PRESET: Record<
  PhysicsPreset,
  Pick<Weapon, 'damage' | 'velocityScale'>
> = {
  arc_default: { damage: 18, velocityScale: 0.85 },
  arc_light: { damage: 14, velocityScale: 0.92 },
  line_fast: { damage: 15, velocityScale: 1.08 },
  lob_slow: { damage: 20, velocityScale: 0.72 }
};

export type WeaponCatalogEntry = {
  id: string;
  sheetIndex: number;
  name: string;
  icon: string;
  rarity: Weapon['rarity'];
  projectileStyle: ProjectileStyle;
  physicsPreset: PhysicsPreset;
};

/**
 * Mirrors weapons reference sheet ordering (approx. left-to-right, top-to-bottom).
 */
export const WEAPONS_CATALOG: WeaponCatalogEntry[] = [
  {
    id: 'dual_spear',
    sheetIndex: 1,
    name: 'Dual Spear',
    icon: '🗡️',
    rarity: 'rare',
    projectileStyle: 'dual_spear',
    physicsPreset: 'arc_light'
  },
  {
    id: 'energy_slicer',
    sheetIndex: 2,
    name: 'Energy Sword',
    icon: '⚡',
    rarity: 'epic',
    projectileStyle: 'energy_sword',
    physicsPreset: 'line_fast'
  },
  {
    id: 'stone_hammer',
    sheetIndex: 3,
    name: 'Stone Hammer',
    icon: '🔨',
    rarity: 'rare',
    projectileStyle: 'warhammer',
    physicsPreset: 'lob_slow'
  },
  {
    id: 'pass_ball',
    sheetIndex: 4,
    name: 'Spiral Ball',
    icon: '🏈',
    rarity: 'common',
    projectileStyle: 'football',
    physicsPreset: 'line_fast'
  },
  {
    id: 'sharpened_log',
    sheetIndex: 5,
    name: 'Pointy Log',
    icon: '🪵',
    rarity: 'common',
    projectileStyle: 'sharpened_log',
    physicsPreset: 'arc_light'
  },
  {
    id: 'steel_shovel',
    sheetIndex: 6,
    name: 'Shovel',
    icon: '⛏️',
    rarity: 'common',
    projectileStyle: 'shovel',
    physicsPreset: 'arc_light'
  },
  {
    id: 'basic_arrow_kit',
    sheetIndex: 7,
    name: 'Scout Arrow',
    icon: '🎯',
    rarity: 'common',
    projectileStyle: 'basic_arrow',
    physicsPreset: 'arc_default'
  },
  {
    id: 'baguette_toss',
    sheetIndex: 8,
    name: 'Baguette',
    icon: '🥖',
    rarity: 'common',
    projectileStyle: 'baguette',
    physicsPreset: 'arc_light'
  },
  {
    id: 'mallow_twist',
    sheetIndex: 9,
    name: 'Stick Mallow',
    icon: '🍡',
    rarity: 'common',
    projectileStyle: 'marshmallow_stick',
    physicsPreset: 'arc_light'
  },
  {
    id: 'cursed_shovel',
    sheetIndex: 10,
    name: 'Spooky Shovel',
    icon: '💀',
    rarity: 'epic',
    projectileStyle: 'spooky_shovel',
    physicsPreset: 'arc_default'
  },
  {
    id: 'kunai_kit',
    sheetIndex: 11,
    name: 'Kunai',
    icon: '🗡️',
    rarity: 'rare',
    projectileStyle: 'kunai',
    physicsPreset: 'line_fast'
  },
  {
    id: 'molotov_kit',
    sheetIndex: 12,
    name: 'Molotov',
    icon: '🍾',
    rarity: 'epic',
    projectileStyle: 'molotov',
    physicsPreset: 'lob_slow'
  },
  {
    id: 'ring_disc',
    sheetIndex: 13,
    name: 'Glow Ring',
    icon: '💿',
    rarity: 'rare',
    projectileStyle: 'energy_ring',
    physicsPreset: 'line_fast'
  },
  {
    id: 'knight_shortsword',
    sheetIndex: 14,
    name: 'Short Sword',
    icon: '🗡️',
    rarity: 'common',
    projectileStyle: 'short_sword',
    physicsPreset: 'line_fast'
  },
  {
    id: 'slugger',
    sheetIndex: 15,
    name: 'Slugger Bat',
    icon: '🏏',
    rarity: 'common',
    projectileStyle: 'baseball_bat',
    physicsPreset: 'line_fast'
  },
  {
    id: 'fancy_arrow_bow',
    sheetIndex: 16,
    name: 'Magic Arrow',
    icon: '✨',
    rarity: 'rare',
    projectileStyle: 'fancy_arrow',
    physicsPreset: 'arc_default'
  },
  {
    id: 'nodachi_fan',
    sheetIndex: 17,
    name: 'Royal Katana',
    icon: '🏯',
    rarity: 'epic',
    projectileStyle: 'katana',
    physicsPreset: 'line_fast'
  },
  {
    id: 'fire_chopper',
    sheetIndex: 18,
    name: 'Fire Axe',
    icon: '🪓',
    rarity: 'rare',
    projectileStyle: 'fire_axe',
    physicsPreset: 'arc_light'
  },
  {
    id: 'gilded_spear',
    sheetIndex: 19,
    name: 'Gold Spear',
    icon: '✨',
    rarity: 'legendary',
    projectileStyle: 'magic_spear',
    physicsPreset: 'arc_default'
  },
  {
    id: 'tri_fan',
    sheetIndex: 20,
    name: 'Fan Blade',
    icon: '🌀',
    rarity: 'epic',
    projectileStyle: 'tri_blade',
    physicsPreset: 'line_fast'
  },
  {
    id: 'firework_pod',
    sheetIndex: 21,
    name: 'Firework',
    icon: '🎆',
    rarity: 'rare',
    projectileStyle: 'firework',
    physicsPreset: 'line_fast'
  },
  {
    id: 'cutter_machete',
    sheetIndex: 22,
    name: 'Machete',
    icon: '🔪',
    rarity: 'rare',
    projectileStyle: 'machete',
    physicsPreset: 'line_fast'
  },
  {
    id: 'chain_reaper',
    sheetIndex: 23,
    name: 'Buzz Saw',
    icon: '🪚',
    rarity: 'legendary',
    projectileStyle: 'chainsaw',
    physicsPreset: 'line_fast'
  },
  {
    id: 'tube_launcher',
    sheetIndex: 24,
    name: 'Tube Blaster',
    icon: '🚀',
    rarity: 'epic',
    projectileStyle: 'launcher_bolt',
    physicsPreset: 'line_fast'
  },
  {
    id: 'repair_spray',
    sheetIndex: 25,
    name: 'Repair Spray',
    icon: '💚',
    rarity: 'rare',
    projectileStyle: 'energy_ring',
    physicsPreset: 'arc_light'
  },

  {
    id: 'explosive_fish',
    sheetIndex: 26,
    name: 'Explosive Fish',
    icon: '🐟',
    rarity: 'epic',
    projectileStyle: 'football',
    physicsPreset: 'arc_default'
  },
  {
    id: 'giant_slippers',
    sheetIndex: 27,
    name: 'Giant Slippers',
    icon: '👟',
    rarity: 'rare',
    projectileStyle: 'baseball_bat',
    physicsPreset: 'lob_slow'
  },
  {
    id: 'rocket_frying_pan',
    sheetIndex: 28,
    name: 'Rocket Pan',
    icon: '🍳',
    rarity: 'epic',
    projectileStyle: 'fire_axe',
    physicsPreset: 'line_fast'
  },
  {
    id: 'soda_launcher',
    sheetIndex: 29,
    name: 'Soda Launcher',
    icon: '🥤',
    rarity: 'rare',
    projectileStyle: 'launcher_bolt',
    physicsPreset: 'line_fast'
  },
  {
    id: 'rubber_chicken',
    sheetIndex: 30,
    name: 'Rubber Chicken',
    icon: '🐔',
    rarity: 'common',
    projectileStyle: 'baseball_bat',
    physicsPreset: 'arc_light'
  },
  {
    id: 'disco_ball',
    sheetIndex: 31,
    name: 'Disco Ball',
    icon: '🪩',
    rarity: 'rare',
    projectileStyle: 'energy_ring',
    physicsPreset: 'line_fast'
  },
  {
    id: 'pineapple_bomb',
    sheetIndex: 32,
    name: 'Pineapple Bomb',
    icon: '🍍',
    rarity: 'epic',
    projectileStyle: 'molotov',
    physicsPreset: 'lob_slow'
  },
  {
    id: 'waffle_launcher',
    sheetIndex: 33,
    name: 'Waffle Launcher',
    icon: '🧇',
    rarity: 'rare',
    projectileStyle: 'launcher_bolt',
    physicsPreset: 'arc_default'
  }
];

export function catalogEntryToWeapon(entry: WeaponCatalogEntry): Weapon {
  const physics = PHYSICS_PRESET[entry.physicsPreset];
  return {
    id: entry.id,
    name: entry.name,
    icon: entry.icon,
    rarity: entry.rarity,
    projectileStyle: entry.projectileStyle,
    damage: physics.damage,
    velocityScale: physics.velocityScale
  };
}

export const PLAYABLE_WEAPON_PRESETS: Weapon[] =
  WEAPONS_CATALOG.map(catalogEntryToWeapon);

/** Default arc weapon for first-time players */
export const DEFAULT_WEAPON_ID =
  PLAYABLE_WEAPON_PRESETS.find((w) => w.id === 'fancy_arrow_bow')?.id ??
  PLAYABLE_WEAPON_PRESETS[0]?.id ??
  'fancy_arrow_bow';
