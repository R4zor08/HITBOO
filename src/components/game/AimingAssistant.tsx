import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { WindDirection } from '../../game/artilleryPhysics';
import {
  sampleTrajectoryPoints,
  estimateGroundLandingPoint,
  P1_POS,
  P2_POS
} from '../../game/artilleryPhysics';

interface AimingAssistantProps {
  power: number;
  angle: number;
  windSpeed: number;
  windDirection: WindDirection;
  isPlayerTurn: boolean;
  visible: boolean;
  reduceMotion?: boolean;
  accentHex?: string;
}

/**
 * Enhanced aiming UI showing trajectory preview, power meter, angle/distance indicators,
 * and wind influence visualization.
 */
export function AimingAssistant({
  power,
  angle,
  windSpeed,
  windDirection,
  isPlayerTurn,
  visible,
  reduceMotion = false,
  accentHex = '#00f0ff'
}: AimingAssistantProps) {
  if (!visible) return null;

  const startPos = isPlayerTurn ? P1_POS : P2_POS;
  const targetPos = isPlayerTurn ? P2_POS : P1_POS;
  
  // Sample trajectory points
  const trajectoryPoints = useMemo(() => {
    return sampleTrajectoryPoints({
      power,
      angleDeg: angle,
      shooterFacingRight: isPlayerTurn,
      velocityScale: 1,
      windSpeed,
      windDirection,
      startX: startPos.x,
      startY: startPos.y
    });
  }, [power, angle, windSpeed, windDirection, isPlayerTurn, startPos]);

  // Estimate landing point
  const landingPoint = useMemo(() => {
    return estimateGroundLandingPoint({
      power,
      angleDeg: angle,
      shooterFacingRight: isPlayerTurn,
      velocityScale: 1,
      windSpeed,
      windDirection,
      startX: startPos.x,
      startY: startPos.y
    });
  }, [power, angle, windSpeed, windDirection, isPlayerTurn, startPos]);

  // Calculate distance to target
  const distToTarget = Math.hypot(
    targetPos.x - landingPoint.x,
    targetPos.y - landingPoint.y
  );
  const maxDistance = 30; // rough max distance across field
  const accuracyPct = Math.max(0, Math.round((1 - distToTarget / maxDistance) * 100));

  // Normalize trajectory points for SVG rendering (0-100%)
  const pathData = trajectoryPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Wind indicator
  const windMagnitude = (windSpeed / 20) * 15; // Scale wind for visualization
  const windDir = windDirection === 'right' ? 1 : -1;

  return (
    <div className="pointer-events-none absolute inset-0 z-[9] overflow-hidden">
      {/* Trajectory Preview */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none">
        {/* Grid background */}
        <defs>
          <linearGradient id="trajectoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentHex} stopOpacity="0.4" />
            <stop offset="100%" stopColor={accentHex} stopOpacity="0" />
          </linearGradient>
          
          <filter id="glowTrajectory">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trajectory path */}
        <motion.path
          d={pathData}
          stroke={accentHex}
          strokeWidth="0.6"
          fill="none"
          opacity="0.7"
          filter="url(#glowTrajectory)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            ease: 'easeOut'
          }}
        />

        {/* Landing point indicator */}
        <motion.circle
          cx={landingPoint.x}
          cy={landingPoint.y}
          r="1.5"
          fill={accuracyPct > 70 ? '#22c55e' : accuracyPct > 40 ? '#facc15' : '#ef4444'}
          opacity="0.8"
          filter="url(#glowTrajectory)"
          animate={{
            r: reduceMotion ? 1.5 : [1.5, 2.2, 1.5],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
        />

        {/* Wind flow visualization */}
        {windSpeed > 0 && (
          <>
            {[0, 25, 50, 75].map((y) => (
              <motion.line
                key={`wind-${y}`}
                x1={windDir > 0 ? '-5' : '105'}
                y1={y}
                x2={windDir > 0 ? '-5' : '105'}
                y2={y}
                stroke={accentHex}
                strokeWidth="0.4"
                opacity="0.3"
                initial={{ x1: windDir > 0 ? '-5' : '105', x2: windDir > 0 ? '-5' : '105' }}
                animate={{
                  x1: windDir > 0 ? '105' : '-5',
                  x2: windDir > 0 ? '110' : '-10'
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: (y / 100) * 0.5
                }}
              />
            ))}
          </>
        )}
      </svg>

      {/* HUD Overlays */}
      <div className="absolute bottom-6 left-6 space-y-3">
        {/* Power Meter */}
        <div className="w-48">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-display font-bold text-gray-300">POWER</span>
            <span className="text-xs font-bold text-neon-cyan">{Math.round(power)}%</span>
          </div>
          <div className="h-3 rounded-full bg-black/60 border border-white/20 overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-lime via-neon-cyan to-neon-magenta rounded-full shadow-[0_0_10px_rgba(0,240,255,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${power}%` }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Angle Display */}
        <div className="flex gap-6">
          <div>
            <div className="text-xs font-display font-bold text-gray-300 mb-1">ANGLE</div>
            <div className="text-lg font-bold text-neon-cyan">{Math.round(angle)}°</div>
          </div>
          <div>
            <div className="text-xs font-display font-bold text-gray-300 mb-1">ACCURACY</div>
            <motion.div
              className="text-lg font-bold"
              animate={{
                color: accuracyPct > 70 ? '#22c55e' : accuracyPct > 40 ? '#facc15' : '#ef4444'
              }}
            >
              {accuracyPct}%
            </motion.div>
          </div>
        </div>

        {/* Wind Indicator */}
        {windSpeed > 0 && (
          <div className="text-xs space-y-1">
            <div className="font-display font-bold text-gray-300">WIND</div>
            <div className="flex items-center gap-2">
              <motion.div
                className="text-lg"
                animate={{
                  x: windDir > 0 ? [0, 4, 0] : [0, -4, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {windDir > 0 ? '→' : '←'}
              </motion.div>
              <div className="text-neon-magenta font-bold">{Math.round(windSpeed)} spd</div>
            </div>
          </div>
        )}
      </div>

      {/* Top-right critical info */}
      <div className="absolute top-6 right-6">
        <div className="text-right space-y-2">
          <div className="text-xs font-display font-bold text-gray-400">DISTANCE</div>
          <div className="text-2xl font-bold text-neon-cyan">
            {Math.round(distToTarget * 3.3)}m
          </div>
        </div>
      </div>
    </div>
  );
}
