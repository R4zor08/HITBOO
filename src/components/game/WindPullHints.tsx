import { motion } from 'framer-motion';

type WindDirection = 'left' | 'right';

/**
 * Subtle drifting streaks while aiming (practice / local 2P “read the wind” aid).
 * Bowmasters-adjacent readability without cluttering ranked vs AI.
 */
export function WindPullHints({
  windSpeed,
  windDirection,
  reduceMotion,
  visible
}: {
  windSpeed: number;
  windDirection: WindDirection;
  reduceMotion: boolean;
  visible: boolean;
}) {
  if (!visible || reduceMotion) return null;
  const drift = windDirection === 'right' ? 18 : -18;
  const opacity = Math.min(0.38, 0.12 + windSpeed * 0.012);
  const lines = [12, 28, 46, 64, 82];
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[11] overflow-hidden"
      aria-hidden>
      {lines.map((top, i) => (
        <motion.div
          key={i}
          className="absolute h-px rounded-full bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"
          style={{
            top: `${top}%`,
            left: '-15%',
            width: '130%',
            opacity,
            filter: 'blur(0.5px)'
          }}
          initial={{ x: 0 }}
          animate={{ x: [0, drift, 0] }}
          transition={{
            duration: 2.4 + i * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.22
          }}
        />
      ))}
    </div>
  );
}
