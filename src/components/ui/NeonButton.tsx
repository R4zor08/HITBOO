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
      'bg-blue-600 border-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:bg-blue-500 hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] focus-visible:ring-blue-400/75',
    secondary:
      'bg-purple-600 border-purple-500 shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:bg-purple-500 hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)] focus-visible:ring-purple-400/75',
    danger:
      'bg-rose-600 border-rose-500 shadow-[0_4px_12px_rgba(244,63,94,0.3)] hover:bg-rose-500 hover:shadow-[0_6px_20px_rgba(244,63,94,0.5)] focus-visible:ring-rose-400/75',
    success:
      'bg-emerald-600 border-emerald-500 shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:bg-emerald-500 hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)] focus-visible:ring-emerald-400/75'
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
      className={`touch-manipulation relative border border-current font-sans font-semibold tracking-wide text-white transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:text-white/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
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
