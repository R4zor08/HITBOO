import React from 'react';

interface SectionHeadingProps {
  children: React.ReactNode;
  /**
   * Tailwind class controlling color (example: `text-neon-cyan`).
   * Keep layout/typography consistent with the default.
   */
  colorClassName?: string;
  className?: string;
}

export function SectionHeading({
  children,
  colorClassName = 'text-gray-500',
  className = ''
}: SectionHeadingProps) {
  return (
    <h3
      className={`font-display text-[11px] font-bold uppercase tracking-[0.3em] letter-spacing-wide drop-shadow-[0_0_8px_rgba(0,0,0,0.7)] ${colorClassName} ${className}`}>
      {children}
    </h3>
  );
}

