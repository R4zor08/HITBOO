import { GlassCard } from '../ui/GlassCard';

export type CombatHudStatus =
  | 'Standing'
  | 'Aiming'
  | 'Charging'
  | 'Shooting'
  | 'Hurt'
  | 'Defeated';

interface ActionStatusPanelProps {
  /** Who is currently acting (solo = you; local = P1 or P2). */
  actionLabel: string;
  status: CombatHudStatus;
  skillLabel: string;
  skillIcon: string;
  angleDeg: number;
  powerPct: number;
  windSpeed: number;
  windDirection: 'left' | 'right';
  reduceMotion?: boolean;
  /** Optional compact subtitle (e.g. stance). */
  stanceLabel?: string;
}

export function ActionStatusPanel({
  actionLabel,
  status,
  skillLabel,
  skillIcon,
  angleDeg,
  powerPct,
  windSpeed,
  windDirection,
  reduceMotion = false,
  stanceLabel
}: ActionStatusPanelProps) {
  const windArrow = windDirection === 'right' ? '→' : '←';
  return (
    <GlassCard
      variant="sticker"
      className="pointer-events-none w-full max-w-[min(22rem,calc(100vw-1.5rem))] border border-white/15 bg-dark-card/92 px-3 py-2.5 shadow-glass backdrop-blur-md sm:px-4 sm:py-3">
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[11px] font-display sm:grid-cols-[minmax(0,1.1fr)_auto] sm:text-xs">
        <div className="min-w-0 text-gray-400 uppercase tracking-wide">
          Current action
        </div>
        <div className="truncate text-right font-bold text-neon-cyan sm:max-w-[11rem]">
          {actionLabel}
        </div>
        <div className="text-gray-400 uppercase tracking-wide">Status</div>
        <div className="text-right font-bold text-white">{status}</div>
        <div className="text-gray-400 uppercase tracking-wide">Skill</div>
        <div className="text-right font-bold text-neon-lime">
          <span className="mr-1.5" aria-hidden>
            {skillIcon}
          </span>
          <span className="truncate">{skillLabel}</span>
        </div>
        <div className="text-gray-400 uppercase tracking-wide">Angle</div>
        <div className="text-right font-mono text-white tabular-nums">
          {Math.round(angleDeg)}°
        </div>
        <div className="text-gray-400 uppercase tracking-wide">Power</div>
        <div className="text-right font-mono text-neon-yellow tabular-nums">
          {Math.round(powerPct)}%
        </div>
        <div className="text-gray-400 uppercase tracking-wide">Wind</div>
        <div
          className={`text-right font-mono font-bold tabular-nums ${
            reduceMotion ? 'text-gray-200' : 'text-neon-cyan'
          }`}>
          {windArrow} {windSpeed}
        </div>
      </div>
      {stanceLabel ? (
        <p className="mt-1.5 border-t border-white/10 pt-1.5 text-center text-[10px] uppercase tracking-wider text-gray-500 font-display sm:text-[11px]">
          Stance: <span className="text-gray-300">{stanceLabel}</span>
        </p>
      ) : null}
    </GlassCard>
  );
}
