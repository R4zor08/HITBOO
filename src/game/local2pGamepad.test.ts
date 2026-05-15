import { describe, expect, it } from 'vitest';
import {
  applyAxisDeadZone,
  applyStickCircularDeadZone,
  detectAnalogTriggerReleasedEdge,
  detectFireButtonReleasedEdge,
  readAnalogTriggerNorm,
  readButtonPressed,
  stickToArenaPointer
} from './local2pGamepad';

describe('applyAxisDeadZone', () => {
  it('zeros values inside dead zone', () => {
    expect(applyAxisDeadZone(0.05, 0.15)).toBe(0);
    expect(applyAxisDeadZone(-0.1, 0.15)).toBe(0);
  });

  it('rescales past dead zone toward ±1', () => {
    expect(applyAxisDeadZone(1, 0.2)).toBeCloseTo(1);
    expect(applyAxisDeadZone(0.6, 0.2)).toBeCloseTo(0.5);
  });
});

describe('applyStickCircularDeadZone', () => {
  it('zeros small vectors', () => {
    const z = applyStickCircularDeadZone(0.05, 0.05, 0.2);
    expect(z.x).toBe(0);
    expect(z.y).toBe(0);
  });

  it('preserves direction for large vectors', () => {
    const { x, y } = applyStickCircularDeadZone(1, 0, 0.1);
    expect(x).toBeGreaterThan(0.9);
    expect(Math.abs(y)).toBeLessThan(0.05);
  });
});

describe('stickToArenaPointer', () => {
  it('offsets pointer from anchor by stick and max deflection', () => {
    const p = stickToArenaPointer({ x: 20, y: 70 }, 1, 0, 10);
    expect(p.x).toBe(30);
    expect(p.y).toBe(70);
  });

  it('negative stickY moves pointer up in arena space', () => {
    const p = stickToArenaPointer({ x: 20, y: 70 }, 0, -1, 10);
    expect(p.x).toBe(20);
    expect(p.y).toBe(60);
  });
});

describe('detectFireButtonReleasedEdge', () => {
  it('fires only on release', () => {
    expect(detectFireButtonReleasedEdge(false, true)).toBe(false);
    expect(detectFireButtonReleasedEdge(true, true)).toBe(false);
    expect(detectFireButtonReleasedEdge(true, false)).toBe(true);
    expect(detectFireButtonReleasedEdge(false, false)).toBe(false);
  });
});

describe('readButtonPressed', () => {
  it('uses pressed or value threshold', () => {
    expect(readButtonPressed(undefined)).toBe(false);
    expect(readButtonPressed({ pressed: false, value: 0 })).toBe(false);
    expect(readButtonPressed({ pressed: true, value: 1 })).toBe(true);
    expect(readButtonPressed({ pressed: false, value: 0.6 })).toBe(true);
  });
});

describe('readAnalogTriggerNorm', () => {
  it('uses value and boosts when pressed', () => {
    expect(readAnalogTriggerNorm(undefined)).toBe(0);
    expect(readAnalogTriggerNorm({ pressed: false, value: 0.35 })).toBeCloseTo(0.35);
    expect(readAnalogTriggerNorm({ pressed: true, value: 0 })).toBe(1);
  });
});

describe('detectAnalogTriggerReleasedEdge', () => {
  it('detects pull then release with hysteresis', () => {
    expect(detectAnalogTriggerReleasedEdge(0, 0)).toBe(false);
    expect(detectAnalogTriggerReleasedEdge(0.25, 0.2)).toBe(false);
    expect(detectAnalogTriggerReleasedEdge(0.25, 0.1)).toBe(true);
  });
});
