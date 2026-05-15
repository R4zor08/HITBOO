import React from 'react';
import { motion } from 'framer-motion';

interface ActionStatusPanelProps {
  isPlayerTurn: boolean;
  timeRemaining?: number;
  currentWeapon?: string;
  weaponDamage?: number;
  weaponAccuracy?: number;
  reduceMotion?: boolean;
  accentHex?: string;
}

/**
 * Enhanced status panel showing whose turn it is, time remaining, and weapon stats.
 * Features neon glow effects, animated turn indicators, and real-time stats display.
 */
export function ActionStatusPanel({
  isPlayerTurn,
  timeRemaining = 60,
  currentWeapon = 'Standard Arrow',
  weaponDamage = 25,
  weaponAccuracy = 100,
  reduceMotion = false,
  accentHex = '#00f0ff'
}: ActionStatusPanelProps) {
  const turnColor = isPlayerTurn ? accentHex : '#ff3355';
  const turnLabel = isPlayerTurn ? 'YOUR TURN' : "ENEMY'S TURN";

  return (
    <div className="pointer-events-auto absolute top-6 left-6 z-20">
      {/* Main Status Box */}
      <motion.div
        className="relative p-4 rounded-lg bg-black/60 backdrop-blur-md border-2"
        style={{
          borderColor: turnColor,
          boxShadow: `0 0 20px ${turnColor}40, 0 0 40px ${turnColor}20`
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Turn Indicator */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: turnColor }}
            animate={
              !reduceMotion
                ? {
                    boxShadow: [
                      `0 0 10px ${turnColor}`,
                      `0 0 20px ${turnColor}`,
                      `0 0 10px ${turnColor}`
                    ]
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
          <motion.div
            className="text-sm font-display font-black uppercase tracking-widest"
            style={{ color: turnColor }}
            animate={
              !reduceMotion
                ? {
                    textShadow: [
                      `0 0 8px ${turnColor}`,
                      `0 0 16px ${turnColor}`,
                      `0 0 8px ${turnColor}`
                    ]
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.2
            }}
          >
            {turnLabel}
          </motion.div>
        </div>

        {/* Time Remaining */}
        {timeRemaining !== undefined && (
          <div className="mb-3 pb-3 border-b border-white/10">
            <div className="text-xs text-gray-400 mb-1 font-display">TIME</div>
            <div className="flex items-center gap-2">
              <motion.div
                className="text-2xl font-bold font-display"
                style={{
                  color: timeRemaining > 10 ? '#22c55e' : timeRemaining > 5 ? '#facc15' : '#ef4444'
                }}
                animate={
                  timeRemaining <= 5 && !reduceMotion
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{
                  duration: 0.8,
                  repeat: Infinity
                }}
              >
                {timeRemaining}s
              </motion.div>
              <div className="h-2 flex-1 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${
                      timeRemaining > 10
                        ? '#22c55e'
                        : timeRemaining > 5
                          ? '#facc15'
                          : '#ef4444'
                    }, ${
                      timeRemaining > 10
                        ? '#22c55e'
                        : timeRemaining > 5
                          ? '#facc15'
                          : '#ef4444'
                    }80)`,
                    boxShadow: `0 0 8px ${
                      timeRemaining > 10
                        ? '#22c55e'
                        : timeRemaining > 5
                          ? '#facc15'
                          : '#ef4444'
                    }`
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeRemaining / 60) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Weapon Stats */}
        <div className="space-y-2">
          <div className="text-xs text-gray-400 font-display font-bold">WEAPON</div>
          <div className="text-sm font-display font-bold text-white/80 mb-2">
            {currentWeapon}
          </div>

          {/* Damage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">DMG</span>
              <span className="text-xs font-bold text-neon-magenta">{weaponDamage}</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/60 border border-neon-magenta/30 overflow-hidden">
              <motion.div
                className="h-full bg-neon-magenta/80"
                style={{
                  width: `${weaponDamage}%`,
                  boxShadow: '0 0 8px rgba(255, 0, 229, 0.6)'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${weaponDamage}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
            </div>
          </div>

          {/* Accuracy */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">ACCURACY</span>
              <span className="text-xs font-bold text-neon-cyan">{weaponAccuracy}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/60 border border-neon-cyan/30 overflow-hidden">
              <motion.div
                className="h-full bg-neon-cyan/80"
                style={{
                  width: `${weaponAccuracy}%`,
                  boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${weaponAccuracy}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle at top-left, ${turnColor}10, transparent)`,
            zIndex: -1
          }}
        />
      </motion.div>

      {/* Floating indicator arrows */}
      {!reduceMotion && (
        <>
          <motion.div
            className="absolute -left-6 top-12 text-neon-cyan text-2xl font-bold"
            animate={{ x: [-10, 0, -10] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ▶
          </motion.div>
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-neon-magenta text-lg font-bold"
            animate={{ y: [-10, 0, -10] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ▼
          </motion.div>
        </>
      )}
    </div>
  );
}
