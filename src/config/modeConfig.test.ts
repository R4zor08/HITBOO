import { describe, expect, it } from 'vitest';
import {
  getModeGameplayConfig,
  resolveAiCadenceMs
} from './modeConfig';

describe('getModeGameplayConfig', () => {
  it('makes practice AI slower and wind calmer than ranked standard', () => {
    const p = getModeGameplayConfig('practice', 'standard');
    const r = getModeGameplayConfig('standard', 'standard');
    expect(p.aiCadenceMs).toBeGreaterThan(r.aiCadenceMs);
    expect(p.windSpanScale).toBeLessThan(r.windSpanScale);
    expect(p.aiAimErrorScale).toBeGreaterThan(r.aiAimErrorScale);
  });

  it('disables AI cadence for local 2P', () => {
    const l = getModeGameplayConfig('local2p', 'hard');
    expect(l.aiCadenceMs).toBeGreaterThan(900000);
  });

  it('exposes windEffectScale for ranked difficulties', () => {
    const casual = getModeGameplayConfig('standard', 'casual');
    const hard = getModeGameplayConfig('standard', 'hard');
    const mid = getModeGameplayConfig('standard', 'standard');
    expect(casual.windEffectScale).toBeLessThan(mid.windEffectScale);
    expect(hard.windEffectScale).toBeGreaterThan(mid.windEffectScale);
  });

  it('uses softer wind effect in practice than ranked', () => {
    const p = getModeGameplayConfig('practice', 'standard');
    const r = getModeGameplayConfig('standard', 'standard');
    expect(p.windEffectScale).toBeLessThan(r.windEffectScale);
  });

  it('lengthens AI cadence when player HP is very low', () => {
    const c = getModeGameplayConfig('standard', 'standard');
    const comfortable = resolveAiCadenceMs(c, {
      playerHp: 80,
      enemyHp: 80,
      practice: false
    });
    const pressured = resolveAiCadenceMs(c, {
      playerHp: 18,
      enemyHp: 80,
      practice: false
    });
    expect(pressured).toBeGreaterThan(comfortable);
  });

  it('shortens AI cadence when enemy is low HP outside practice', () => {
    const c = getModeGameplayConfig('standard', 'standard');
    const mid = resolveAiCadenceMs(c, {
      playerHp: 80,
      enemyHp: 80,
      practice: false
    });
    const finish = resolveAiCadenceMs(c, {
      playerHp: 80,
      enemyHp: 20,
      practice: false
    });
    expect(finish).toBeLessThan(mid);
  });

  it('does not apply low-HP enemy aggression in practice', () => {
    const c = getModeGameplayConfig('practice', 'standard');
    const a = resolveAiCadenceMs(c, {
      playerHp: 80,
      enemyHp: 80,
      practice: true
    });
    const b = resolveAiCadenceMs(c, {
      playerHp: 80,
      enemyHp: 10,
      practice: true
    });
    expect(b).toBe(a);
  });
});
