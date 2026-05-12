import React, { cloneElement, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SwordsIcon,
  ShoppingCartIcon,
  GiftIcon,
  UserIcon,
  SettingsIcon,
  MedalIcon,
  LayersIcon,
  BarChart3,
  UsersIcon
} from 'lucide-react';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ParticleBackground } from '../components/ui/ParticleBackground';
import { ModalShell } from '../components/ui/ModalShell';
import { SectionHeading } from '../components/ui/SectionHeading';
import { NeonPillBadge } from '../components/ui/NeonPillBadge';
import { AccentSwatch } from '../components/ui/AccentSwatch';
import { MenuMascot } from '../components/ui/MenuMascot';
import { formatCountdown, msUntilLocalMidnight } from '../game/dateUtils';
import { SHOP_CATALOG } from '../game/shopCatalog';
import { CHARACTER_CATALOG } from '../game/charactersCatalog';
import { PLAYABLE_WEAPON_PRESETS } from '../game/weaponsCatalog';
import {
  readMatchHistory,
  summarizeHistory,
  type MatchHistoryEntry
} from '../game/matchHistory';
import { StickerAvatar } from '../components/game/StickerAvatar';

interface MainMenuProps {
  onPlay: () => void;
  onStartPractice: () => void;
  onStartLocal2p: () => void;
}

type ModalId = 'shop' | 'daily' | 'settings' | 'loadout' | 'stats' | null;

export function MainMenu({ onPlay, onStartPractice, onStartLocal2p }: MainMenuProps) {
  const progress = useHitBowProgress();
  const reduceMotion = progress.settings.reduceMotion;
  const [modal, setModal] = useState<ModalId>(null);
  const [countdownTick, setCountdownTick] = useState(0);
  const [shopFlash, setShopFlash] = useState<string | null>(null);
  const [shopFeedback, setShopFeedback] = useState('');
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);

  const statsSummary = useMemo(
    () => summarizeHistory(matchHistory),
    [matchHistory]
  );

  useEffect(() => {
    if (modal === 'stats') setMatchHistory(readMatchHistory());
  }, [modal]);

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
    const item = SHOP_CATALOG.find((x) => x.id === id);
    const owned = item && progress.ownedShopItemIds.includes(id);
    const canAfford = item && progress.coins >= item.price;
    const ok = progress.purchaseItem(id);
    if (ok) {
      setShopFeedback(`Purchased ${item?.name ?? 'item'}. Equipped.`);
    } else if (owned) {
      setShopFeedback('Already owned.');
    } else if (!canAfford) {
      setShopFeedback('Not enough coins.');
    } else {
      setShopFeedback('Could not complete purchase.');
    }
    window.setTimeout(() => setShopFeedback(''), 4000);
    if (!ok) {
      setShopFlash(id);
      window.setTimeout(() => setShopFlash(null), 600);
    }
  };

  return (
    <motion.div
      className="relative flex min-h-dvh h-dvh w-full flex-col overflow-hidden bg-dark-darker bg-grid-pattern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}>
      <ParticleBackground reduceMotion={progress.settings.reduceMotion} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-dark-darker/95 via-transparent to-dark-darker/90"
      />

      <ModalShell
        open={modal === 'loadout'}
        onClose={() => setModal(null)}
        titleId="modal-loadout-title"
        title="Roster & loadout">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <SectionHeading colorClassName="text-neon-cyan" className="mb-3">
              Your fighter
            </SectionHeading>
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
            <SectionHeading colorClassName="text-neon-magenta" className="mb-3">
              Rival preview (VS screen)
            </SectionHeading>
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
            <SectionHeading colorClassName="text-gray-300" className="mb-3">
              Default projectile (sheet weapons)
            </SectionHeading>
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
        open={modal === 'stats'}
        onClose={() => setModal(null)}
        titleId="modal-stats-title"
        title="Your stats">
        <p className="mb-4 text-xs font-display text-gray-400">
          Last 10 matches on this device (offline). Updates after each game ends.
        </p>
        {matchHistory.length === 0 ? (
          <p className="text-center font-display text-gray-400">
            No matches recorded yet. Play a standard or training match.
          </p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-3 gap-3 text-center font-display">
              <GlassCard variant="sticker" className="p-3 border-neon-cyan/35">
                <div className="text-2xl font-black text-neon-cyan">
                  {statsSummary.wins}
                </div>
                <div className="text-[10px] uppercase text-gray-400">Wins</div>
              </GlassCard>
              <GlassCard variant="sticker" className="p-3 border-neon-magenta/35">
                <div className="text-2xl font-black text-neon-magenta">
                  {statsSummary.losses}
                </div>
                <div className="text-[10px] uppercase text-gray-400">Losses</div>
              </GlassCard>
              <GlassCard variant="sticker" className="p-3 border-neon-yellow/35">
                <div className="text-2xl font-black text-neon-yellow">
                  {statsSummary.avgAccuracy.toFixed(0)}%
                </div>
                <div className="text-[10px] uppercase text-gray-400">Avg acc</div>
              </GlassCard>
            </div>
            <ul className="max-h-48 space-y-2 overflow-y-auto pr-1 font-display text-sm">
              {matchHistory.map((e, i) => (
                <li
                  key={`${e.at}-${i}`}
                  className="flex justify-between gap-2 rounded-lg border border-white/10 bg-dark-darker/80 px-3 py-2">
                  <span className="text-gray-400">
                    {new Date(e.at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span
                    className={
                      e.winner === 'player'
                        ? 'text-neon-cyan font-bold'
                        : 'text-neon-magenta font-bold'
                    }>
                    {e.winner === 'player' ? 'Win' : 'Loss'}
                  </span>
                  <span className="text-gray-500">
                    {e.mode === 'practice' ? 'Train' : 'Rank'} · {e.playerAccuracy.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </ModalShell>

      <ModalShell
        open={modal === 'shop'}
        onClose={() => setModal(null)}
        titleId="modal-shop-title"
        title="Shop">
        {/* Feedback banner */}
        <div
          className={`mb-3 min-h-[2.75rem] rounded-xl border px-3 py-2 text-center text-sm font-display transition-colors ${
            shopFeedback
              ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
              : 'border-transparent text-transparent'
          }`}
          role="status"
          aria-live="polite">
          {shopFeedback || '\u00a0'}
        </div>

        {/* Active accent preview strip */}
        {(() => {
          const activeSkin = SHOP_CATALOG.find(
            (x) => x.id === progress.equippedSkinId
          ) ?? SHOP_CATALOG[0];
          return (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-dark-darker/60 px-3 py-2">
              <SectionHeading
                colorClassName="text-gray-500"
                className="shrink-0">
                Your accent
              </SectionHeading>
              <AccentSwatch
                accentHex={activeSkin?.accentHex ?? '#00f0ff'}
                size="sm"
                alpha={0.35}
              />
              <span className="font-display text-sm font-bold text-white">
                {activeSkin?.name}
              </span>
              <span className="ml-auto font-mono text-xs text-gray-400">
                {activeSkin?.accentHex}
              </span>
            </div>
          );
        })()}

        {/* Item grid */}
        <div className="max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            {SHOP_CATALOG.map((item) => {
              const owned = progress.ownedShopItemIds.includes(item.id);
              const equipped = progress.equippedSkinId === item.id;
              const canBuy = !owned && progress.coins >= item.price;
              return (
                <GlassCard
                  key={item.id}
                  variant="sticker"
                  className={`relative flex flex-col gap-2 p-4 transition-transform ${
                    shopFlash === item.id && !reduceMotion
                      ? 'animate-pulse scale-95'
                      : ''
                  }`}
                  style={
                    equipped
                      ? {
                          outline: `2px solid ${item.accentHex}`,
                          outlineOffset: '2px',
                          boxShadow: `0 0 18px ${item.accentHex}55`
                        }
                      : undefined
                  }>
                  {/* Owned badge — top right */}
                  {owned && !equipped && (
                    <NeonPillBadge
                      label="Owned"
                      variant="lime"
                      className="absolute right-3 top-3"
                    />
                  )}
                  {equipped && (
                    <NeonPillBadge
                      label="Equipped ✓"
                      variant="accent"
                      accentHex={item.accentHex}
                      className="absolute right-3 top-3"
                    />
                  )}

                  {/* Swatch + icon */}
                  <AccentSwatch
                    accentHex={item.accentHex}
                    size="lg"
                    alpha={0.35}
                    className="text-xl">
                    {item.icon}
                  </AccentSwatch>

                  {/* Name & price */}
                  <div>
                    <div className="font-display font-bold text-white leading-tight">
                      {item.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 font-display text-sm text-neon-yellow">
                      <span>🪙</span>
                      <span>{item.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-1">
                    {!owned && (
                      <NeonButton
                        type="button"
                        size="sm"
                        variant="primary"
                        disabled={!canBuy}
                        className={!canBuy ? 'opacity-50 saturate-50' : ''}
                        onClick={() => onBuy(item.id)}>
                        BUY
                      </NeonButton>
                    )}
                    {owned && !equipped && (
                      <NeonButton
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => progress.equipItem(item.id)}>
                        EQUIP
                      </NeonButton>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
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
              className="w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
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
              className="w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={progress.settings.reduceMotion}
              onChange={(e) =>
                progress.updateSettings({ reduceMotion: e.target.checked })
              }
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            />
            <span>Reduce motion</span>
          </label>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
              Display name
            </label>
            <input
              type="text"
              maxLength={24}
              defaultValue={progress.playerName}
              key={progress.playerName}
              onBlur={(e) => progress.updatePlayerName(e.target.value)}
              className="w-full rounded-xl border-2 border-white/25 bg-dark-darker/90 px-3 py-2 font-display text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
              Standard match difficulty (AI)
            </label>
            <div className="flex flex-wrap gap-2">
              {(['casual', 'standard', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => progress.updateSettings({ difficulty: d })}
                  className={`rounded-full border-2 px-3 py-1 text-xs font-display font-black uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan ${
                    progress.settings.difficulty === d
                      ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                      : 'border-white/25 text-gray-300 hover:border-white/50'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={progress.settings.musicEnabled}
              onChange={(e) =>
                progress.updateSettings({ musicEnabled: e.target.checked })
              }
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            />
            <span>Ambient music (soft synth pad)</span>
          </label>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
              Music volume
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress.settings.musicVolume * 100)}
              onChange={(e) =>
                progress.updateSettings({
                  musicVolume: Number(e.target.value) / 100
                })
              }
              className="w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            />
          </div>
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
              className="w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
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
        className="z-10 flex w-full flex-wrap items-center justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/40 bg-dark-card shadow-[0_4px_0_0_rgba(0,0,0,0.3)] sm:h-12 sm:w-12">
            <UserIcon className="text-neon-cyan" size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-bold sm:text-lg">
              {progress.playerName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-neon-yellow sm:text-sm">
              <MedalIcon size={14} />
              <span>Rank {progress.playerRank}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 sm:gap-4">
          <GlassCard
            variant="sticker"
            className="flex items-center gap-1.5 border-neon-yellow/40 px-2 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
            <span className="font-display text-sm font-bold text-neon-yellow sm:text-base">
              {progress.coins.toLocaleString()}
            </span>
            <span className="font-display text-[10px] text-gray-400 sm:text-xs">
              COINS
            </span>
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

      <div className="z-10 flex flex-1 flex-col items-center justify-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mb-6 flex w-full max-w-4xl flex-col items-center justify-center gap-4 md:mb-8 md:flex-row md:gap-6">
          <MenuMascot className="order-2 md:order-1" />
          <motion.div
            className="order-1 md:order-2 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 1 }}>
            <h1 className="text-4xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neon-cyan to-blue-900 drop-shadow-[0_6px_0_rgba(0,0,0,0.45)] sm:text-6xl md:text-8xl">
              HITBOW
            </h1>
            <p className="mt-2 font-display text-xs font-bold tracking-[0.35em] text-glow-magenta text-neon-magenta sm:text-base sm:tracking-[0.5em]">
              ARENA
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
          className="mb-10 relative">
          <div
            className={`absolute inset-0 bg-neon-cyan blur-[40px] opacity-30 rounded-full ${
              reduceMotion ? '' : 'animate-pulse-glow'
            }`}
          />
          <NeonButton
            size="xl"
            variant="primary"
            onClick={onPlay}
            className="relative z-10 overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <SwordsIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              PLAY NOW
            </span>
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${
                reduceMotion
                  ? ''
                  : 'group-hover:animate-[shimmer_1.5s_infinite]'
              }`}
            />
          </NeonButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-8">
          <NeonButton
            size="lg"
            variant="secondary"
            onClick={onStartLocal2p}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-2">
            <UsersIcon size={24} />
            Local 2 players
          </NeonButton>
        </motion.div>

        <motion.div
          className="grid w-full max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4"
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
          <MenuTile
            icon={<BarChart3 />}
            title="Stats"
            color="yellow"
            onClick={() => setModal('stats')}
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
        className="group flex min-h-[6.5rem] flex-col items-center justify-center gap-2 p-4 sm:min-h-[8.5rem] sm:gap-3 sm:p-6"
        onClick={onClick}>
        <div
          className={`${textColors[color]} transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
          {cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <span className="text-center font-display text-xs font-black tracking-wider text-white sm:text-sm">
          {title}
        </span>
      </GlassCard>
    </motion.div>
  );
}
