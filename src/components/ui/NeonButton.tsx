import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface NeonButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function NeonButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: NeonButtonProps) {
  const variants = {
    primary:
      'bg-neon-cyan/25 border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.5),0_8px_0_0_rgba(0,240,255,0.45)] hover:bg-neon-cyan/35 hover:shadow-[0_0_30px_rgba(0,240,255,0.7),0_8px_0_0_rgba(0,240,255,0.6)] focus-visible:ring-neon-cyan/75',
    secondary:
      'bg-neon-purple/25 border-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.5),0_8px_0_0_rgba(168,85,247,0.4)] hover:bg-neon-purple/35 hover:shadow-[0_0_30px_rgba(168,85,247,0.7),0_8px_0_0_rgba(168,85,247,0.6)] focus-visible:ring-neon-purple/75',
    danger:
      'bg-neon-magenta/25 border-neon-magenta shadow-[0_0_20px_rgba(255,0,229,0.5),0_8px_0_0_rgba(255,0,229,0.4)] hover:bg-neon-magenta/35 hover:shadow-[0_0_30px_rgba(255,0,229,0.7),0_8px_0_0_rgba(255,0,229,0.6)] focus-visible:ring-neon-magenta/75',
    success:
      'bg-neon-lime/25 border-neon-lime shadow-[0_0_20px_rgba(180,255,0,0.5),0_8px_0_0_rgba(180,255,0,0.4)] hover:bg-neon-lime/35 hover:shadow-[0_0_30px_rgba(180,255,0,0.7),0_8px_0_0_rgba(180,255,0,0.6)] focus-visible:ring-neon-lime/75'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg font-bold rounded-xl',
    xl: 'px-12 py-6 text-2xl font-bold tracking-wider rounded-xl'
  };
  return (
    <motion.button
      disabled={disabled}
      className={`touch-manipulation relative border-4 uppercase font-display font-black tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all duration-200 backdrop-blur-sm outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-darker disabled:text-white/75 disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.08,
              rotate: [0, -1.5, 1.5, 0],
              filter: 'brightness(1.2)',
              transition: { duration: 0.4 }
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.92,
              y: 4,
              boxShadow: '0 2px 0 0 rgba(0,0,0,0.25)'
            }
      }
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      {...props}>
      {children}
    </motion.button>
  );
}
