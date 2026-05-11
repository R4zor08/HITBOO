import React from 'react';
import { motion } from 'framer-motion';
interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: string;
  className?: string;
  showLabel?: boolean;
}
export function ProgressBar({
  progress,
  color = 'bg-neon-lime',
  height = 'h-4',
  className = '',
  showLabel = false
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  return (
    <div
      className={`w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative ${height} ${className}`}>
      
      <motion.div
        className={`h-full ${color} shadow-[0_0_10px_currentColor]`}
        initial={{
          width: 0
        }}
        animate={{
          width: `${clampedProgress}%`
        }}
        transition={{
          type: 'spring',
          bounce: 0,
          duration: 0.5
        }} />
      
      {showLabel &&
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-display text-white drop-shadow-md">
          {Math.round(clampedProgress)}%
        </div>
      }
    </div>);

}