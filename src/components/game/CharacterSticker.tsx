import React from 'react';
import { motion } from 'framer-motion';
import type { CharacterId } from '../../game/charactersCatalog';
import { DEFAULT_PLAYER_CHARACTER_ID, DEFAULT_ENEMY_CHARACTER_ID } from '../../game/charactersCatalog';
import { CHARACTER_SPRITE_BODIES } from '../../game/characterSprites/registry';

const SPRITE_STROKE = '#140820';
const ENEMY_GLOW_HEX = '#ff3355';

type Side = 'player' | 'enemy';

type CharacterStickerProps = {
  /** Which fighter role (glow differs). */
  side: Side;
  characterId: CharacterId | undefined | null;
  x: number;
  y: number;
  accentHex: string;
  isTurn: boolean;
  hp: number;
  facingRight: boolean;
  reduceMotion: boolean;
};

export function CharacterSticker({
  side,
  characterId,
  x,
  y,
  accentHex,
  isTurn,
  hp,
  facingRight,
  reduceMotion
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
  const glowFilter =
    side === 'player'
      ? `drop-shadow(0 4px 0 ${accentHex}55) drop-shadow(0 0 10px ${glowTint})`
      : `drop-shadow(0 4px 0 ${ENEMY_GLOW_HEX}88) drop-shadow(0 0 10px ${ENEMY_GLOW_HEX})`;

  return (
    <motion.div
      className="absolute w-[5.25rem] h-[8rem] flex flex-col items-center justify-end pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -100%) ${facingRight ? '' : 'scaleX(-1)'}`,
        filter: glowFilter
      }}
      animate={
        isDead
          ? { rotate: facingRight ? 90 : -90, y: 20, opacity: 0.45 }
          : reduceMotion
            ? { y: 0 }
            : { y: isTurn ? [-3, 3, -3] : 0 }
      }
      transition={{
        duration: isDead ? 0.5 : 2,
        repeat: isDead || reduceMotion ? 0 : Infinity
      }}>
      {isTurn && !isDead && (
        <motion.div
          className="absolute -top-6 w-4 h-4 border-t-[3px] border-l-[3px] border-white rounded-tl-md rotate-45"
          animate={
            reduceMotion ? { y: 0, opacity: 1 } : { y: [0, -5, 0], opacity: [0.65, 1, 0.65] }
          }
          transition={
            reduceMotion ? { duration: 0 } : { duration: 1, repeat: Infinity }
          }
        />
      )}

      <svg viewBox="0 0 100 168" className="w-full h-full overflow-visible">
        <Body accentHex={accentHex} isDead={isDead} stroke={SPRITE_STROKE} />
      </svg>
    </motion.div>
  );
}
