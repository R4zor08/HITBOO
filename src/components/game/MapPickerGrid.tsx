import { MAPS } from '../../game/maps';
import type { MapId } from '../../types';

type MapPickerVariant = 'cyan' | 'lime';

const variantClasses: Record<
  MapPickerVariant,
  { selected: string; idle: string; hover: string }
> = {
  cyan: {
    selected:
      'border-neon-cyan bg-neon-cyan/15 ring-2 ring-neon-cyan/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] scale-[1.02]',
    idle: 'border-white/15 bg-dark-card/60 backdrop-blur-sm',
    hover: 'hover:border-neon-cyan/50 hover:bg-dark-card/80'
  },
  lime: {
    selected:
      'border-neon-lime bg-neon-lime/15 ring-2 ring-neon-lime/40 shadow-[0_0_20px_rgba(132,255,0,0.12)] scale-[1.02]',
    idle: 'border-white/15 bg-dark-card/60 backdrop-blur-sm',
    hover: 'hover:border-neon-lime/55 hover:bg-dark-card/80'
  }
};

export function MapPickerGrid({
  value,
  onChange,
  variant
}: {
  value: MapId;
  onChange: (id: MapId) => void;
  variant: MapPickerVariant;
}) {
  const c = variantClasses[variant];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {MAPS.map((map) => {
        const selected = value === map.id;
        return (
          <button
            key={map.id}
            type="button"
            onClick={() => onChange(map.id)}
            className={`group min-h-[44px] rounded-xl border-2 px-2.5 py-2.5 text-left transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-darker ${
              variant === 'cyan'
                ? 'focus-visible:ring-neon-cyan'
                : 'focus-visible:ring-neon-lime'
            } ${selected ? c.selected : `${c.idle} ${c.hover} hover:scale-[1.01]`}`}
            aria-label={`Map ${map.name}`}
            aria-pressed={selected}
            title={`${map.biome} — ${map.theme}`}>
            <div
              className="mb-2 aspect-video w-full rounded-lg border border-white/15 bg-cover bg-center shadow-inner"
              style={{ backgroundImage: `url(${map.previewSrc})` }}
            />
            <p className="font-display text-[11px] font-bold text-white">
              {map.name}
            </p>
            <p className="font-display text-[10px] text-gray-300">{map.theme}</p>
          </button>
        );
      })}
    </div>
  );
}
