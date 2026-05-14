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
  stance?: PlayerStance;
  /** Brief damage feedback (non-dead only). */
  hitTintActive?: boolean;
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
  stance = 'standing',
  hitTintActive = false
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
  const chargeBoost = isCharging && !reduceMotion ? 1.35 : 1;
  const glowFilter =
    side === 'player'
      ? `drop-shadow(0 0 1.5px rgba(255,255,255,0.45)) drop-shadow(0 4px 0 ${accentHex}55) drop-shadow(0 0 ${10 * chargeBoost}px ${glowTint})`
      : `drop-shadow(0 0 1.5px rgba(255,255,255,0.35)) drop-shadow(0 4px 0 ${ENEMY_GLOW_HEX}88) drop-shadow(0 0 ${
          10 * chargeBoost
        }px ${ENEMY_GLOW_HEX})`;

  const leanDeg =
    aimPullDeg != null && !reduceMotion && !isDead
      ? Math.max(-16, Math.min(16, aimPullDeg * 0.11 * (facingRight ? -1 : 1)))
      : 0;

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

  return (
    <motion.div
      className="absolute w-[5.25rem] h-[8rem] flex flex-col items-center justify-end pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y + stanceYOffset}%`,
        transform: `translate(-50%, -100%) ${facingRight ? '' : 'scaleX(-1)'}`,
        filter: `${glowFilter}${extraFilter}`
      }}
      animate={
        isDead
          ? { rotate: facingRight ? 90 : -90, y: 20, opacity: 0.55 }
          : reduceMotion
            ? { y: 0 }
            : { y: 0 }
      }
      transition={{
        duration: isDead ? 0.5 : 0.2,
        repeat: 0
      }}>
      {!isDead ? (
        <div
          className="pointer-events-none absolute left-1/2 top-full z-0 h-3 w-10 -translate-x-1/2 -translate-y-[120%] rounded-full bg-black/35 blur-sm"
          aria-hidden
        />
      ) : null}
      <motion.div
        className="flex h-full w-full flex-col items-center justify-end"
        style={{ transformOrigin: '50% 100%', scale: stanceScale }}
        animate={{ rotate: leanDeg }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
        <svg viewBox="0 0 100 168" className="h-full w-full overflow-visible">
          <Body accentHex={accentForBody} isDead={isDead} stroke={SPRITE_STROKE} />
        </svg>
      </motion.div>
    </motion.div>
  );
}
