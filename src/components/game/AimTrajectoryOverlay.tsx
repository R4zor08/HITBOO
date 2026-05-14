import { motion } from 'framer-motion';
import type { PointPct } from '../../game/artilleryPhysics';

export type AimTrajectoryOverlayProps = {
  points: PointPct[];
  terminal: PointPct | null;
  startX: number;
  startY: number;
  aimAngleDeg: number;
  facingRight: boolean;
  stroke: string;
  reduceMotion: boolean;
  visible: boolean;
  /** Practice gets a bolder preview; ranked stays subtle; local2p matches charger aid only. */
  trajectoryStrength?: 'ranked' | 'practice' | 'local2p';
};

export function AimTrajectoryOverlay({
  points,
  terminal,
  startX,
  startY,
  aimAngleDeg,
  facingRight,
  stroke,
  reduceMotion,
  visible,
  trajectoryStrength = 'ranked'
}: AimTrajectoryOverlayProps) {
  if (!visible || points.length < 2) return null;
  const poly = points.map((p) => `${p.x},${p.y}`).join(' ');
  const term = terminal ?? points[points.length - 1]!;
  const rad = (aimAngleDeg * Math.PI) / 180;
  const dir = facingRight ? 1 : -1;
  const arrLen = 5.5;
  const ax1 = startX + Math.cos(rad) * arrLen * dir;
  const ay1 = startY - Math.sin(rad) * arrLen;

  const isPractice = trajectoryStrength === 'practice';
  const strokeW = isPractice ? 0.72 : 0.5;
  const lineOpacity = isPractice ? 1 : 0.95;
  const glowStd = isPractice ? 0.55 : 0.42;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[12] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none">
      <defs>
        <filter id="hitbowTrajGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={glowStd} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <line
        x1={startX}
        y1={startY}
        x2={ax1}
        y2={ay1}
        stroke={stroke}
        strokeWidth={strokeW * 0.9}
        strokeLinecap="round"
        opacity={lineOpacity}
        filter="url(#hitbowTrajGlow)"
      />

      <polyline
        points={poly}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        strokeDasharray={isPractice ? '1.4 0.75' : '1.1 0.95'}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={lineOpacity}
        filter="url(#hitbowTrajGlow)"
      />

      <circle
        cx={term.x}
        cy={term.y}
        r={isPractice ? 1.25 : 1.05}
        fill={stroke}
        opacity={lineOpacity}
        filter="url(#hitbowTrajGlow)"
      />

      {!reduceMotion ? (
        <motion.circle
          cx={term.x}
          cy={term.y}
          r={2.4}
          fill="none"
          stroke={stroke}
          strokeWidth="0.12"
          initial={{ opacity: 0.55 }}
          animate={{ r: [2.4, 3.6, 2.4], opacity: [0.45, 0.12, 0.45] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <circle
          cx={term.x}
          cy={term.y}
          r={2.2}
          fill="none"
          stroke={stroke}
          strokeWidth="0.1"
          opacity={0.35}
        />
      )}

      <g stroke={stroke} strokeWidth="0.14" opacity={0.85}>
        <line x1={term.x - 2.2} y1={term.y} x2={term.x + 2.2} y2={term.y} />
        <line x1={term.x} y1={term.y - 2.2} x2={term.x} y2={term.y + 2.2} />
      </g>
    </svg>
  );
}
