import React from 'react';
import { motion } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface ChargeMeterProps {
  power: number;
  angle: number;
  isCharging: boolean;
  isPlayerTurn: boolean;
  reduceMotion?: boolean;
}

export function ChargeMeter({
  power,
  angle,
  isCharging,
  isPlayerTurn,
  reduceMotion
}: ChargeMeterProps) {
  const positionClass = isPlayerTurn ? 'left-8' : 'right-8';
  const powerDisplay = Math.round(power);
  
  return (
    <motion.div
      className={`fixed ${positionClass} bottom-32 z-30 w-56`}
      initial={{ opacity: 0, x: isPlayerTurn ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="card-professional rounded-xl px-4 py-4 space-y-3">
        {/* Header with power display */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
          <span className="font-sans font-semibold text-xs uppercase text-slate-400 tracking-wider">
            Power
          </span>
          <motion.span
            className="text-2xl font-bold text-slate-200"
            animate={{ scale: isCharging ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isCharging ? Infinity : 0 }}
          >
            {powerDisplay}%
          </motion.span>
        </div>

        {/* Power bar */}
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shadow-sm-professional relative">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
              animate={{ width: `${power}%` }}
              transition={{ duration: 0.1 }}
            />
            {isCharging && power > 0 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Stats footer */}
        <div className="pt-2 border-t border-slate-700/50 flex justify-between text-xs font-sans text-slate-400">
          <span>Angle: {Math.round(angle)}°</span>
          <motion.span
            animate={{ opacity: isCharging ? [0.5, 1] : 0.7 }}
            transition={{ duration: 0.6, repeat: isCharging ? Infinity : 0 }}
            className={isCharging ? 'text-blue-400' : 'text-slate-500'}
          >
            {isCharging ? 'Charging' : 'Ready'}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
