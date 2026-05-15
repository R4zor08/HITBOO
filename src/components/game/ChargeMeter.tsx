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
      className={`fixed ${positionClass} bottom-32 z-30 w-48`}
      initial={{ opacity: 0, x: isPlayerTurn ? -20 : 20 }}
      animate={{ opacity: isCharging ? 1 : 0.6, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="rounded-2xl border-3 border-neon-cyan/60 bg-black/40 backdrop-blur-sm px-4 py-3 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-display font-bold text-xs uppercase text-neon-cyan tracking-widest">
            Charge
          </span>
          <motion.span
            className="text-lg font-black text-neon-cyan"
            animate={{ scale: isCharging ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.6, repeat: isCharging ? Infinity : 0 }}
          >
            {powerDisplay}%
          </motion.span>
        </div>

        <ProgressBar
          progress={power}
          height="h-4"
          color="bg-gradient-to-r from-neon-cyan to-neon-magenta"
          arcade={true}
          reduceMotion={reduceMotion}
        />

        <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[10px] font-display text-gray-400">
          <span>ANG: {Math.round(angle)}°</span>
          <span className={isCharging ? 'text-neon-magenta' : 'text-gray-500'}>
            {isCharging ? 'CHARGING...' : 'READY'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
