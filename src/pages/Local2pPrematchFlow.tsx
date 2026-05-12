import { useState } from 'react';
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

interface Local2pPrematchFlowProps {
  onComplete: (loadout: Local2pLoadout) => void;
  onCancel: () => void;
}

type Step = 'p1' | 'p2' | 'versus';

/** v2: could restrict picks to shop-owned items like solo roster. */
export function Local2pPrematchFlow({
  onComplete,
  onCancel
}: Local2pPrematchFlowProps) {
  const progress = useHitBowProgress();
  const reduceMotion = progress.settings.reduceMotion;

  const [step, setStep] = useState<Step>('p1');
  const [p1CharacterId, setP1CharacterId] = useState<CharacterId>(
    DEFAULT_PLAYER_CHARACTER_ID
  );
  const [p1WeaponId, setP1WeaponId] = useState(DEFAULT_WEAPON_ID);
  const [p2CharacterId, setP2CharacterId] = useState<CharacterId>(
    DEFAULT_ENEMY_CHARACTER_ID
  );
  const [p2WeaponId, setP2WeaponId] = useState(DEFAULT_WEAPON_ID);

  const p1Weapon =
    WEAPON_PRESETS.find((w) => w.id === p1WeaponId) ?? WEAPON_PRESETS[0];
  const p2Weapon =
    WEAPON_PRESETS.find((w) => w.id === p2WeaponId) ?? WEAPON_PRESETS[0];

  const weaponList = PLAYABLE_WEAPON_PRESETS;

  return (
    <motion.div
      className="relative w-full h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}>
      <ScreenFrame
        reduceMotion={reduceMotion}
        contentClassName="items-stretch justify-start pt-6 pb-8 px-4 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UsersIcon className="text-neon-lime shrink-0" size={28} />
              <div>
                <SectionHeading colorClassName="text-neon-lime" className="mb-0">
                  Local 2 players
                </SectionHeading>
                <p className="text-xs text-gray-400 font-display mt-1">
                  One device — pass between turns. Full catalog for this mode.
                </p>
              </div>
            </div>
            <NeonButton variant="secondary" size="sm" onClick={onCancel}>
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
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <NeonButton variant="secondary" onClick={() => setStep('p2')}>
                  Back
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    onComplete({
                      p1CharacterId,
                      p1WeaponId,
                      p2CharacterId,
                      p2WeaponId
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
