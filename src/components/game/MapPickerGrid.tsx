import { motion } from 'framer-motion';
import { MAPS } from '../../game/maps';
import type { MapId } from '../../types';
import { MAP_ARENA_THUMB_PICKER } from './mapThumbStyles';

type MapPickerVariant = 'cyan' | 'lime';

const variantClasses: Record<
  MapPickerVariant,
  { selected: string; idle: string; hover: string }
> = {
  cyan: {
    selected:
      'border-neon-cyan bg-neon-cyan/15 ring-2 ring-neon-cyan/40 shadow-[0_8px_28px_-6px_rgba(0,240,255,0.35)]',
    idle: 'border-white/20 bg-dark-card/80',
    hover: 'hover:border-neon-cyan/55 hover:shadow-md'
  },
  lime: {
    selected:
      'border-neon-lime bg-neon-lime/15 ring-2 ring-neon-lime/40 shadow-[0_8px_28px_-6px_rgba(132,255,0,0.3)]',
    idle: 'border-white/20 bg-dark-card/80',
    hover: 'hover:border-neon-lime/60 hover:shadow-md'
  }
};

export function MapPickerGrid({
  value,
  onChange,
  variant,
  reduceMotion = false
}: {
  value: MapId;
  onChange: (id: MapId) => void;
  variant: MapPickerVariant;
  reduceMotion?: boolean;
}) {
  const c = variantClasses[variant];
  const motionEnabled = !reduceMotion;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {MAPS.map((map) => {
        const selected = value === map.id;
        return (
          <motion.button
            key={map.id}
            type="button"
            layout={motionEnabled}
            onClick={() => onChange(map.id)}
            whileHover={motionEnabled ? { y: -2 } : undefined}
            whileTap={motionEnabled ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={`min-h-[44px] rounded-2xl border-2 px-2.5 py-2.5 text-left transition-shadow duration-200 ${
              selected ? c.selected : `${c.idle} ${c.hover}`
            }`}
            aria-label={`Map ${map.name}`}
            aria-pressed={selected}>
            <div
              className={`mb-2 ${MAP_ARENA_THUMB_PICKER}`}
              style={{ backgroundImage: `url(${map.previewSrc})` }}
            />
            <p className="font-display text-[11px] font-bold leading-tight text-white">
              {map.name}
            </p>
            <p className="font-display text-[10px] leading-snug text-gray-300">{map.theme}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
