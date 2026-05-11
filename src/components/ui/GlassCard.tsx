import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'purple' | 'lime' | 'none';
  interactive?: boolean;
  /** Thick cartoon / sticker panel */
  variant?: 'default' | 'sticker';
}

export function GlassCard({
  children,
  className = '',
  glowColor = 'none',
  interactive = false,
  variant = 'default',
  ...props
}: GlassCardProps) {
  const glowClasses = {
    cyan: 'hover:border-neon-cyan/70 hover:shadow-neon-cyan',
    magenta: 'hover:border-neon-magenta/70 hover:shadow-neon-magenta',
    purple: 'hover:border-neon-purple/70 hover:shadow-neon-purple',
    lime: 'hover:border-neon-lime/70 hover:shadow-neon-lime',
    none: ''
  };

  const baseSticker =
    variant === 'sticker'
      ? 'border-4 border-white/85 bg-dark-card/90 shadow-[0_8px_0_0_rgba(0,0,0,0.35)] rounded-3xl'
      : 'glass-panel rounded-2xl';

  const hoverMotion =
    variant === 'sticker' && interactive
      ? { scale: 1.04, y: -6, rotate: 2 }
      : interactive
        ? { scale: 1.02, y: -5 }
        : {};

  const tapMotion =
    variant === 'sticker' && interactive
      ? { scale: 0.96, y: 2 }
      : interactive
        ? { scale: 0.98 }
        : {};

  return (
    <motion.div
      className={`transition-colors duration-300 ${baseSticker} ${
        interactive ? `cursor-pointer ${glowClasses[glowColor]}` : ''
      } ${className}`}
      whileHover={interactive ? hoverMotion : {}}
      whileTap={interactive ? tapMotion : {}}
      {...props}>
      {children}
    </motion.div>
  );
}
