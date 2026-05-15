import type { MapDefinition, MapId } from '../types';
import { MAP_PUBLIC_FILES } from './mapAssetFiles';

/** First map in roster; used for practice and initial pickers. */
export const DEFAULT_MAP_ID: MapId = 'birch_night_glade';

export const MAPS: MapDefinition[] = [
  {
    id: 'birch_night_glade',
    name: 'Birch Night Glade',
    theme: 'Moonlit silhouettes',
    biome: 'Cold blue forest',
    previewSrc: MAP_PUBLIC_FILES.birch_night_glade,
    backgroundSrc: MAP_PUBLIC_FILES.birch_night_glade,
    overlayTint:
      'linear-gradient(180deg, rgba(6,10,24,0.5), rgba(10,16,32,0.22))'
  },
  {
    id: 'midnight_grove',
    name: 'Midnight Grove',
    theme: 'God rays',
    biome: 'Deep pixel woods',
    previewSrc: MAP_PUBLIC_FILES.midnight_grove,
    backgroundSrc: MAP_PUBLIC_FILES.midnight_grove,
    overlayTint:
      'linear-gradient(180deg, rgba(12,6,28,0.48), rgba(8,4,20,0.2))'
  },
  {
    id: 'cavern_glow',
    name: 'Cavern Glow',
    theme: 'Pale torchlight',
    biome: 'Stalactite hall',
    previewSrc: MAP_PUBLIC_FILES.cavern_glow,
    backgroundSrc: MAP_PUBLIC_FILES.cavern_glow,
    overlayTint:
      'linear-gradient(180deg, rgba(14,10,6,0.42), rgba(22,16,8,0.18))'
  },
  {
    id: 'golden_canopy',
    name: 'Golden Canopy',
    theme: 'Sun-warm leaves',
    biome: 'Enchanted stand',
    previewSrc: MAP_PUBLIC_FILES.golden_canopy,
    backgroundSrc: MAP_PUBLIC_FILES.golden_canopy,
    overlayTint:
      'linear-gradient(180deg, rgba(32,20,6,0.28), rgba(18,12,4,0.12))'
  },
  {
    id: 'lakeside_clearing',
    name: 'Lakeside Clearing',
    theme: 'Glass-still water',
    biome: 'Forest pond',
    previewSrc: MAP_PUBLIC_FILES.lakeside_clearing,
    backgroundSrc: MAP_PUBLIC_FILES.lakeside_clearing,
    overlayTint:
      'linear-gradient(180deg, rgba(8,26,34,0.34), rgba(6,18,26,0.14))'
  },
  {
    id: 'forest_trail',
    name: 'Forest Trail',
    theme: 'Dirt & pines',
    biome: 'Mountain path',
    previewSrc: MAP_PUBLIC_FILES.forest_trail,
    backgroundSrc: MAP_PUBLIC_FILES.forest_trail,
    overlayTint:
      'linear-gradient(180deg, rgba(6,28,22,0.34), rgba(4,20,16,0.14))'
  },
  {
    id: 'skyline_grove',
    name: 'Skyline Grove',
    theme: 'City beyond trees',
    biome: 'Hazy clearing',
    previewSrc: MAP_PUBLIC_FILES.skyline_grove,
    backgroundSrc: MAP_PUBLIC_FILES.skyline_grove,
    overlayTint:
      'linear-gradient(180deg, rgba(10,22,38,0.32), rgba(12,26,40,0.12))'
  },
  {
    id: 'mountain_highway',
    name: 'Mountain Highway',
    theme: 'Open road',
    biome: 'Guardrail pass',
    previewSrc: MAP_PUBLIC_FILES.mountain_highway,
    backgroundSrc: MAP_PUBLIC_FILES.mountain_highway,
    overlayTint:
      'linear-gradient(180deg, rgba(6,20,36,0.36), rgba(8,24,40,0.14))',
    windBias: 2
  },
  {
    id: 'alpine_dawn',
    name: 'Alpine Dawn',
    theme: 'Peach-lit peaks',
    biome: 'High meadow',
    previewSrc: MAP_PUBLIC_FILES.alpine_dawn,
    backgroundSrc: MAP_PUBLIC_FILES.alpine_dawn,
    overlayTint:
      'linear-gradient(180deg, rgba(10,18,40,0.3), rgba(16,24,44,0.1))'
  },
  {
    id: 'pine_ridge_deck',
    name: 'Pine Ridge Deck',
    theme: 'Railed overlook',
    biome: 'Windy crest',
    previewSrc: MAP_PUBLIC_FILES.pine_ridge_deck,
    backgroundSrc: MAP_PUBLIC_FILES.pine_ridge_deck,
    overlayTint:
      'linear-gradient(180deg, rgba(8,22,38,0.32), rgba(12,28,44,0.12))',
    windBias: 1
  }
];

export function getMapById(id: MapId): MapDefinition {
  const firstMap = MAPS[0];
  if (!firstMap) {
    throw new Error('MAPS must contain at least one map');
  }
  return MAPS.find((m) => m.id === id) ?? firstMap;
}
