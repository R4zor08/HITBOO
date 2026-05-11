 import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: string;
  className?: string;
  showLabel?: boolean;
  /** Inset track + leading-edge hot strip (aim power in GameScreen). */
  variant?: 'default' | 'arcade';
  /** Softer fill animation when reduce motion is on. */
  reduceMotion?: boolean;
}

export function ProgressBar({
  progress,
  color = 'bg-neon-lime',
  height = 'h-4',
  className = '',
  showLabel = false,
  variant = 'default',
  reduceMotion = false
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const arcade = variant === 'arcade';

  const trackClass = arcade
    ? 'w-full bg-black/70 rounded-full overflow-hidden border-2 border-white/20 relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.65)]'
    : 'w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative';

  const fillTransition = reduceMotion
    ? { duration: 0.2, ease: 'linear' as const }
    : { type: 'spring' as const, bounce: 0, duration: 0.5 };

  return (
    <div className={`${trackClass} ${height} ${className}`}>
      <motion.div
        className={`h-full relative overflow-hidden ${color} ${
          arcade
            ? 'shadow-[0_0_14px_rgba(0,240,255,0.35)]'
            : 'shadow-[0_0_10px_currentColor]'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={fillTransition}>
        {arcade && clampedProgress > 0.5 && (
          <span
            className="absolute right-0 top-0 bottom-0 w-1 bg-white/90 shadow-[0_0_8px_2px_rgba(255,255,255,0.85)]"
            aria-hidden
          />
        )}
      </motion.div>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-display text-white drop-shadow-md">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
