import type { MapId } from '../types';
import type { MatchWinner } from './matchResult';

export interface MatchExtendedStats {
  durationSec: number;
  mapId: MapId;
  mapName: string;
  modeLabel: string;
  playerFinalHp: number;
  enemyFinalHp: number;
  biggestHitPlayer: number;
  biggestHitEnemy: number;
  maxStreakPlayer: number;
  maxStreakEnemy: number;
  comeback: MatchWinner | null;
}
