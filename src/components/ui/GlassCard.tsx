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
    cyan: 'hover:border-neon-cyan/80 hover:shadow-[0_0_25px_rgba(0,240,255,0.6),0_0_50px_rgba(0,240,255,0.3)]',
    magenta: 'hover:border-neon-magenta/80 hover:shadow-[0_0_25px_rgba(255,0,229,0.6),0_0_50px_rgba(255,0,229,0.3)]',
    purple: 'hover:border-neon-purple/80 hover:shadow-[0_0_25px_rgba(139,92,246,0.6),0_0_50px_rgba(139,92,246,0.3)]',
    lime: 'hover:border-neon-lime/80 hover:shadow-[0_0_25px_rgba(132,255,0,0.6),0_0_50px_rgba(132,255,0,0.3)]',
    none: ''
  };

  const baseSticker =
    variant === 'sticker'
      ? 'border-4 border-white/85 bg-dark-card/90 shadow-[0_8px_0_0_rgba(0,0,0,0.35),0_0_20px_rgba(255,255,255,0.1)] rounded-3xl'
      : 'glass-panel rounded-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,240,255,0.08)]';

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
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      className={`transition-colors duration-300 ${baseSticker} ${
        interactive
          ? `cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-dark-darker ${glowClasses[glowColor]}`
          : ''
      } ${className}`}
      whileHover={interactive ? hoverMotion : {}}
      whileTap={interactive ? tapMotion : {}}
      {...props}>
      {children}
    </motion.div>
  );
}
