export type ShopItem = {
  id: string;
  name: string;
  price: number;
  icon: string;
  type: 'cosmetic';
  /** Accent for projectile / character (hex) */
  accentHex: string;
};

export const SHOP_CATALOG: ShopItem[] = [
  {
    id: 'skin_cyan',
    name: 'Neon Cyan',
    price: 500,
    icon: '💠',
    type: 'cosmetic',
    accentHex: '#00f0ff'
  },
  {
    id: 'skin_gold',
    name: 'Golden Arrow',
    price: 1200,
    icon: '🏆',
    type: 'cosmetic',
    accentHex: '#ffea00'
  },
  {
    id: 'skin_lime',
    name: 'Toxic Lime',
    price: 800,
    icon: '☢️',
    type: 'cosmetic',
    accentHex: '#b7ff00'
  },
  {
    id: 'skin_magenta',
    name: 'Plasma Pink',
    price: 900,
    icon: '💗',
    type: 'cosmetic',
    accentHex: '#ff00e5'
  },
  {
    id: 'skin_crimson',
    name: 'Crimson Blaze',
    price: 600,
    icon: '🔥',
    type: 'cosmetic',
    accentHex: '#ff3b3b'
  },
  {
    id: 'skin_violet',
    name: 'Void Violet',
    price: 1000,
    icon: '💜',
    type: 'cosmetic',
    accentHex: '#9d00ff'
  },
  {
    id: 'skin_ice',
    name: 'Arctic Ice',
    price: 750,
    icon: '❄️',
    type: 'cosmetic',
    accentHex: '#a0f4ff'
  },
  {
    id: 'skin_solar',
    name: 'Solar Flare',
    price: 1500,
    icon: '⭐',
    type: 'cosmetic',
    accentHex: '#ffaa00'
  }
];

export const DEFAULT_PLAYER_ACCENT = '#00f0ff';
