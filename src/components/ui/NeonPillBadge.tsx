type NeonPillBadgeVariant =
  | 'neutral'
  | 'cyan'
  | 'magenta'
  | 'lime'
  | 'accent';

interface NeonPillBadgeProps {
  label: string;
  variant?: NeonPillBadgeVariant;
  className?: string;
  /**
   * Used when `variant="accent"` so we can style dynamically with the item’s hex.
   * Example: `#00f0ff`.
   */
  accentHex?: string;
}

export function NeonPillBadge({
  label,
  variant = 'neutral',
  className = '',
  accentHex
}: NeonPillBadgeProps) {
  const variants: Record<Exclude<NeonPillBadgeVariant, 'accent'>, string> = {
    neutral: 'border-white/30 bg-white/5 text-gray-300 shadow-[0_0_12px_rgba(255,255,255,0.1)]',
    cyan: 'border-neon-cyan/60 bg-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)]',
    magenta: 'border-neon-magenta/60 bg-neon-magenta/20 text-neon-magenta shadow-[0_0_15px_rgba(255,0,229,0.4)]',
    lime: 'border-neon-lime/60 bg-neon-lime/20 text-neon-lime shadow-[0_0_15px_rgba(132,255,0,0.4)]'
  };

  const accentStyle =
    variant === 'accent' && accentHex
      ? ({
          backgroundColor: `${accentHex}33`,
          borderColor: `${accentHex}88`,
          color: accentHex,
          boxShadow: `0 0 15px ${accentHex}40`
        } as const)
      : undefined;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[10px] font-display font-bold uppercase tracking-wide ${
        variant === 'accent' ? 'border-white/30 bg-white/5' : variants[variant]
      } ${className}`}
      style={accentStyle}>
      {label}
    </span>
  );
}

