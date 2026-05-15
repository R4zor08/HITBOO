import { describe, expect, it } from 'vitest';
import { getModeGameplayConfig } from './modeConfig';

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

  it('matches Play Now wind + hit invuln for local 2P (same difficulty)', () => {
    const l = getModeGameplayConfig('local2p', 'standard');
    const r = getModeGameplayConfig('standard', 'standard');
    expect(l.windSpeedCap).toBe(r.windSpeedCap);
    expect(l.windSpanScale).toBe(r.windSpanScale);
    expect(l.windMinBonus).toBe(r.windMinBonus);
    expect(l.hitInvulnerabilityMs).toBe(r.hitInvulnerabilityMs);
  });

  it('caps wind speed per mode', () => {
    expect(getModeGameplayConfig('practice', 'standard').windSpeedCap).toBeLessThan(
      getModeGameplayConfig('standard', 'standard').windSpeedCap
    );
  });
});
