export type HitBowDifficulty = 'casual' | 'standard' | 'hard';

export function coerceHitBowDifficulty(v: unknown): HitBowDifficulty {
  return v === 'casual' || v === 'hard' || v === 'standard' ? v : 'standard';
}
