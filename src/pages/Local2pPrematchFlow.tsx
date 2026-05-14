import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon } from 'lucide-react';
import type { Local2pLoadout } from '../types';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ScreenFrame } from '../components/ui/ScreenFrame';
import { SectionHeading } from '../components/ui/SectionHeading';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import { CHARACTER_CATALOG } from '../game/charactersCatalog';
import type { CharacterId } from '../game/charactersCatalog';
import {
  DEFAULT_PLAYER_CHARACTER_ID,
  DEFAULT_ENEMY_CHARACTER_ID
} from '../game/charactersCatalog';
import { PLAYABLE_WEAPON_PRESETS } from '../game/weaponsCatalog';
import { DEFAULT_WEAPON_ID } from '../game/weaponsCatalog';
import { WEAPON_PRESETS } from '../game/weapons';
import { getMapById } from '../game/maps';
import type { MapId } from '../types';
import { LOCAL2P_DEFAULT_KEYS } from '../config/controlsConfig';

interface Local2pPrematchFlowProps {
  /** Arena chosen on the map-select screen before this flow. */
  presetMapId: MapId;
  onComplete: (loadout: Local2pLoadout) => void;
  onCancel: () => void;
}

type Step = 'p1' | 'p2' | 'versus' | 'controls';

/** v2: could restrict picks to shop-owned items like solo roster. */
export function Local2pPrematchFlow({
  presetMapId,
  onComplete,
  onCancel
}: Local2pPrematchFlowProps) {
  const progress = useHitBowProgress();
  const reduceMotion = progress.settings.reduceMotion;

  const [step, setStep] = useState<Step>('p1');
  const [p1Ready, setP1Ready] = useState(false);
  const [p2Ready, setP2Ready] = useState(false);
  const [p1CharacterId, setP1CharacterId] = useState<CharacterId>(
    DEFAULT_PLAYER_CHARACTER_ID
  );
  const [p1WeaponId, setP1WeaponId] = useState(DEFAULT_WEAPON_ID);
  const [p2CharacterId, setP2CharacterId] = useState<CharacterId>(
    DEFAULT_ENEMY_CHARACTER_ID
  );
  const [p2WeaponId, setP2WeaponId] = useState(DEFAULT_WEAPON_ID);

  const arena = getMapById(presetMapId);

  const p1Weapon =
    WEAPON_PRESETS.find((w) => w.id === p1WeaponId) ?? WEAPON_PRESETS[0];
  const p2Weapon =
    WEAPON_PRESETS.find((w) => w.id === p2WeaponId) ?? WEAPON_PRESETS[0];

  const weaponList = PLAYABLE_WEAPON_PRESETS;

  useEffect(() => {
    if (step !== 'controls') return;
    const onKey = (e: KeyboardEvent) => {
      const c = e.code;
      const p1 = LOCAL2P_DEFAULT_KEYS.p1;
      const p2 = LOCAL2P_DEFAULT_KEYS.p2;
      if (
        c === p1.moveLeft ||
        c === p1.moveRight ||
        c === p1.jump ||
        c === p1.charge
      ) {
        setP1Ready(true);
      }
      if (
        c === p2.moveLeft ||
        c === p2.moveRight ||
        c === p2.jump ||
        c === p2.charge
      ) {
        setP2Ready(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return (
    <motion.div
      className="relative min-h-dvh h-dvh w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}>
      <ScreenFrame
        reduceMotion={reduceMotion}
        contentClassName="items-stretch justify-start overflow-y-auto px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <UsersIcon className="text-neon-lime shrink-0" size={28} />
              <div>
                <SectionHeading colorClassName="text-neon-lime" className="mb-0">
                  Local 2 players
                </SectionHeading>
                <p className="text-xs text-gray-400 font-display mt-1">
                  One keyboard — real-time duel. Full catalog for this mode.
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

          {step === 'p1' && (
            <LoadoutStepPanel
              title="Player 1 — choose fighter & weapon"
              accent="cyan"
              characterId={p1CharacterId}
              onCharacter={setP1CharacterId}
              weaponId={p1WeaponId}
              onWeapon={setP1WeaponId}
              stickerSide="player"
              stickerAccent={progress.playerAccentHex}
              weaponList={weaponList}
              onConfirm={() => setStep('p2')}
            />
          )}

          {step === 'p2' && (
            <LoadoutStepPanel
              title="Player 2 — choose fighter & weapon"
              accent="magenta"
              characterId={p2CharacterId}
              onCharacter={setP2CharacterId}
              weaponId={p2WeaponId}
              onWeapon={setP2WeaponId}
              stickerSide="enemy"
              stickerAccent="#ff00e5"
              weaponList={weaponList}
              onConfirm={() => setStep('versus')}
              onBack={() => setStep('p1')}
            />
          )}

          {step === 'versus' && (
            <div className="space-y-6">
              <SectionHeading colorClassName="text-white" className="text-center">
                Versus
              </SectionHeading>
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-6">
                <GlassCard
                  variant="sticker"
                  className="flex-1 flex flex-col items-center gap-4 p-6 border-neon-cyan/40">
                  <span className="font-display font-black text-neon-cyan tracking-widest text-sm">
                    PLAYER 1
                  </span>
                  <div className="w-24 h-24 rounded-2xl border-2 border-neon-cyan overflow-hidden bg-dark-darker p-1">
                    <StickerAvatar
                      characterId={p1CharacterId}
                      side="player"
                      accentHex={progress.playerAccentHex}
                      className="h-full w-full"
                    />
                  </div>
                  <span className="font-display text-sm text-gray-200 text-center">
                    {p1Weapon?.icon} {p1Weapon?.name}
                  </span>
                </GlassCard>
                <div className="flex items-center justify-center font-display font-black text-3xl text-gray-500">
                  VS
                </div>
                <GlassCard
                  variant="sticker"
                  className="flex-1 flex flex-col items-center gap-4 p-6 border-neon-magenta/40">
                  <span className="font-display font-black text-neon-magenta tracking-widest text-sm">
                    PLAYER 2
                  </span>
                  <div className="w-24 h-24 rounded-2xl border-2 border-neon-magenta overflow-hidden bg-dark-darker p-1">
                    <StickerAvatar
                      characterId={p2CharacterId}
                      side="enemy"
                      accentHex="#ff00e5"
                      className="h-full w-full"
                    />
                  </div>
                  <span className="font-display text-sm text-gray-200 text-center">
                    {p2Weapon?.icon} {p2Weapon?.name}
                  </span>
                </GlassCard>
              </div>
              <GlassCard
                variant="default"
                className="mx-auto max-w-lg overflow-hidden border-2 border-neon-lime/25 bg-dark-card/80 p-0 shadow-glass backdrop-blur-md">
                <div
                  className="relative h-32 w-full bg-cover bg-center sm:h-36"
                  style={{ backgroundImage: `url(${arena.previewSrc})` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-darker/90 via-dark-darker/40 to-transparent" />
                  <div className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center p-4">
                    <p className="font-display text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Arena
                    </p>
                    <p className="font-display text-lg font-black text-white">{arena.name}</p>
                    <p className="font-display text-xs text-neon-lime/90">{arena.theme}</p>
                    <p className="font-display text-[11px] text-gray-400">{arena.biome}</p>
                  </div>
                </div>
              </GlassCard>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <NeonButton variant="secondary" onClick={() => setStep('p2')}>
                  Back
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setP1Ready(false);
                    setP2Ready(false);
                    setStep('controls');
                  }}>
                  Controls &amp; ready
                </NeonButton>
              </div>
            </div>
          )}

          {step === 'controls' && (
            <div className="space-y-6">
              <SectionHeading colorClassName="text-neon-lime" className="text-center">
                Controls &amp; ready
              </SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <GlassCard
                  variant="sticker"
                  className="space-y-3 border-neon-cyan/40 p-5">
                  <p className="font-display text-xs font-black uppercase tracking-widest text-neon-cyan">
                    Player 1
                  </p>
                  <ul className="space-y-2 text-sm text-gray-200 font-display">
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Move</span>
                      <Kbd>A</Kbd>
                      <span className="text-gray-600">/</span>
                      <Kbd>D</Kbd>
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Jump</span>
                      <Kbd>W</Kbd>
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Charge / shoot</span>
                      <Kbd>Space</Kbd>
                      <span className="text-[11px] text-gray-500">hold, release</span>
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Weapon</span>
                      <Kbd>1</Kbd>
                      <span className="text-gray-600">–</span>
                      <Kbd>5</Kbd>
                      <span className="text-[11px] text-gray-500">first five kits</span>
                    </li>
                  </ul>
                  <div
                    className={`rounded-lg border px-3 py-2 text-center font-display text-xs font-bold ${
                      p1Ready
                        ? 'border-neon-lime/60 bg-neon-lime/10 text-neon-lime'
                        : 'border-white/15 bg-dark-darker/80 text-gray-400'
                    }`}>
                    {p1Ready ? 'Ready' : 'Press any P1 key to ready'}
                  </div>
                </GlassCard>
                <GlassCard
                  variant="sticker"
                  className="space-y-3 border-neon-magenta/40 p-5">
                  <p className="font-display text-xs font-black uppercase tracking-widest text-neon-magenta">
                    Player 2
                  </p>
                  <ul className="space-y-2 text-sm text-gray-200 font-display">
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Move</span>
                      <Kbd>←</Kbd>
                      <span className="text-gray-600">/</span>
                      <Kbd>→</Kbd>
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Jump</span>
                      <Kbd>↑</Kbd>
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Charge / shoot</span>
                      <Kbd>Enter</Kbd>
                      <span className="text-[11px] text-gray-500">hold, release</span>
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Weapon</span>
                      <Kbd>Num 1</Kbd>
                      <span className="text-gray-600">–</span>
                      <Kbd>Num 5</Kbd>
                      <span className="text-[11px] text-gray-500">first five kits</span>
                    </li>
                  </ul>
                  <div
                    className={`rounded-lg border px-3 py-2 text-center font-display text-xs font-bold ${
                      p2Ready
                        ? 'border-neon-lime/60 bg-neon-lime/10 text-neon-lime'
                        : 'border-white/15 bg-dark-darker/80 text-gray-400'
                    }`}>
                    {p2Ready ? 'Ready' : 'Press any P2 key to ready'}
                  </div>
                </GlassCard>
              </div>
              <GlassCard
                variant="default"
                className="mx-auto max-w-lg overflow-hidden border-2 border-neon-lime/25 bg-dark-card/80 p-0 shadow-glass backdrop-blur-md">
                <div
                  className="relative h-32 w-full bg-cover bg-center sm:h-36"
                  style={{ backgroundImage: `url(${arena.previewSrc})` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-darker/90 via-dark-darker/40 to-transparent" />
                  <div className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center p-4">
                    <p className="font-display text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Arena
                    </p>
                    <p className="font-display text-lg font-black text-white">{arena.name}</p>
                    <p className="font-display text-xs text-neon-lime/90">{arena.theme}</p>
                  </div>
                </div>
              </GlassCard>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <NeonButton variant="secondary" onClick={() => setStep('versus')}>
                  Back
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="lg"
                  disabled={!p1Ready || !p2Ready}
                  onClick={() =>
                    onComplete({
                      p1CharacterId,
                      p1WeaponId,
                      p2CharacterId,
                      p2WeaponId,
                      mapId: presetMapId
                    })
                  }>
                  Start match
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </ScreenFrame>
    </motion.div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-white/20 bg-dark-darker/95 px-2 py-1 font-mono text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {children}
    </kbd>
  );
}

function LoadoutStepPanel({
  title,
  accent,
  characterId,
  onCharacter,
  weaponId,
  onWeapon,
  stickerSide,
  stickerAccent,
  weaponList,
  onConfirm,
  onBack
}: {
  title: string;
  accent: 'cyan' | 'magenta';
  characterId: CharacterId;
  onCharacter: (id: CharacterId) => void;
  weaponId: string;
  onWeapon: (id: string) => void;
  stickerSide: 'player' | 'enemy';
  stickerAccent: string;
  weaponList: typeof PLAYABLE_WEAPON_PRESETS;
  onConfirm: () => void;
  onBack?: () => void;
}) {
  const ring =
    accent === 'cyan'
      ? 'border-neon-cyan ring-neon-cyan/35'
      : 'border-neon-magenta ring-neon-magenta/35';
  const hover =
    accent === 'cyan'
      ? 'hover:border-neon-cyan'
      : 'hover:border-neon-magenta';

  return (
    <div className="space-y-6">
      <SectionHeading
        colorClassName={accent === 'cyan' ? 'text-neon-cyan' : 'text-neon-magenta'}
        className="text-center">
        {title}
      </SectionHeading>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 font-display mb-2">
          Character
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[40vh] overflow-y-auto pr-1">
          {CHARACTER_CATALOG.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCharacter(c.id)}
              className={`rounded-xl border-2 p-1.5 aspect-square flex items-center justify-center bg-dark-darker transition-colors ${hover} ${
                characterId === c.id
                  ? `border-2 ${ring} ring-2`
                  : 'border-white/20'
              }`}
              aria-label={c.displayName}>
              <StickerAvatar
                characterId={c.id}
                side={stickerSide}
                accentHex={stickerAccent}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 font-display mb-2">
          Weapon
        </p>
        <div className="grid gap-2 sm:grid-cols-2 max-h-[36vh] overflow-y-auto pr-1">
          {weaponList.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onWeapon(w.id)}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-left bg-dark-darker transition-colors ${hover} ${
                weaponId === w.id
                  ? `border-2 ${ring} ring-2`
                  : 'border-white/20'
              }`}>
              <span className="text-xl">{w.icon}</span>
              <span className="font-display text-sm text-white">{w.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {onBack && (
          <NeonButton variant="secondary" onClick={onBack}>
            Back
          </NeonButton>
        )}
        <NeonButton variant="primary" size="lg" onClick={onConfirm}>
          Confirm
        </NeonButton>
      </div>
    </div>
  );
}
