import type { MatchExtendedStats } from './matchStatsTypes';

export type MatchWinner = 'player' | 'enemy';
export type MatchMode = 'standard' | 'practice' | 'local2p';

export interface MatchSideResult {
  name: string;
  rank: number;
  damage: number;
  shots: number;
  hits: number;
  accuracy: number;
}

export interface MatchResult {
  winner: MatchWinner;
  mode: MatchMode;
  turns: number;
  player: MatchSideResult;
  enemy: MatchSideResult;
  /** Optional richer stats for results / debug */
  extended?: MatchExtendedStats;
}

export interface MatchRewardResult {
  coinsAwarded: number;
  xpAwarded: number;
  newRank: number;
  /** Total XP after this match (for UI without double-counting context). */
  newPlayerXp: number;
  /** Total XP before this match was applied. */
  previousPlayerXp: number;
}
