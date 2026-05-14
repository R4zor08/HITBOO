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

function playNoiseBurst(
  duration: number,
  muted: boolean,
  peakScale = 0.06
): void {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx || ctx.state === 'suspended') {
    void ctx?.resume();
  }
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  src.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime;
  const peak = peakScale * masterMultiplier * sfxMultiplier;
  gain.gain.setValueAtTime(peak, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.start(t);
  src.stop(t + duration);
}

/** Projectile leaves bow — short rising chirp (placeholder for asset swap). */
export function playProjectileLaunch(muted: boolean): void {
  playBlip(520, 0.05, muted);
  setTimeout(() => playBlip(380, 0.06, muted), 35);
}

export function playHit(muted: boolean): void {
  playBlip(180, 0.12, muted);
  setTimeout(() => playBlip(90, 0.15, muted), 40);
}

/** Stronger impact layer for direct hits (still procedural). */
export function playHitImpact(muted: boolean): void {
  playHit(muted);
  playNoiseBurst(0.08, muted, 0.045);
}

export function playMiss(muted: boolean): void {
  playBlip(120, 0.2, muted);
}

/** Ground / whiff — dull thud placeholder */
export function playMissThud(muted: boolean): void {
  playMiss(muted);
  setTimeout(() => playBlip(55, 0.18, muted), 60);
}

/** Match end sting — placeholder for victory/defeat sting asset */
export function playKillSting(muted: boolean): void {
  playBlip(140, 0.22, muted);
  setTimeout(() => playBlip(70, 0.35, muted), 120);
  setTimeout(() => playBlip(220, 0.2, muted), 280);
}

export function playUiTick(muted: boolean): void {
  playBlip(660, 0.04, muted);
}

export type SfxKey =
  | 'hit'
  | 'miss'
  | 'launch'
  | 'kill'
  | 'pairing'
  | 'vs_reveal'
  | 'heal'
  | 'ui_tick'
  | 'near_miss'
  | 'big_hit';

/** Central dispatch for HUD / future asset-backed cues. */
export function playSfx(name: SfxKey, muted: boolean): void {
  switch (name) {
    case 'launch':
      playProjectileLaunch(muted);
      return;
    case 'hit':
      playHitImpact(muted);
      return;
    case 'miss':
      playMissThud(muted);
      return;
    case 'kill':
      playKillSting(muted);
      return;
    case 'ui_tick':
      playUiTick(muted);
      return;
    case 'heal':
      playBlip(740, 0.08, muted);
      setTimeout(() => playBlip(620, 0.06, muted), 45);
      return;
    case 'near_miss':
      playBlip(420, 0.05, muted);
      setTimeout(() => playBlip(300, 0.06, muted), 40);
      return;
    case 'big_hit':
      playBlip(160, 0.1, muted);
      playNoiseBurst(0.1, muted, 0.07);
      setTimeout(() => playBlip(90, 0.14, muted), 50);
      return;
    case 'pairing':
    case 'vs_reveal':
      return;
    default:
      return;
  }
}
