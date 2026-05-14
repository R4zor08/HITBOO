import { AnimatePresence, motion } from 'framer-motion';

export type DamageFloater = {
  id: string;
  xPct: number;
  yPct: number;
  damage: number;
  side: 'player' | 'enemy';
  stack: number;
};

interface DamageFloatersProps {
  items: DamageFloater[];
  reduceMotion: boolean;
}

export function DamageFloaters({ items, reduceMotion }: DamageFloatersProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {items.map((d) => (
          <motion.div
            key={d.id}
            className="absolute font-display font-black tabular-nums drop-shadow-[0_2px_0_rgba(0,0,0,0.85)]"
            style={{
              left: `${d.xPct}%`,
              top: `${d.yPct - d.stack * 4}%`,
              transform: 'translate(-50%, -100%)',
              color: d.side === 'player' ? '#ff6b6b' : '#ff9f43',
              fontSize: d.damage >= 40 ? '1.35rem' : '1.05rem',
              textShadow:
                d.side === 'player'
                  ? '0 0 12px rgba(255,80,80,0.55)'
                  : '0 0 12px rgba(255,160,80,0.5)'
            }}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -28, scale: 0.92 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { duration: 0.35, ease: 'easeOut' }
            }>
            −{d.damage}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
