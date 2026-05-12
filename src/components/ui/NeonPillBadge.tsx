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
    neutral: 'border-white/30 bg-white/5 text-gray-300',
    cyan: 'border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan',
    magenta: 'border-neon-magenta/50 bg-neon-magenta/15 text-neon-magenta',
    lime: 'border-neon-lime/50 bg-neon-lime/15 text-neon-lime'
  };

  const accentStyle =
    variant === 'accent' && accentHex
      ? ({
          backgroundColor: `${accentHex}33`,
          borderColor: `${accentHex}88`,
          color: accentHex
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

