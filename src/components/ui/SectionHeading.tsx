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
      className={`font-display text-[10px] uppercase tracking-[0.25em] ${colorClassName} ${className}`}>
      {children}
    </h3>
  );
}

