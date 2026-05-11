import React, { cloneElement, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SwordsIcon,
  ShoppingCartIcon,
  GiftIcon,
  UserIcon,
  SettingsIcon,
  MedalIcon,
  LayersIcon
} from 'lucide-react';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ParticleBackground } from '../components/ui/ParticleBackground';
import { ModalShell } from '../components/ui/ModalShell';
import { MenuMascot } from '../components/ui/MenuMascot';
import { formatCountdown, msUntilLocalMidnight } from '../game/dateUtils';
import { SHOP_CATALOG } from '../game/shopCatalog';
import { CHARACTER_CATALOG } from '../game/charactersCatalog';
import { PLAYABLE_WEAPON_PRESETS } from '../game/weaponsCatalog';
import { StickerAvatar } from '../components/game/StickerAvatar';

interface MainMenuProps {
  onPlay: () => void;
  onStartPractice: () => void;
}

type ModalId = 'shop' | 'daily' | 'settings' | 'loadout' | null;

export function MainMenu({ onPlay, onStartPractice }: MainMenuProps) {
  const progress = useHitBowProgress();
  const [modal, setModal] = useState<ModalId>(null);
  const [countdownTick, setCountdownTick] = useState(0);
  const [shopFlash, setShopFlash] = useState<string | null>(null);

  useEffect(() => {
    if (modal !== 'daily' || progress.canClaimDaily) return;
    const id = window.setInterval(() => setCountdownTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [modal, progress.canClaimDaily]);

  void countdownTick;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 }
    }
  };

  const onBuy = (id: string) => {
    const ok = progress.purchaseItem(id);
    if (!ok) {
      setShopFlash(id);
      window.setTimeout(() => setShopFlash(null), 600);
    }
  };

  return (
    <motion.div
      className="relative w-full h-screen bg-dark-darker overflow-hidden flex flex-col bg-grid-pattern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}>
      <ParticleBackground />

      <ModalShell
        open={modal === 'loadout'}
        onClose={() => setModal(null)}
        titleId="modal-loadout-title"
        title="Roster & loadout">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-neon-cyan mb-3">
              Your fighter
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {CHARACTER_CATALOG.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => progress.setEquippedCharacterId(c.id)}
                  className={`rounded-xl border-2 p-2 aspect-square flex items-center justify-center bg-dark-darker hover:border-neon-cyan transition-colors ${
                    progress.equippedCharacterId === c.id
                      ? 'border-neon-cyan ring-2 ring-neon-cyan/35'
                      : 'border-white/20'
                  }`}
                  aria-label={`Select ${c.displayName}`}>
                  <StickerAvatar
                    characterId={c.id}
                    side="player"
                    accentHex={progress.playerAccentHex}
                    className="h-full w-full"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-neon-magenta mb-3">
              Rival preview (VS screen)
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {CHARACTER_CATALOG.map((c) => (
                <button
                  key={`e-${c.id}`}
                  type="button"
                  onClick={() => progress.setEquippedEnemyCharacterId(c.id)}
                  className={`rounded-xl border-2 p-2 aspect-square flex items-center justify-center bg-dark-darker hover:border-neon-magenta transition-colors ${
                    progress.equippedEnemyCharacterId === c.id
                      ? 'border-neon-magenta ring-2 ring-neon-magenta/35'
                      : 'border-white/20'
                  }`}
                  aria-label={`Rival ${c.displayName}`}>
                  <StickerAvatar
                    characterId={c.id}
                    side="enemy"
                    accentHex="#ff00e5"
                    className="h-full w-full"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-gray-300 mb-3">
              Default projectile (sheet weapons)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {PLAYABLE_WEAPON_PRESETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => progress.setEquippedWeaponId(w.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-left bg-dark-darker hover:border-neon-purple ${
                    progress.equippedWeaponId === w.id
                      ? 'border-neon-purple ring-2 ring-neon-purple/35'
                      : 'border-white/20'
                  }`}>
                  <span className="text-xl">{w.icon}</span>
                  <span className="font-display text-sm text-white">{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={modal === 'shop'}
        onClose={() => setModal(null)}
        titleId="modal-shop-title"
        title="Shop">
        <div className="grid gap-4 sm:grid-cols-2">
          {SHOP_CATALOG.map((item) => {
            const owned = progress.ownedShopItemIds.includes(item.id);
            const equipped = progress.equippedSkinId === item.id;
            const canBuy = !owned && progress.coins >= item.price;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border-4 border-white/25 bg-dark-darker/80 p-4 shadow-[0_6px_0_0_rgba(0,0,0,0.35)] transition-transform ${
                  shopFlash === item.id ? 'animate-pulse scale-95' : ''
                }`}>
                <div className="mb-2 text-3xl">{item.icon}</div>
                <div className="font-display font-bold text-white">{item.name}</div>
                <div className="text-sm text-neon-yellow font-display">
                  {item.price} coins
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!owned && (
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onBuy(item.id)}
                      className="rounded-full border-4 border-neon-cyan bg-neon-cyan/20 px-4 py-2 text-sm font-display font-black text-neon-cyan shadow-[0_4px_0_0_rgba(0,240,255,0.4)] disabled:opacity-40 disabled:shadow-none">
                      BUY
                    </button>
                  )}
                  {owned && (
                    <>
                      <span className="rounded-full border-2 border-white/30 px-3 py-1 text-xs font-display text-gray-300">
                        Owned
                      </span>
                      <button
                        type="button"
                        disabled={equipped}
                        onClick={() => progress.equipItem(item.id)}
                        className="rounded-full border-4 border-neon-lime bg-neon-lime/20 px-4 py-2 text-sm font-display font-black text-neon-lime shadow-[0_4px_0_0_rgba(180,255,0,0.35)] disabled:opacity-50">
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ModalShell>

      <ModalShell
        open={modal === 'daily'}
        onClose={() => setModal(null)}
        titleId="modal-daily-title"
        title="Daily rewards">
        {progress.canClaimDaily ? (
          <div className="text-center">
            <div className="mb-4 text-6xl">🎁</div>
            <p className="mb-2 font-display text-gray-300">
              Streak: {progress.streak} day{progress.streak !== 1 ? 's' : ''}{' '}
              (bonus scales up to 14 days)
            </p>
            <button
              type="button"
              onClick={() => progress.claimDailyReward()}
              className="mt-4 w-full rounded-full border-4 border-neon-yellow bg-neon-yellow/25 py-4 font-display font-black text-xl text-neon-yellow shadow-[0_8px_0_0_rgba(255,234,0,0.45)] active:translate-y-1 active:shadow-none">
              CLAIM
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-display text-lg text-white">
              You already claimed today. Come back tomorrow!
            </p>
            <p className="mt-4 font-display text-neon-cyan">
              Next reward in{' '}
              <span className="font-black">
                {formatCountdown(msUntilLocalMidnight())}
              </span>
            </p>
            <p className="mt-2 text-sm text-gray-400 font-display">
              Current streak: {progress.streak}
            </p>
          </div>
        )}
      </ModalShell>

      <ModalShell
        open={modal === 'settings'}
        onClose={() => setModal(null)}
        titleId="modal-settings-title"
        title="Settings">
        <div className="space-y-5 font-display">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
              Master volume
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress.settings.masterVolume * 100)}
              onChange={(e) =>
                progress.updateSettings({
                  masterVolume: Number(e.target.value) / 100
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
              SFX volume
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress.settings.sfxVolume * 100)}
              onChange={(e) =>
                progress.updateSettings({
                  sfxVolume: Number(e.target.value) / 100
                })
              }
              className="w-full"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={progress.settings.reduceMotion}
              onChange={(e) =>
                progress.updateSettings({ reduceMotion: e.target.checked })
              }
            />
            <span>Reduce motion</span>
          </label>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
              Default aim sensitivity
            </label>
            <input
              type="range"
              min={60}
              max={160}
              step={5}
              value={Math.round(progress.settings.defaultAimSensitivity * 100)}
              onChange={(e) =>
                progress.updateSettings({
                  defaultAimSensitivity: Number(e.target.value) / 100
                })
              }
              className="w-full"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setModal(null);
              onStartPractice();
            }}
            className="w-full rounded-full border-4 border-neon-lime bg-neon-lime/15 py-3 font-black text-neon-lime shadow-[0_6px_0_0_rgba(180,255,0,0.35)]">
            Training mode (practice)
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Reset all saved coins, shop, daily streak, and settings?'
                )
              ) {
                progress.resetProgress();
                setModal(null);
              }
            }}
            className="w-full rounded-full border-4 border-neon-magenta/60 bg-neon-magenta/10 py-3 font-black text-neon-magenta">
            Reset saved progress
          </button>
        </div>
      </ModalShell>

      <motion.div
        className="w-full p-6 flex justify-between items-center z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-dark-card border-4 border-white/40 overflow-hidden shadow-[0_4px_0_0_rgba(0,0,0,0.3)] flex items-center justify-center">
            <UserIcon className="text-neon-cyan" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">{progress.playerName}</h3>
            <div className="flex items-center gap-2 text-sm text-neon-yellow">
              <MedalIcon size={14} />
              <span>Rank {progress.playerRank}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <GlassCard
            variant="sticker"
            className="px-4 py-2 flex items-center gap-2 border-neon-yellow/40">
            <span className="text-neon-yellow font-bold font-display">
              {progress.coins.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 font-display">COINS</span>
          </GlassCard>
          <GlassCard
            variant="sticker"
            interactive
            className="p-2 flex items-center justify-center"
            onClick={() => setModal('settings')}
            aria-label="Settings">
            <SettingsIcon className="text-gray-200" />
          </GlassCard>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 px-4 pb-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 w-full max-w-4xl">
          <MenuMascot className="order-2 md:order-1" />
          <motion.div
            className="order-1 md:order-2 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 1 }}>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neon-cyan to-blue-900 drop-shadow-[0_6px_0_rgba(0,0,0,0.45)]">
              HITBOW
            </h1>
            <p className="text-neon-magenta font-display tracking-[0.5em] mt-2 text-glow-magenta font-bold">
              ARENA
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
          className="mb-10 relative">
          <div className="absolute inset-0 bg-neon-cyan blur-[40px] opacity-30 rounded-full animate-pulse-glow" />
          <NeonButton
            size="xl"
            variant="primary"
            onClick={onPlay}
            className="relative z-10 overflow-hidden group">
            <span className="relative z-10 flex items-center gap-3">
              <SwordsIcon size={32} />
              PLAY NOW
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </NeonButton>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="show">
          <MenuTile
            icon={<ShoppingCartIcon />}
            title="Shop"
            color="magenta"
            onClick={() => setModal('shop')}
          />
          <MenuTile
            icon={<GiftIcon />}
            title="Daily Rewards"
            color="cyan"
            onClick={() => setModal('daily')}
          />
          <MenuTile
            icon={<LayersIcon />}
            title="Roster"
            color="purple"
            onClick={() => setModal('loadout')}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function MenuTile({
  icon,
  title,
  color,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  onClick: () => void;
}) {
  const colorMap: Record<
    string,
    'cyan' | 'magenta' | 'purple' | 'lime' | 'none'
  > = {
    cyan: 'cyan',
    magenta: 'magenta',
    purple: 'purple',
    lime: 'lime',
    yellow: 'none'
  };
  const textColors: Record<string, string> = {
    cyan: 'text-neon-cyan',
    magenta: 'text-neon-magenta',
    purple: 'text-neon-purple',
    lime: 'text-neon-lime',
    yellow: 'text-neon-yellow'
  };
  return (
    <motion.div
      variants={{
        hidden: { y: 24, opacity: 0 },
        show: { y: 0, opacity: 1 }
      }}>
      <GlassCard
        variant="sticker"
        interactive
        glowColor={colorMap[color]}
        className="p-6 flex flex-col items-center justify-center gap-3 min-h-[8.5rem] group"
        onClick={onClick}>
        <div
          className={`${textColors[color]} transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
          {cloneElement(icon as React.ReactElement, { size: 36 })}
        </div>
        <span className="font-display font-black text-sm tracking-wider text-white">
          {title}
        </span>
      </GlassCard>
    </motion.div>
  );
}
