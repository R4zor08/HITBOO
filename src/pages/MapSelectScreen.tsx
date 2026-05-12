import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapIcon } from 'lucide-react';
import { NeonButton } from '../components/ui/NeonButton';
import { ScreenFrame } from '../components/ui/ScreenFrame';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GlassCard } from '../components/ui/GlassCard';
import { MapPickerGrid } from '../components/game/MapPickerGrid';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import { DEFAULT_MAP_ID, getMapById } from '../game/maps';
import type { MapId } from '../types';

export type MapSelectMode = 'online' | 'local2p';

interface MapSelectScreenProps {
  mode: MapSelectMode;
  onContinue: (mapId: MapId) => void;
  onCancel: () => void;
}

export function MapSelectScreen({ mode, onContinue, onCancel }: MapSelectScreenProps) {
  const progress = useHitBowProgress();
  const reduceMotion = progress.settings.reduceMotion;
  const [mapId, setMapId] = useState<MapId>(DEFAULT_MAP_ID);
  const selected = useMemo(() => getMapById(mapId), [mapId]);

  const isOnline = mode === 'online';
  const accent = isOnline ? 'text-neon-cyan' : 'text-neon-lime';
  const borderAccent = isOnline ? 'border-neon-cyan/35' : 'border-neon-lime/35';
  const variant = isOnline ? 'cyan' : 'lime';

  return (
    <motion.div
      className="relative min-h-dvh h-dvh w-full overflow-hidden bg-dark-darker"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}>
      {!reduceMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 scale-110 bg-cover bg-center opacity-[0.22]"
          style={{
            backgroundImage: `url(${selected.previewSrc})`,
            filter: 'blur(56px)'
          }}
        />
      ) : null}
      <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
        <ScreenFrame
          reduceMotion={reduceMotion}
          showParticles={!reduceMotion}
          className="bg-transparent"
          contentClassName="items-stretch justify-start overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <MapIcon className={`shrink-0 ${accent}`} size={28} />
                <div>
                  <SectionHeading colorClassName={accent} className="mb-0">
                    {isOnline ? 'Choose arena' : 'Choose arena — local'}
                  </SectionHeading>
                  <p className="mt-1 font-display text-xs text-gray-400">
                    {isOnline
                      ? 'Pick a map, then enter the pairing queue.'
                      : 'Pick a map first, then set up both players.'}
                  </p>
                </div>
              </div>
              <NeonButton
                variant="secondary"
                size="sm"
                className="shrink-0 self-start sm:self-auto"
                onClick={onCancel}>
                Back
              </NeonButton>
            </div>

            <GlassCard
              variant="default"
              className={`overflow-hidden border-2 ${borderAccent} bg-dark-card/75 p-0 shadow-glass backdrop-blur-md`}>
              <div
                className="relative h-36 w-full bg-cover bg-center sm:h-44 md:h-52"
                style={{ backgroundImage: `url(${selected.previewSrc})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-darker via-dark-darker/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Selected arena
                  </p>
                  <h2 className="font-display text-xl font-black text-white sm:text-2xl">
                    {selected.name}
                  </h2>
                  <p className="font-display text-sm text-neon-yellow/90">{selected.theme}</p>
                  <p className="mt-0.5 font-display text-xs text-gray-400">{selected.biome}</p>
                </div>
              </div>
            </GlassCard>

            <div>
              <p className="mb-2 text-center font-display text-xs uppercase tracking-wider text-gray-400">
                All arenas
              </p>
              <MapPickerGrid value={mapId} onChange={setMapId} variant={variant} />
            </div>

            <div className="flex flex-col justify-center gap-3 pb-4 sm:flex-row">
              <NeonButton variant="secondary" onClick={onCancel}>
                Cancel
              </NeonButton>
              <NeonButton variant="primary" size="lg" onClick={() => onContinue(mapId)}>
                {isOnline ? 'Find match' : 'Continue'}
              </NeonButton>
            </div>
          </div>
        </ScreenFrame>
      </div>
    </motion.div>
  );
}
