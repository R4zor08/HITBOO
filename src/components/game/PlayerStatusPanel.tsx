import React from 'react';
import { motion } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { StickerAvatar } from './StickerAvatar';
import type { CharacterId } from '../../game/charactersCatalog';

interface PlayerStatusPanelProps {
  name: string;
  hp: number;
  maxHp?: number;
  rank: string;
  isCurrentTurn?: boolean;
  characterId?: CharacterId | null;
  accentColor?: string;
  position: 'left' | 'right';
  reduceMotion?: boolean;
}

export function PlayerStatusPanel({
  name,
  hp,
  maxHp = 100,
  rank,
  isCurrentTurn,
  characterId,
  accentColor = '#00f0ff',
  position,
  reduceMotion
}: PlayerStatusPanelProps) {
  const isLeft = position === 'left';
  const borderColor = isCurrentTurn ? 'border-neon-cyan' : 'border-white/40';
  const glowColor = isCurrentTurn
    ? '0 0 25px rgba(0, 240, 255, 0.5)'
    : 'none';

  return (
    <motion.div
      className={`fixed top-8 z-30 w-64 ${isLeft ? 'left-8' : 'right-8'}`}
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div
        className={`rounded-3xl border-3 ${borderColor} bg-black/50 backdrop-blur-sm p-4 transition-all duration-300`}
        style={{
          boxShadow: isCurrentTurn
            ? `${glowColor}, inset 0 0 15px rgba(0, 240, 255, 0.1)`
            : 'none'
        }}
      >
        {/* Header with name and rank */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-display font-black text-sm uppercase text-white truncate tracking-wider">
              {name}
            </h3>
            <div className="text-[10px] font-display text-gray-400">
              LVL: <span className="text-neon-magenta font-bold">{rank}</span>
            </div>
          </div>

          {/* Character avatar */}
          {characterId && (
            <div className="w-12 h-12 rounded-full border-2 border-current overflow-hidden flex-shrink-0">
              <StickerAvatar
                characterId={characterId}
                scale={1.2}
                accentHex={accentColor}
              />
            </div>
          )}
        </div>

        {/* Health bar */}
        <div className="mb-2">
          <ProgressBar
            progress={(hp / maxHp) * 100}
            height="h-4"
            color={isCurrentTurn ? 'bg-neon-cyan' : 'bg-neon-magenta'}
            arcade={true}
            reduceMotion={reduceMotion}
          />
        </div>

        {/* HP text */}
        <div className="text-right text-xs font-display font-bold text-white/80">
          {Math.max(0, hp)} <span className="text-white/50">/ {maxHp} HP</span>
        </div>

        {/* Turn indicator */}
        {isCurrentTurn && (
          <motion.div
            className="mt-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan px-2 py-1 text-center"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="text-[9px] font-display font-bold text-neon-cyan uppercase tracking-widest">
              Your Turn
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
