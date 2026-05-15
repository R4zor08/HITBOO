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

function connectToDestination(
  ctx: AudioContext,
  node: AudioNode,
  pan?: number
): void {
  if (typeof pan === 'number' && typeof ctx.createStereoPanner === 'function') {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(p);
    p.connect(ctx.destination);
  } else {
    node.connect(ctx.destination);
  }
}

export function playBlip(
  freq: number,
  duration: number,
  muted: boolean,
  pan?: number
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
  connectToDestination(ctx, gain, pan);
  osc.frequency.value = freq;
  osc.type = 'sine';
  const t = ctx.currentTime;
  const peak = 0.08 * masterMultiplier * sfxMultiplier;
  gain.gain.setValueAtTime(Math.max(0.0001, peak), t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

/** Short noise burst — exported for launch whoosh / other layered SFX. */
export function playNoiseBurst(
  duration: number,
  muted: boolean,
  peakScale = 0.06,
  pan?: number
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
  connectToDestination(ctx, gain, pan);
  const t = ctx.currentTime;
  const peak = peakScale * masterMultiplier * sfxMultiplier;
  gain.gain.setValueAtTime(peak, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.start(t);
  src.stop(t + duration);
}

export type ProjectileLaunchOpts = {
  /** -1 = full left, +1 = full right (shooter / screen side). */
  pan?: number;
  /** Charge 0–100; raises pitch slightly at high tiers. */
  powerPct?: number;
};

/** Projectile leaves bow — short rising chirp (placeholder for asset swap). */
export function playProjectileLaunch(
  muted: boolean,
  opts?: ProjectileLaunchOpts
): void {
  const pan = opts?.pan;
  const pct = opts?.powerPct ?? 0;
  const tier = pct >= 90 ? 3 : pct >= 75 ? 2 : pct >= 40 ? 1 : 0;
  const f1 = 540 + tier * 40;
  const f2 = 395 + tier * 30;
  playBlip(f1, 0.042, muted, pan);
  setTimeout(() => playBlip(f2, 0.055, muted, pan), 28);
  setTimeout(
    () => playNoiseBurst(0.048, muted, 0.022 + tier * 0.008, pan),
    10
  );
}

export function playHit(muted: boolean, pan?: number): void {
  playBlip(180, 0.12, muted, pan);
  setTimeout(() => playBlip(90, 0.15, muted, pan), 40);
}

export type HitImpactOpts = {
  pan?: number;
  /** Scales noise layer; typical damage 5–60. */
  damage?: number;
};

/** Stronger impact layer for direct hits (still procedural). */
export function playHitImpact(muted: boolean, opts?: HitImpactOpts): void {
  const pan = opts?.pan;
  const d = opts?.damage ?? 18;
  const noisePeak = Math.min(0.09, 0.032 + d * 0.001);
  playHit(muted, pan);
  playNoiseBurst(0.08, muted, noisePeak, pan);
}

export function playMiss(muted: boolean): void {
  playBlip(120, 0.2, muted);
}

/** Ground / whiff — dull thud placeholder */
export function playMissThud(muted: boolean): void {
  playMiss(muted);
  setTimeout(() => playBlip(55, 0.18, muted), 60);
}

/** Miss flew past arena — lighter, “airy” feedback */
export function playMissOffscreen(muted: boolean): void {
  playBlip(200, 0.075, muted);
  setTimeout(() => playBlip(165, 0.055, muted), 38);
}

/** Sim timeout / rare edge — soft neutral tick */
export function playMissTimeout(muted: boolean): void {
  playBlip(95, 0.1, muted);
  setTimeout(() => playBlip(72, 0.08, muted), 55);
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

/** Placeholder for healing SFX asset swap */
export function playHealChime(muted: boolean): void {
  playBlip(420, 0.08, muted);
  setTimeout(() => playBlip(540, 0.1, muted), 60);
}

export type SfxId =
  | 'hit'
  | 'miss'
  | 'kill'
  | 'shoot'
  | 'button'
  | 'heal'
  | 'pairing'
  | 'versus';

/** Central routing for future banked samples (`public/sfx/...`). */
export function playSfx(id: SfxId, muted: boolean): void {
  if (muted) return;
  switch (id) {
    case 'hit':
      playHitImpact(muted);
      break;
    case 'miss':
      playMissThud(muted);
      break;
    case 'kill':
      playKillSting(muted);
      break;
    case 'shoot':
      playProjectileLaunch(muted);
      break;
    case 'button':
      playUiTick(muted);
      break;
    case 'heal':
      playHealChime(muted);
      break;
    case 'pairing':
      playBlip(300, 0.12, muted);
      break;
    case 'versus':
      playBlip(220, 0.14, muted);
      break;
    default:
      playBlip(400, 0.06, muted);
  }
}
