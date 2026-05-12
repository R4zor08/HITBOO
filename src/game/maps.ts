import type { MapDefinition, MapId } from '../types';

export const DEFAULT_MAP_ID: MapId = 'sunset_canyon';

export const MAPS: MapDefinition[] = [
  {
    id: 'sunset_canyon',
    name: 'Sunset Canyon',
    theme: 'Bright valley',
    biome: 'Open grassland',
    previewSrc: '/maps/sunset-canyon.png',
    backgroundSrc: '/maps/sunset-canyon.png',
    overlayTint: 'linear-gradient(180deg, rgba(11,25,52,0.24), rgba(18,32,64,0.12))'
  },
  {
    id: 'raider_outpost',
    name: 'Raider Outpost',
    theme: 'Savage encampment',
    biome: 'Camp battleground',
    previewSrc: '/maps/raider-outpost.png',
    backgroundSrc: '/maps/raider-outpost.png',
    overlayTint: 'linear-gradient(180deg, rgba(25,24,16,0.26), rgba(29,32,22,0.18))',
    windBias: 2,
  },
  {
    id: 'forest_camp',
    name: 'Forest Camp',
    theme: 'Woodland dawn',
    biome: 'Dense woods',
    previewSrc: '/maps/forest-camp.png',
    backgroundSrc: '/maps/forest-camp.png',
    overlayTint: 'linear-gradient(180deg, rgba(7,34,31,0.34), rgba(5,21,17,0.24))'
  },
  {
    id: 'ruined_plains',
    name: 'Ruined Plains',
    theme: 'Ancient relics',
    biome: 'Ancient desert',
    previewSrc: '/maps/ruined-plains.png',
    backgroundSrc: '/maps/ruined-plains.png',
    overlayTint: 'linear-gradient(180deg, rgba(31,20,13,0.28), rgba(36,20,8,0.22))',
    windBias: 1,
  },
  {
    id: 'desert_waste',
    name: 'Desert Waste',
    theme: 'Open badlands',
    biome: 'Arid flats',
    previewSrc: '/maps/desert-waste.png',
    backgroundSrc: '/maps/desert-waste.png',
    overlayTint: 'linear-gradient(180deg, rgba(31,23,18,0.28), rgba(24,16,10,0.18))',
    windBias: 2
  }
];

export function getMapById(id: MapId): MapDefinition {
  const firstMap = MAPS[0];
  if (!firstMap) {
    throw new Error('MAPS must contain at least one map');
  }
  return MAPS.find((m) => m.id === id) ?? firstMap;
}
