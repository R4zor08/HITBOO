import { describe, expect, it } from 'vitest';
import { getMapFloorTheme } from './mapFloorTheme';

describe('getMapFloorTheme', () => {
  it('returns defaults for unknown-safe ids', () => {
    const t = getMapFloorTheme('birch_night_glade');
    expect(t.groundLine).toBeTruthy();
    expect(t.platformFill).toBeTruthy();
  });

  it('warms cavern glow platforms', () => {
    const t = getMapFloorTheme('cavern_glow');
    expect(t.platformFill).toContain('2a');
  });
});
