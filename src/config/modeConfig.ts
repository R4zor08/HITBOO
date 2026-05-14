import type { HitBowDifficulty } from '../game/difficulty';

export type GameModeKey = 'standard' | 'practice' | 'local2p';

/** Tunables per match mode + difficulty (ranked uses `standard` + tier). */
export interface ModeGameplayConfig {
  /** ms between AI volleys after a shot resolves */
  aiCadenceMs: number;
  /** Hard clamp for dynamic cadence adjustments */
  aiCadenceMinMs: number;
  aiCadenceMaxMs: number;
  /** Extra delay when player is very low HP (fairness) */
  aiBreathingRoomMs: number;
  /** Shorter delay when enemy is low HP (pressure) — skipped in practice */
  aiEnemyLowHpAggressionMs: number;
  /** 1 = AI respects wind fully in aim; lower adds extra aim scatter vs wind */
  aiWindReadiness: number;
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
  /** Multiplies wind acceleration on projectiles (feel vs volatility). */
  windEffectScale: number;
}

function rankedBase(difficulty: HitBowDifficulty): ModeGameplayConfig {
  const tierCadence =
    difficulty === 'casual' ? 3000 : difficulty === 'hard' ? 2100 : 2500;
  const tierError =
    difficulty === 'casual' ? 1.15 : difficulty === 'hard' ? 0.82 : 1;
  const tierWind =
    difficulty === 'casual' ? 0.85 : difficulty === 'hard' ? 1.2 : 1;
  const windReady =
    difficulty === 'casual' ? 0.78 : difficulty === 'hard' ? 0.96 : 0.88;
  return {
    aiCadenceMs: tierCadence,
    aiCadenceMinMs: Math.round(tierCadence * 0.72),
    aiCadenceMaxMs: Math.round(tierCadence * 1.35),
    aiBreathingRoomMs: 380,
    aiEnemyLowHpAggressionMs: 280,
    aiWindReadiness: windReady,
    aiInitialDelayMs: 2000,
    aiAimErrorScale: tierError,
    windSpanScale: tierWind,
    windMinBonus: 0,
    hitInvulnerabilityMs: 420,
    windEffectScale:
      difficulty === 'casual' ? 0.9 : difficulty === 'hard' ? 1.12 : 1
  };
}

/** Dynamic AI volley delay: pressure when enemy is low, breathing room when player is low. */
export function resolveAiCadenceMs(
  config: ModeGameplayConfig,
  opts: { playerHp: number; enemyHp: number; practice: boolean }
): number {
  let ms = config.aiCadenceMs;
  if (opts.playerHp <= 25) {
    ms += config.aiBreathingRoomMs;
  }
  if (!opts.practice && opts.enemyHp <= 32 && opts.enemyHp > 0) {
    ms -= config.aiEnemyLowHpAggressionMs;
  }
  return Math.max(
    config.aiCadenceMinMs,
    Math.min(config.aiCadenceMaxMs, Math.round(ms))
  );
}

export function getModeGameplayConfig(
  gameMode: GameModeKey,
  difficulty: HitBowDifficulty
): ModeGameplayConfig {
  if (gameMode === 'practice') {
    return {
      aiCadenceMs: 4200,
      aiCadenceMinMs: 2800,
      aiCadenceMaxMs: 6200,
      aiBreathingRoomMs: 520,
      aiEnemyLowHpAggressionMs: 0,
      aiWindReadiness: 0.72,
      aiInitialDelayMs: 3200,
      aiAimErrorScale: 1.45,
      windSpanScale: 0.72,
      windMinBonus: -1,
      hitInvulnerabilityMs: 520,
      windEffectScale: 0.86
    };
  }
  if (gameMode === 'local2p') {
    return {
      aiCadenceMs: 999999,
      aiCadenceMinMs: 999999,
      aiCadenceMaxMs: 999999,
      aiBreathingRoomMs: 0,
      aiEnemyLowHpAggressionMs: 0,
      aiWindReadiness: 1,
      aiInitialDelayMs: 999999,
      aiAimErrorScale: 1,
      windSpanScale: 1,
      windMinBonus: 0,
      hitInvulnerabilityMs: 450,
      windEffectScale: 1
    };
  }
  return rankedBase(difficulty);
}
