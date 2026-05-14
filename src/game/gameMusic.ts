import { getAudioContext } from './gameAudio';

let musicGain: GainNode | null = null;
let oscA: OscillatorNode | null = null;
let oscB: OscillatorNode | null = null;
let musicLevel = 0;

function stopNodes() {
  try {
    oscA?.stop();
    oscB?.stop();
  } catch {
    /* already stopped */
  }
  oscA = null;
  oscB = null;
  musicGain = null;
  musicLevel = 0;
}

/**
 * Very light procedural pad (no external asset). Respects master × music volume.
 */
export function syncGameMusic(opts: {
  enabled: boolean;
  musicVolume: number;
  masterVolume: number;
}) {
  const ctx = getAudioContext();
  const level =
    opts.enabled && opts.musicVolume > 0.001 && opts.masterVolume > 0.001
      ? Math.min(1, opts.musicVolume * opts.masterVolume) * 0.04
      : 0;

  if (!ctx || level < 0.0005) {
    stopNodes();
    return;
  }

  musicLevel = level;

  void ctx.resume();

  if (!musicGain || !oscA) {
    stopNodes();
    musicGain = ctx.createGain();
    musicGain.gain.value = level;

    oscA = ctx.createOscillator();
    oscA.type = 'triangle';
    oscA.frequency.value = 98;

    oscB = ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.value = 147;

    oscA.connect(musicGain);
    oscB.connect(musicGain);
    musicGain.connect(ctx.destination);

    oscA.start();
    oscB.start();
  } else {
    musicGain.gain.setTargetAtTime(level, ctx.currentTime, 0.08);
  }
}

/** Brief dip in pad volume on big moments (e.g. hit). No-op if music off. */
export function duckGameMusic(opts: {
  factor?: number;
  holdMs?: number;
}): void {
  const ctx = getAudioContext();
  if (!musicGain || !ctx || musicLevel < 0.0005) return;
  const factor = Math.min(0.85, Math.max(0.15, opts.factor ?? 0.38));
  const hold = (opts.holdMs ?? 220) / 1000;
  const now = ctx.currentTime;
  const target = musicLevel * (1 - factor);
  try {
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(target, now + 0.05);
    musicGain.gain.linearRampToValueAtTime(musicLevel, now + 0.05 + hold);
  } catch {
    /* ignore */
  }
}
