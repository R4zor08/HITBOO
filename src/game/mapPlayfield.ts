import type { MapId } from '../types';
import { getMapById } from './maps';

/** Extra wind speed rolled into each new gust on this map. */
export function getMapWindBias(mapId: MapId): number {
  return getMapById(mapId).windBias ?? 0;
}
