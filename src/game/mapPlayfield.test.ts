import { describe, expect, it } from 'vitest';
import { getMapWindBias } from './mapPlayfield';

describe('getMapWindBias', () => {
  it('returns 0 for maps without bias', () => {
    expect(getMapWindBias('birch_night_glade')).toBe(0);
  });

  it('returns configured bias for windy maps', () => {
    expect(getMapWindBias('mountain_highway')).toBe(2);
    expect(getMapWindBias('pine_ridge_deck')).toBe(1);
  });
});
