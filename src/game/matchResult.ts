export type MatchWinner = 'player' | 'enemy';
export type MatchMode = 'standard' | 'practice';

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
}

export interface MatchRewardResult {
  coinsAwarded: number;
  xpAwarded: number;
  newRank: number;
}
