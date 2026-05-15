import type { MapId } from '../types';

export type MapFloorTheme = {
  groundLine: string;
  groundBand: string;
  platformFill: string;
  ambientGlow: string;
};

const DEFAULT: MapFloorTheme = {
  groundLine: 'rgba(255,255,255,0.22)',
  groundBand:
    'repeating-linear-gradient(-45deg,rgba(255,255,255,0.08)_0_12px,rgba(255,255,255,0.03)_12px_24px)',
  platformFill: '#251043',
  ambientGlow: 'rgba(0,240,255,0.2)'
};

const BY_MAP: Partial<Record<MapId, Partial<MapFloorTheme>>> = {
  birch_night_glade: {
    ambientGlow: 'rgba(120,180,255,0.22)',
    platformFill: '#1a2848'
  },
  midnight_grove: {
    ambientGlow: 'rgba(140,100,255,0.24)',
    platformFill: '#1e1638'
  },
  cavern_glow: {
    groundLine: 'rgba(255,200,120,0.28)',
    ambientGlow: 'rgba(255,160,80,0.22)',
    platformFill: '#2a1c12'
  },
  golden_canopy: {
    groundLine: 'rgba(255,220,140,0.26)',
    ambientGlow: 'rgba(255,200,80,0.2)',
    platformFill: '#2a2010'
  },
  lakeside_clearing: {
    ambientGlow: 'rgba(0,200,240,0.22)',
    platformFill: '#142a32'
  },
  forest_trail: {
    ambientGlow: 'rgba(80,200,140,0.2)',
    platformFill: '#142818'
  },
  skyline_grove: {
    ambientGlow: 'rgba(100,160,255,0.22)',
    platformFill: '#182438'
  },
  mountain_highway: {
    ambientGlow: 'rgba(180,220,255,0.2)',
    platformFill: '#1a2838'
  },
  alpine_dawn: {
    groundLine: 'rgba(255,210,180,0.24)',
    ambientGlow: 'rgba(255,180,140,0.2)',
    platformFill: '#2a2438'
  },
  pine_ridge_deck: {
    ambientGlow: 'rgba(160,220,255,0.24)',
    platformFill: '#1a2a3a'
  }
};

export function getMapFloorTheme(mapId: MapId): MapFloorTheme {
  const patch = BY_MAP[mapId];
  return patch ? { ...DEFAULT, ...patch } : DEFAULT;
}
