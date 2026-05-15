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

const BIG_HIT = 38;

export function DamageFloaters({ items, reduceMotion }: DamageFloatersProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {items.map((d) => {
          const big = d.damage >= BIG_HIT;
          const color =
            d.side === 'player'
              ? big
                ? '#ff8585'
                : '#ff6b6b'
              : big
                ? '#ffc078'
                : '#ff9f43';
          const shadow =
            d.side === 'player'
              ? big
                ? '0 0 16px rgba(255,100,100,0.65)'
                : '0 0 12px rgba(255,80,80,0.55)'
              : big
                ? '0 0 16px rgba(255,190,100,0.55)'
                : '0 0 12px rgba(255,160,80,0.5)';
          return (
            <motion.div
              key={d.id}
              className="absolute font-display font-black tabular-nums drop-shadow-[0_2px_0_rgba(0,0,0,0.85)]"
              style={{
                left: `${d.xPct}%`,
                top: `${d.yPct - d.stack * 4}%`,
                transform: 'translate(-50%, -100%)',
                color,
                fontSize: big ? '1.42rem' : d.damage >= 28 ? '1.22rem' : '1.05rem',
                textShadow: shadow
              }}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: big && !reduceMotion ? 1.08 : 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0, y: -18, scale: 0.95 }
                  : {
                      opacity: 0,
                      y: big ? -40 : -32,
                      scale: big ? 1.12 : 0.92
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.12 }
                  : {
                      duration: big ? 0.42 : 0.35,
                      ease: 'easeOut'
                    }
              }>
              −{d.damage}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
