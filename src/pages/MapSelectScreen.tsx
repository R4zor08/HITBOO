import { useState } from 'react';
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
  const activeMap = getMapById(mapId);

  const isOnline = mode === 'online';
  const accent = isOnline ? 'text-neon-cyan' : 'text-neon-lime';
  const variant = isOnline ? 'cyan' : 'lime';
  const glow = isOnline ? 'cyan' : 'lime';

  return (
    <motion.div
      className="relative min-h-dvh h-dvh w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}>
      {!reduceMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div
            className="absolute inset-[-12%] scale-105 bg-cover bg-center opacity-[0.22] blur-3xl saturate-[1.15]"
            style={{ backgroundImage: `url(${activeMap.backgroundSrc})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-darker/80 via-dark-darker/40 to-dark-darker/95" />
        </div>
      ) : null}

      <ScreenFrame
        reduceMotion={reduceMotion}
        showParticles={!reduceMotion}
        className="relative z-[2]"
        contentClassName="items-stretch justify-start overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <GlassCard
            glowColor={glow}
            className={`border p-5 sm:p-6 ${
              isOnline
                ? 'border-neon-cyan/25 shadow-[0_0_40px_-12px_rgba(0,240,255,0.35)]'
                : 'border-neon-lime/25 shadow-[0_0_40px_-12px_rgba(132,255,0,0.3)]'
            }`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
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

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="mb-3 text-center font-display text-xs uppercase tracking-wider text-gray-400">
                Select map
              </p>
              <MapPickerGrid
                value={mapId}
                onChange={setMapId}
                variant={variant}
                reduceMotion={reduceMotion}
              />
            </div>
          </GlassCard>

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
    </motion.div>
  );
}
