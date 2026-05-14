import type { MapDefinition, MapId } from '../types';

/** Bright default for practice and first-time readability. */
export const DEFAULT_MAP_ID: MapId = 'golden_canopy';

/**
 * Arena art: `public/maps/*.jpg` (user-provided). Order is display order in pickers.
 * Pairing: birch night, cave, railed deck, god-ray forest, lakeside, trail, city view, highway, warm canopy, alpine.
 * `groundYPercent` defaults in physics to 90 when omitted; set per map to align ballistics with painted ground.
 */
export const MAPS: MapDefinition[] = [
  {
    id: 'golden_canopy',
    name: 'Golden Canopy',
    theme: 'Sun-drenched forest',
    biome: 'Warm clearing',
    previewSrc: '/maps/golden-canopy.jpg',
    backgroundSrc: '/maps/golden-canopy.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(42,32,8,0.22), rgba(24,18,6,0.12))',
    groundYPercent: 89.5,
    characterFeetYOffsetFromGroundPercent: 0.35
  },
  {
    id: 'lakeside_clearing',
    name: 'Lakeside Clearing',
    theme: 'Still water',
    biome: 'Forest pond',
    previewSrc: '/maps/lakeside-clearing.jpg',
    backgroundSrc: '/maps/lakeside-clearing.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(10,28,36,0.3), rgba(8,20,28,0.16))',
    groundYPercent: 90
  },
  {
    id: 'skyline_grove',
    name: 'Skyline Grove',
    theme: 'City on the horizon',
    biome: 'Misty woodland',
    previewSrc: '/maps/skyline-grove.jpg',
    backgroundSrc: '/maps/skyline-grove.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(12,24,40,0.28), rgba(16,28,44,0.14))',
    groundYPercent: 89
  },
  {
    id: 'forest_trail',
    name: 'Forest Trail',
    theme: 'Dirt path',
    biome: 'Pine foothills',
    previewSrc: '/maps/forest-trail.jpg',
    backgroundSrc: '/maps/forest-trail.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(8,30,24,0.32), rgba(6,22,18,0.16))',
    groundYPercent: 89
  },
  {
    id: 'alpine_dawn',
    name: 'Alpine Dawn',
    theme: 'Sunrise peaks',
    biome: 'High meadow',
    previewSrc: '/maps/alpine-dawn.jpg',
    backgroundSrc: '/maps/alpine-dawn.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(12,20,44,0.26), rgba(20,28,48,0.12))',
    groundYPercent: 88.5
  },
  {
    id: 'mountain_highway',
    name: 'Mountain Highway',
    theme: 'Road & peaks',
    biome: 'Scenic route',
    previewSrc: '/maps/mountain-highway.jpg',
    backgroundSrc: '/maps/mountain-highway.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(8,22,38,0.32), rgba(10,26,42,0.16))',
    groundYPercent: 88
  },
  {
    id: 'pine_ridge_deck',
    name: 'Pine Ridge Deck',
    theme: 'Railed overlook',
    biome: 'Mountain deck',
    previewSrc: '/maps/pine-ridge-deck.jpg',
    backgroundSrc: '/maps/pine-ridge-deck.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(10,24,40,0.28), rgba(14,28,44,0.14))',
    windBias: 1,
    groundYPercent: 87.5
  },
  {
    id: 'birch_night_glade',
    name: 'Birch Night Glade',
    theme: 'Moonlit woods',
    biome: 'Birch silhouettes',
    previewSrc: '/maps/birch-night-glade.jpg',
    backgroundSrc: '/maps/birch-night-glade.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(8,14,32,0.45), rgba(12,20,40,0.22))',
    groundYPercent: 90
  },
  {
    id: 'cavern_glow',
    name: 'Cavern Glow',
    theme: 'Deep cave',
    biome: 'Stalactite hall',
    previewSrc: '/maps/cavern-glow.jpg',
    backgroundSrc: '/maps/cavern-glow.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(18,12,8,0.38), rgba(28,22,10,0.2))',
    groundYPercent: 91
  },
  {
    id: 'midnight_grove',
    name: 'Midnight Grove',
    theme: 'God rays & fog',
    biome: 'Night forest',
    previewSrc: '/maps/midnight-grove.jpg',
    backgroundSrc: '/maps/midnight-grove.jpg',
    overlayTint: 'linear-gradient(180deg, rgba(18,8,32,0.4), rgba(10,6,24,0.22))',
    groundYPercent: 89.5
  }
];

export function getMapById(id: MapId): MapDefinition {
  const firstMap = MAPS[0];
  if (!firstMap) {
    throw new Error('MAPS must contain at least one map');
  }
  return MAPS.find((m) => m.id === id) ?? firstMap;
}
