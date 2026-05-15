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

  return (
    <motion.div
      className={`fixed top-8 z-30 w-64 ${isLeft ? 'left-8' : 'right-8'}`}
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div
        className={`rounded-xl border transition-all duration-300 ${
          isCurrentTurn
            ? 'card-professional border-slate-600'
            : 'card-professional border-slate-700/50'
        } p-4`}
      >
        {/* Header with name and rank */}
        <div className="mb-3 flex items-center justify-between gap-3 pb-2 border-b border-slate-700/50">
          <div className="flex-1 min-w-0">
            <h3 className="font-sans font-semibold text-sm uppercase text-slate-200 truncate tracking-wide">
              {name}
            </h3>
            <div className="text-xs text-slate-500 mt-0.5">Level {rank}</div>
          </div>

          {/* Character avatar */}
          {characterId && (
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/50 overflow-hidden flex-shrink-0">
              <StickerAvatar
                characterId={characterId}
                scale={1.1}
                accentHex={accentColor}
              />
            </div>
          )}
        </div>

        {/* Health section */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health</span>
            <span className="text-xs font-semibold text-slate-300">
              {Math.max(0, hp)}/{maxHp}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shadow-sm-professional">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
              initial={{ width: '100%' }}
              animate={{ width: `${(hp / maxHp) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Turn indicator */}
        {isCurrentTurn && (
          <motion.div
            className="rounded-lg bg-slate-800/80 border border-slate-600 px-2 py-2 text-center"
            animate={{ backgroundColor: ['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.9)'] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Your Turn
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
