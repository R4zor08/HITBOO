import type { MatchResult } from './matchResult';
import { STORAGE } from './storageKeys';

export type MatchHistoryEntry = {
  at: string;
  winner: MatchResult['winner'];
  mode: MatchResult['mode'];
  playerAccuracy: number;
  playerDamage: number;
};

const MAX_ENTRIES = 10;

function readRaw(): unknown {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE.matchHistory);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function readMatchHistory(): MatchHistoryEntry[] {
  const raw = readRaw();
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (x): x is MatchHistoryEntry =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as MatchHistoryEntry).at === 'string' &&
        ((x as MatchHistoryEntry).winner === 'player' ||
          (x as MatchHistoryEntry).winner === 'enemy') &&
        ((x as MatchHistoryEntry).mode === 'standard' ||
          (x as MatchHistoryEntry).mode === 'practice')
    )
    .slice(0, MAX_ENTRIES);
}

export function appendMatchHistory(result: MatchResult): void {
  if (typeof window === 'undefined') return;
  if (result.mode === 'local2p') return;
  const entry: MatchHistoryEntry = {
    at: new Date().toISOString(),
    winner: result.winner,
    mode: result.mode,
    playerAccuracy: result.player.accuracy,
    playerDamage: result.player.damage
  };
  const next = [entry, ...readMatchHistory()].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE.matchHistory, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function summarizeHistory(entries: MatchHistoryEntry[]): {
  wins: number;
  losses: number;
  avgAccuracy: number;
} {
  const wins = entries.filter((e) => e.winner === 'player').length;
  const losses = entries.length - wins;
  const avgAccuracy =
    entries.length > 0
      ? entries.reduce((s, e) => s + e.playerAccuracy, 0) / entries.length
      : 0;
  return { wins, losses, avgAccuracy };
}
