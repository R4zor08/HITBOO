import { describe, expect, it } from 'vitest';
import { summarizeHistory, type MatchHistoryEntry } from './matchHistory';

describe('summarizeHistory', () => {
  it('counts wins and losses', () => {
    const entries: MatchHistoryEntry[] = [
      {
        at: '1',
        winner: 'player',
        mode: 'standard',
        playerAccuracy: 80,
        playerDamage: 100
      },
      {
        at: '2',
        winner: 'enemy',
        mode: 'standard',
        playerAccuracy: 20,
        playerDamage: 10
      },
      {
        at: '3',
        winner: 'player',
        mode: 'practice',
        playerAccuracy: 60,
        playerDamage: 50
      }
    ];
    const s = summarizeHistory(entries);
    expect(s.wins).toBe(2);
    expect(s.losses).toBe(1);
    expect(s.avgAccuracy).toBeCloseTo((80 + 20 + 60) / 3, 5);
  });

  it('handles empty list', () => {
    const s = summarizeHistory([]);
    expect(s.wins).toBe(0);
    expect(s.losses).toBe(0);
    expect(s.avgAccuracy).toBe(0);
  });
});
