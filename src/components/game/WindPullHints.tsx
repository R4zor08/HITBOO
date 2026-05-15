import { motion } from 'framer-motion';

type WindDirection = 'left' | 'right';

/**
 * Enhanced wind visualization with dynamic arrows, magnitude indicators,
 * and trajectory preview influence display.
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
  if (!visible) return null;

  const drift = windDirection === 'right' ? 18 : -18;
  const baseOpacity = Math.min(0.38, 0.12 + windSpeed * 0.012);
  const lines = [12, 28, 46, 64, 82];
  const windMagnitude = Math.min(1, windSpeed / 20); // Normalize to 0-1
  const arrowDirection = windDirection === 'right' ? '→' : '←';

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[11] overflow-hidden"
      aria-hidden
    >
      {/* Drifting wind lines */}
      {lines.map((top, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px rounded-full bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"
          style={{
            top: `${top}%`,
            left: '-15%',
            width: '130%',
            opacity: baseOpacity,
            filter: 'blur(0.5px)'
          }}
          initial={{ x: 0 }}
          animate={
            reduceMotion
              ? {}
              : { x: [0, drift, 0] }
          }
          transition={{
            duration: 2.4 + i * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.22
          }}
        />
      ))}

      {/* Wind arrow and magnitude indicator */}
      {windSpeed > 0 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <motion.div
            className="text-4xl font-bold text-neon-magenta"
            animate={
              reduceMotion
                ? {}
                : {
                    x: windDirection === 'right' ? [0, 6, 0] : [0, -6, 0],
                    filter: [
                      'drop-shadow(0 0 8px rgba(255, 0, 229, 0.4))',
                      'drop-shadow(0 0 16px rgba(255, 0, 229, 0.8))',
                      'drop-shadow(0 0 8px rgba(255, 0, 229, 0.4))'
                    ]
                  }
            }
            transition={{
              duration: 1 + (1 - windMagnitude) * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {arrowDirection}
          </motion.div>

          {/* Wind speed bars */}
          <div className="flex gap-1 mt-2 justify-center">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`bar-${i}`}
                className={`w-1.5 h-4 rounded-sm ${
                  i < windMagnitude * 5
                    ? 'bg-neon-magenta'
                    : 'bg-white/10'
                }`}
                initial={{ opacity: 0.3 }}
                animate={
                  i < windMagnitude * 5 && !reduceMotion
                    ? { opacity: [0.3, 1, 0.3] }
                    : {}
                }
                transition={{
                  duration: 0.6 + i * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>

          {/* Wind speed text */}
          <div className="text-xs font-display font-bold text-neon-magenta text-center mt-1">
            WIND {Math.round(windSpeed)}
          </div>
        </div>
      )}

      {/* Trajectory influence indicator at bottom */}
      {windSpeed > 3 && (
        <motion.div
          className="absolute bottom-8 right-8 text-xs font-display font-bold text-neon-cyan bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-neon-cyan/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span>Wind affecting trajectory</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
