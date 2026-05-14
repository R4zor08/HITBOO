import { GlassCard } from '../ui/GlassCard';

export type ActionStatus =
  | 'Standing'
  | 'Jumping'
  | 'Crouching'
  | 'Prone'
  | 'Aiming'
  | 'Charging'
  | 'Shooting'
  | 'Hurt'
  | 'Defeated'
  | 'Idle';

export interface ActionStatusPanelProps {
  actionOwnerLabel: string;
  status: ActionStatus;
  skillLabel: string;
  skillIcon: string;
  angleDeg: number | null;
  powerPct: number | null;
  windSpeed: number;
  windDirection: 'left' | 'right';
  /** e.g. Light / Medium / Strong — shown beside wind readout */
  windStrengthTier?: string;
  reduceMotion: boolean;
  /** Second line for local 2P — opponent skill summary */
  secondarySkillLine?: string | null;
  /** Incoming projectiles (live danger hint) */
  incomingCount?: number;
}

export function ActionStatusPanel({
  actionOwnerLabel,
  status,
  skillLabel,
  skillIcon,
  angleDeg,
  powerPct,
  windSpeed,
  windDirection,
  windStrengthTier,
  reduceMotion,
  secondarySkillLine,
  incomingCount = 0
}: ActionStatusPanelProps) {
  const windArrow = windDirection === 'right' ? '→' : '←';
  const angleStr = angleDeg != null ? `${Math.round(angleDeg)}°` : '—';
  const powerStr = powerPct != null ? `${Math.round(powerPct)}%` : '—';

  return (
    <GlassCard
      variant="sticker"
      className="pointer-events-none w-full max-w-[min(22rem,calc(100vw-2rem))] border border-white/15 bg-dark-card/92 px-3 py-2.5 shadow-glass backdrop-blur-md sm:px-4 sm:py-3">
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[11px] font-display sm:text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Current action
        </span>
        <span className="text-right text-[10px] font-bold uppercase tracking-wider text-neon-cyan/90">
          {incomingCount > 0
            ? `Volley in flight (${incomingCount})`
            : ' '}
        </span>
        <span className="col-span-2 truncate font-bold text-white sm:text-sm">
          {actionOwnerLabel}
        </span>

        <span className="text-gray-500">Status</span>
        <span className="text-right font-black text-neon-lime">{status}</span>

        <span className="text-gray-500">Skill</span>
        <span className="text-right font-bold text-gray-100">
          <span className="mr-1.5" aria-hidden>
            {skillIcon}
          </span>
          {skillLabel}
        </span>

        {secondarySkillLine ? (
          <>
            <span className="col-span-2 truncate text-[10px] text-gray-400">
              {secondarySkillLine}
            </span>
          </>
        ) : null}

        <span className="text-gray-500">Angle</span>
        <span className="text-right tabular-nums font-bold text-neon-cyan">{angleStr}</span>

        <span className="text-gray-500">Power</span>
        <span className="text-right tabular-nums font-bold text-neon-magenta">{powerStr}</span>

        <span className="text-gray-500">Wind</span>
        <span className="text-right font-bold tabular-nums text-white">
          <span
            className={reduceMotion ? '' : 'inline-block'}
            style={reduceMotion ? {} : {}}>
            {windStrengthTier ? (
              <span className="mr-1 text-[10px] font-black uppercase tracking-wide text-gray-400">
                {windStrengthTier}
              </span>
            ) : null}
            {windArrow} {windSpeed}
          </span>
        </span>
      </div>
    </GlassCard>
  );
}
