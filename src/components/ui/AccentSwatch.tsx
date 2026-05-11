import React from 'react';

type AccentSwatchSize = 'sm' | 'md' | 'lg';

interface AccentSwatchProps {
  accentHex: string;
  size?: AccentSwatchSize;
  className?: string;
  children?: React.ReactNode;
  /**
   * Optional background alpha (0..1). When set, uses `rgba(...)`.
   * If omitted, uses the raw hex value.
   */
  alpha?: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '').trim();
  if (![3, 6].includes(cleaned.length)) return null;
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const num = Number(`0x${full}`);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function AccentSwatch({
  accentHex,
  size = 'md',
  className = '',
  alpha,
  children
}: AccentSwatchProps) {
  const sizeClasses =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-5 w-5';
  const rgb = alpha === undefined ? null : hexToRgb(accentHex);
  const background =
    alpha === undefined || !rgb
      ? accentHex
      : `rgba(${rgb.r},${rgb.g},${rgb.b},${Math.max(0, Math.min(1, alpha))})`;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-2 border-white/25 shadow-inner ${sizeClasses} ${className}`}
      style={{ background }}>
      {children}
    </span>
  );
}

