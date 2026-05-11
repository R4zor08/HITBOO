let audioCtx: AudioContext | null = null;

/** 0–1 multipliers applied to oscillator gain. */
let masterMultiplier = 1;
let sfxMultiplier = 1;

export function setAudioLevels(opts: {
  master?: number;
  sfx?: number;
}): void {
  if (typeof opts.master === 'number') {
    masterMultiplier = Math.max(0, Math.min(1, opts.master));
  }
  if (typeof opts.sfx === 'number') {
    sfxMultiplier = Math.max(0, Math.min(1, opts.sfx));
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Shared context for optional ambient layer (see `gameMusic.ts`). */
export function getAudioContext(): AudioContext | null {
  return getCtx();
}

export function playBlip(
  freq: number,
  duration: number,
  muted: boolean
): void {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx || ctx.state === 'suspended') {
    void ctx?.resume();
  }
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  const t = ctx.currentTime;
  const peak = 0.08 * masterMultiplier * sfxMultiplier;
  gain.gain.setValueAtTime(Math.max(0.0001, peak), t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

export function playHit(muted: boolean): void {
  playBlip(180, 0.12, muted);
  setTimeout(() => playBlip(90, 0.15, muted), 40);
}

export function playMiss(muted: boolean): void {
  playBlip(120, 0.2, muted);
}
