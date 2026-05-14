import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  CoinsIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  MapIcon,
  LayoutGridIcon
} from 'lucide-react';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ScreenFrame } from '../components/ui/ScreenFrame';
import { SectionHeading } from '../components/ui/SectionHeading';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import type { CharacterId } from '../game/charactersCatalog';
import type { MatchResult, MatchRewardResult } from '../game/matchResult';
import { playUiTick } from '../game/gameAudio';

interface VictoryScreenProps {
  winner: 'player' | 'enemy';
  matchResult: MatchResult | null;
  /** When set, victory avatars use session stickers instead of equipped roster. */
  local2pCharacterIds?: { p1: CharacterId; p2: CharacterId };
  onMainMenu: () => void;
  onPlayAgain: () => void;
  onChangeMap?: () => void;
  onChangeMode?: () => void;
}

const XP_PER_RANK = 600;

function xpProgressPercent(xp: number): number {
  const inRank = xp % XP_PER_RANK;
  return (inRank / XP_PER_RANK) * 100;
}

export function VictoryScreen({
  winner,
  matchResult,
  local2pCharacterIds,
  onMainMenu,
  onPlayAgain,
  onChangeMap,
  onChangeMode
}: VictoryScreenProps) {
  const progress = useHitBowProgress();
  const sfxMuted =
    progress.settings.masterVolume * progress.settings.sfxVolume < 0.001;
  const isLocal2p = matchResult?.mode === 'local2p';
  const isWin = winner === 'player';
  const playerWon = isLocal2p ? winner === 'player' : isWin;
  const [xpProgress, setXpProgress] = useState(xpProgressPercent(progress.playerXp));
  const [coins, setCoins] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const [victoryRank, setVictoryRank] = useState(progress.playerRank);
  const rewardedRef = useRef(false);

  const safeResult = useMemo<MatchResult>(
    () =>
      matchResult ?? {
        winner,
        mode: 'standard',
        turns: 0,
        player: {
          name: progress.playerName,
          rank: progress.playerRank,
          damage: 0,
          shots: 0,
          hits: 0,
          accuracy: 0
        },
        enemy: {
          name: 'SKULL RAIDER',
          rank: 14,
          damage: 0,
          shots: 0,
          hits: 0,
          accuracy: 0
        }
      },
    [matchResult, winner, progress.playerName, progress.playerRank]
  );

  useEffect(() => {
    playUiTick(sfxMuted);
  }, []);

  useEffect(() => {
    if (rewardedRef.current) return;
    rewardedRef.current = true;

    const reward: MatchRewardResult = progress.applyMatchRewards(safeResult);
    setXpGain(reward.xpAwarded);
    setVictoryRank(reward.newRank);
    setXpProgress(xpProgressPercent(reward.previousPlayerXp));
    const duration = 1200;
    const steps = 30;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep += 1;
      setCoins(Math.floor((currentStep / steps) * reward.coinsAwarded));
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
    const t = window.setTimeout(() => {
      setXpProgress(xpProgressPercent(reward.newPlayerXp));
    }, 400);
    return () => {
      clearInterval(timer);
      window.clearTimeout(t);
    };
  }, [progress, safeResult]);

  const titleColor = isLocal2p
    ? winner === 'player'
      ? 'text-neon-cyan text-glow-cyan'
      : 'text-neon-magenta text-glow-magenta'
    : isWin
      ? 'text-neon-cyan text-glow-cyan'
      : 'text-neon-magenta text-glow-magenta';
  const titleText = isLocal2p
    ? winner === 'player'
      ? 'PLAYER 1 WINS'
      : 'PLAYER 2 WINS'
    : isWin
      ? 'VICTORY'
      : 'DEFEAT';
  return (
    <motion.div
      className="relative min-h-dvh h-dvh w-full overflow-hidden"
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      transition={{
        duration: 0.8
      }}>
      <ScreenFrame
        reduceMotion={progress.settings.reduceMotion}
        contentClassName="items-center justify-center">
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[min(100vw,800px)] w-[min(100vw,800px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] opacity-20 sm:blur-[100px] ${
            playerWon ? 'bg-neon-cyan' : 'bg-neon-magenta'
          }`}
        />

        <div className="z-10 flex w-full max-w-2xl flex-col items-center px-3 sm:px-4">
        <motion.div
          initial={{
            y: -50,
            scale: 0.5,
            opacity: 0
          }}
          animate={{
            y: 0,
            scale: 1,
            opacity: 1
          }}
          transition={{
            type: 'spring',
            bounce: 0.5,
            duration: 1
          }}
          className="mb-8 text-center sm:mb-12">
          <TrophyIcon
            className={`mx-auto mb-3 h-12 w-12 sm:mb-4 sm:h-16 sm:w-16 ${
              isLocal2p ? 'text-neon-yellow' : isWin ? 'text-neon-yellow' : 'text-gray-600'
            }`}
          />
          <SectionHeading
            colorClassName="text-gray-500"
            className="mb-2">
            HITBOW
          </SectionHeading>
          <h1
            className={`font-display text-3xl font-black tracking-widest sm:text-5xl md:text-7xl lg:text-9xl ${titleColor}`}>
            {titleText}
          </h1>
        </motion.div>

        <motion.div
          initial={{
            y: 50,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.5,
            duration: 0.5
          }}
          className="w-full">
          <GlassCard
            glowColor={isWin ? 'cyan' : 'magenta'}
            className="flex w-full flex-col gap-6 border border-white/12 p-4 shadow-glass backdrop-blur-md sm:gap-8 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pb-6">
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div
                  className={`w-16 h-16 rounded-xl border-2 ${isWin ? 'border-neon-cyan shadow-neon-cyan' : 'border-gray-600'} overflow-hidden bg-dark-darker p-1`}>
                  <StickerAvatar
                    characterId={
                      isLocal2p && local2pCharacterIds
                        ? local2pCharacterIds.p1
                        : progress.equippedCharacterId
                    }
                    side="player"
                    accentHex={progress.playerAccentHex}
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <div className="truncate font-display text-base font-bold sm:text-lg">
                    {safeResult.player.name}
                  </div>
                  <div className="text-xs text-gray-400 sm:text-sm">
                    Dmg {safeResult.player.damage} - Acc {safeResult.player.accuracy}%
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-center font-display text-xl font-black text-gray-500 sm:text-2xl">
                VS
              </div>

              <div className="flex min-w-0 flex-1 flex-row-reverse items-center gap-3 text-right sm:gap-4">
                <div
                  className={`w-16 h-16 rounded-xl border-2 ${!isWin ? 'border-neon-magenta shadow-neon-magenta' : 'border-gray-600'} overflow-hidden bg-dark-darker p-1`}>
                  <StickerAvatar
                    characterId={
                      isLocal2p && local2pCharacterIds
                        ? local2pCharacterIds.p2
                        : progress.equippedEnemyCharacterId
                    }
                    side="enemy"
                    accentHex="#ff00e5"
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <div className="truncate font-display text-base font-bold sm:text-lg">
                    {safeResult.enemy.name}
                  </div>
                  <div className="text-xs text-gray-400 sm:text-sm">
                    Dmg {safeResult.enemy.damage} - Acc {safeResult.enemy.accuracy}%
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {safeResult.extended && (
                <GlassCard
                  variant="default"
                  className="border border-white/10 bg-dark-darker/50 p-4 shadow-glass backdrop-blur-md">
                  <p className="font-display text-xs font-black uppercase tracking-widest text-neon-cyan/90 mb-3">
                    Match summary
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-display text-gray-200 sm:grid-cols-3">
                    <span className="text-gray-500">Duration</span>
                    <span className="col-span-1 sm:col-span-2 text-right sm:text-left">
                      {safeResult.extended.durationSec}s
                    </span>
                    <span className="text-gray-500">Map</span>
                    <span className="col-span-1 sm:col-span-2 truncate text-right sm:text-left">
                      {safeResult.extended.mapName}
                    </span>
                    <span className="text-gray-500">Mode</span>
                    <span className="col-span-1 sm:col-span-2 text-right sm:text-left">
                      {safeResult.extended.modeLabel}
                    </span>
                    <span className="text-gray-500">Final HP</span>
                    <span className="col-span-1 sm:col-span-2 text-right sm:text-left">
                      {safeResult.extended.playerFinalHp} / {safeResult.extended.enemyFinalHp}
                    </span>
                    <span className="text-gray-500">Best hit</span>
                    <span className="col-span-1 sm:col-span-2 text-right sm:text-left">
                      P1 {safeResult.extended.biggestHitPlayer} · P2 {safeResult.extended.biggestHitEnemy}
                    </span>
                    <span className="text-gray-500">Best streak</span>
                    <span className="col-span-1 sm:col-span-2 text-right sm:text-left">
                      {safeResult.extended.maxStreakPlayer} / {safeResult.extended.maxStreakEnemy}
                    </span>
                    {safeResult.extended.comeback ? (
                      <>
                        <span className="text-gray-500">Comeback</span>
                        <span className="col-span-1 sm:col-span-2 text-neon-yellow text-right sm:text-left">
                          {safeResult.extended.comeback === 'player'
                            ? safeResult.player.name
                            : safeResult.enemy.name}
                        </span>
                      </>
                    ) : null}
                  </div>
                </GlassCard>
              )}
              {!isLocal2p && (
              <div>
                <div className="flex justify-between text-sm font-display mb-2">
                  <span className="text-neon-cyan flex items-center gap-2">
                    <StarIcon size={16} /> RANK XP
                  </span>
                  <span>+{xpGain} XP</span>
                </div>
                <ProgressBar progress={xpProgress} color="bg-neon-cyan" height="h-4" />
                <div className="text-right text-xs text-gray-500 mt-1">
                  Rank {victoryRank} ({Math.round(xpProgress)}%)
                </div>
              </div>
              )}

              {!isLocal2p && (
              <div className="flex justify-center">
                <div className="bg-dark-darker/50 rounded-xl px-6 py-3 flex items-center gap-3 border border-neon-yellow/30 shadow-[0_0_15px_rgba(255,234,0,0.1)]">
                  <CoinsIcon className="text-neon-yellow" />
                  <span className="font-display font-bold text-2xl text-neon-yellow">
                    +{coins}
                  </span>
                </div>
              </div>
              )}
              {isLocal2p && (
                <p className="text-center text-sm text-gray-400 font-display">
                  No rank or coin progress in Local 2 players.
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{
            y: 50,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 1,
            duration: 0.5
          }}
          className="mt-8 flex w-full flex-col gap-3 sm:mt-12 sm:flex-row sm:gap-6">
          <NeonButton
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={onMainMenu}>
            <ArrowRightIcon className="rotate-180" /> MAIN MENU
          </NeonButton>
          <NeonButton
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={onPlayAgain}>
            <RotateCcwIcon /> PLAY AGAIN
          </NeonButton>
        </motion.div>

        {(onChangeMap || onChangeMode) && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.45 }}
            className="mt-4 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:justify-center">
            {onChangeMap ? (
              <NeonButton
                variant="secondary"
                className="flex flex-1 items-center justify-center gap-2 sm:max-w-xs"
                onClick={onChangeMap}>
                <MapIcon size={18} /> CHANGE MAP
              </NeonButton>
            ) : null}
            {onChangeMode ? (
              <NeonButton
                variant="secondary"
                className="flex flex-1 items-center justify-center gap-2 sm:max-w-xs"
                onClick={onChangeMode}>
                <LayoutGridIcon size={18} /> CHANGE MODE
              </NeonButton>
            ) : null}
          </motion.div>
        )}
      </div>
      </ScreenFrame>
    </motion.div>
  );
}