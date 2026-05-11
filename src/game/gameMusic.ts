import { getAudioContext } from './gameAudio';

let musicGain: GainNode | null = null;
let oscA: OscillatorNode | null = null;
let oscB: OscillatorNode | null = null;

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
