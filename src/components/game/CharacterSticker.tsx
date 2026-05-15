import { motion } from 'framer-motion';
import type { CharacterId } from '../../game/charactersCatalog';
import { DEFAULT_PLAYER_CHARACTER_ID, DEFAULT_ENEMY_CHARACTER_ID } from '../../game/charactersCatalog';
import { CHARACTER_SPRITE_BODIES } from '../../game/characterSprites/registry';
import type { PlayerStance } from '../../types';

const SPRITE_STROKE = '#140820';
const ENEMY_GLOW_HEX = '#ff3355';

type Side = 'player' | 'enemy';

type CharacterStickerProps = {
  side: Side;
  characterId: CharacterId | undefined | null;
  x: number;
  y: number;
  accentHex: string;
  hp: number;
  facingRight: boolean;
  reduceMotion: boolean;
  aimPullDeg?: number;
  isCharging?: boolean;
  /** 0–100 while charging; drives tiered weapon glow. */
  chargePowerPct?: number;
  stance?: PlayerStance;
  /** Brief damage feedback (non-dead only). */
  hitTintActive?: boolean;
  /** Brief cartoon knockback on hit (degrees, added to lean). */
  recoilKnockDeg?: number;
  /** Increment on each shot from this sticker to play a Bowmasters-style release pop. */
  launchPulseNonce?: number;
  /** Active turn highlight (idle bob + ring). */
  isActiveTurn?: boolean;
};

export function CharacterSticker({
  side,
  characterId,
  x,
  y,
  accentHex,
  hp,
  facingRight,
  reduceMotion,
  aimPullDeg,
  isCharging = false,
  chargePowerPct = 0,
  stance = 'standing',
  hitTintActive = false,
  recoilKnockDeg = 0,
  launchPulseNonce = 0,
  isActiveTurn = false
}: CharacterStickerProps) {
  const isDead = hp <= 0;

  const id =
    characterId ??
    (side === 'player' ? DEFAULT_PLAYER_CHARACTER_ID : DEFAULT_ENEMY_CHARACTER_ID);

  const Body =
    CHARACTER_SPRITE_BODIES[id] ??
    CHARACTER_SPRITE_BODIES[
      side === 'player' ? DEFAULT_PLAYER_CHARACTER_ID : DEFAULT_ENEMY_CHARACTER_ID
    ];

  const glowTint = side === 'player' ? accentHex : ENEMY_GLOW_HEX;
  const tier =
    chargePowerPct >= 90 ? 3 : chargePowerPct >= 75 ? 2 : chargePowerPct >= 40 ? 1 : 0;
  const chargeBoost =
    isCharging && !reduceMotion ? Math.min(1.62, 1.12 + tier * 0.12 + chargePowerPct * 0.0018) : 1;
  const glowFilter =
    side === 'player'
      ? `drop-shadow(0 4px 0 ${accentHex}55) drop-shadow(0 0 ${10 * chargeBoost}px ${glowTint})`
      : `drop-shadow(0 4px 0 ${ENEMY_GLOW_HEX}88) drop-shadow(0 0 ${
          10 * chargeBoost
        }px ${ENEMY_GLOW_HEX})`;

  const leanDeg =
    aimPullDeg != null && !reduceMotion && !isDead
      ? Math.max(-16, Math.min(16, aimPullDeg * 0.11 * (facingRight ? -1 : 1)))
      : 0;

  /** Rubber-band “pull the bow” squash while charging (Bowmasters-style tension). */
  const bowStretch =
    isCharging && !reduceMotion && !isDead
      ? Math.min(
          1,
          (Math.abs(aimPullDeg ?? 0) / 72) * ((chargePowerPct ?? 0) / 100) * 1.28
        )
      : 0;
  const pullScaleX = 1 + bowStretch * 0.12;
  const pullScaleY = 1 - bowStretch * 0.075;

  const stanceScale =
    stance === 'prone' ? 0.7 : stance === 'crouching' ? 0.82 : 1;
  const stanceYOffset =
    stance === 'jumping' ? -6 : stance === 'prone' ? 2.8 : stance === 'crouching' ? 1.6 : 0;

  const accentForBody =
    isDead || hitTintActive ? '#ff2222' : accentHex;

  const extraFilter =
    isDead
      ? ' saturate(1.35) brightness(0.95)'
      : hitTintActive
        ? ' saturate(1.5) hue-rotate(-12deg) brightness(1.08)'
        : '';

  const leanRad = ((leanDeg + recoilKnockDeg) * Math.PI) / 180;
  const stringX2 =
    50 + Math.sin(leanRad) * (16 + bowStretch * 38) * (facingRight ? 1 : -1);
  const stringY2 = 122 - Math.cos(leanRad) * (10 + bowStretch * 32);

  const pulseKey = `${side}-${launchPulseNonce}`;

  return (
    <motion.div
      className="absolute w-[5.25rem] h-[8rem] flex flex-col items-center justify-end pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y + stanceYOffset}%`,
        transform: `translate(-50%, -100%) ${facingRight ? '' : 'scaleX(-1)'}`,
        filter: `${glowFilter}${extraFilter}`,
        boxShadow: isActiveTurn
          ? `0 0 0 2px ${side === 'player' ? accentHex : ENEMY_GLOW_HEX}66, 0 0 28px ${
              side === 'player' ? `${accentHex}44` : `${ENEMY_GLOW_HEX}55`
            }`
          : undefined,
        borderRadius: '0.75rem'
      }}
      animate={
        isDead
          ? { rotate: facingRight ? 90 : -90, y: 20, opacity: 0.55 }
          : reduceMotion
            ? { y: 0 }
            : isActiveTurn && !isCharging
              ? { y: [0, -2.5, 0] }
              : { y: 0 }
      }
      transition={{
        duration: isDead ? 0.5 : 0.2,
        repeat:
          isDead || reduceMotion || !isActiveTurn || isCharging
            ? 0
            : Infinity,
        repeatType: 'reverse',
        repeatDelay: 0.6,
        ease: 'easeInOut'
      }}>
      <motion.div
        key={pulseKey}
        className="flex h-full w-full flex-col items-center justify-end"
        style={{ transformOrigin: '50% 100%', scale: stanceScale }}
        initial={
          reduceMotion || launchPulseNonce === 0
            ? {
                rotate: leanDeg + recoilKnockDeg,
                scaleX: pullScaleX,
                scaleY: pullScaleY
              }
            : {
                rotate: leanDeg + recoilKnockDeg,
                scaleX: pullScaleX * 1.14,
                scaleY: pullScaleY * 0.86
              }
        }
        animate={{
          rotate: leanDeg + recoilKnockDeg,
          scaleX: pullScaleX,
          scaleY: pullScaleY
        }}
        transition={
          reduceMotion
            ? { type: 'spring', stiffness: 280, damping: 24 }
            : {
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1]
              }
        }>
        <svg viewBox="0 0 100 168" className="h-full w-full overflow-visible">
          {!isDead && bowStretch > 0.06 && !reduceMotion ? (
            <line
              x1={50}
              y1={124}
              x2={stringX2}
              y2={stringY2}
              stroke={side === 'player' ? accentHex : ENEMY_GLOW_HEX}
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={0.45 + bowStretch * 0.38}
            />
          ) : null}
          <Body accentHex={accentForBody} isDead={isDead} stroke={SPRITE_STROKE} />
        </svg>
      </motion.div>
    </motion.div>
  );
}
