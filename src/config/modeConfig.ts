import type { HitBowDifficulty } from '../game/difficulty';

export type GameModeKey = 'standard' | 'practice' | 'local2p';

/** Tunables per match mode + difficulty (ranked uses `standard` + tier). */
export interface ModeGameplayConfig {
  /** ms between AI volleys after a shot resolves */
  aiCadenceMs: number;
  /** ms before first AI shot */
  aiInitialDelayMs: number;
  /** Multiplier on base aim error (power/angle σ) */
  aiAimErrorScale: number;
  /** Scales random wind span (after tier base) */
  windSpanScale: number;
  /** Added to wind minimum before random span */
  windMinBonus: number;
  /** Defender invulnerability after taking damage (ms) */
  hitInvulnerabilityMs: number;
  /** Upper cap on rolled wind speed (HUD units). */
  windSpeedCap: number;
}

function rankedBase(difficulty: HitBowDifficulty): Omit<ModeGameplayConfig, never> {
  const tierCadence =
    difficulty === 'casual' ? 3000 : difficulty === 'hard' ? 2100 : 2500;
  const tierError =
    difficulty === 'casual' ? 1.15 : difficulty === 'hard' ? 0.82 : 1;
  const tierWind =
    difficulty === 'casual' ? 0.85 : difficulty === 'hard' ? 1.2 : 1;
  return {
    aiCadenceMs: tierCadence,
    aiInitialDelayMs: 2000,
    aiAimErrorScale: tierError,
    windSpanScale: tierWind,
    windMinBonus: 0,
    hitInvulnerabilityMs: 420,
    windSpeedCap: 22
  };
}

export function getModeGameplayConfig(
  gameMode: GameModeKey,
  difficulty: HitBowDifficulty
): ModeGameplayConfig {
  if (gameMode === 'practice') {
    return {
      aiCadenceMs: 4200,
      aiInitialDelayMs: 3200,
      aiAimErrorScale: 1.45,
      windSpanScale: 0.72,
      windMinBonus: -1,
      hitInvulnerabilityMs: 520,
      windSpeedCap: 15
    };
  }
  if (gameMode === 'local2p') {
    const ranked = rankedBase(difficulty);
    return {
      ...ranked,
      /** No AI in couch mode; keep other tunables identical to Play Now (`standard`). */
      aiCadenceMs: 999999,
      aiInitialDelayMs: 999999
    };
  }
  return rankedBase(difficulty);
}
