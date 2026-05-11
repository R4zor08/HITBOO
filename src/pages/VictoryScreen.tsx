import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  CoinsIcon,
  ArrowRightIcon,
  RotateCcwIcon
} from 'lucide-react';
import { NeonButton } from '../components/ui/NeonButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ParticleBackground } from '../components/ui/ParticleBackground';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import type { MatchResult, MatchRewardResult } from '../game/matchResult';

interface VictoryScreenProps {
  winner: 'player' | 'enemy';
  matchResult: MatchResult | null;
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

const XP_PER_RANK = 600;

function xpProgressPercent(xp: number): number {
  const inRank = xp % XP_PER_RANK;
  return (inRank / XP_PER_RANK) * 100;
}

export function VictoryScreen({
  winner,
  matchResult,
  onMainMenu,
  onPlayAgain
}: VictoryScreenProps) {
  const progress = useHitBowProgress();
  const isWin = winner === 'player';
  const [xpProgress, setXpProgress] = useState(xpProgressPercent(progress.playerXp));
  const [coins, setCoins] = useState(0);
  const [xpGain, setXpGain] = useState(0);
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
    if (rewardedRef.current) return;
    rewardedRef.current = true;

    const reward: MatchRewardResult = progress.applyMatchRewards(safeResult);
    setXpGain(reward.xpAwarded);
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
    setTimeout(() => setXpProgress(xpProgressPercent(progress.playerXp + reward.xpAwarded)), 400);
    return () => clearInterval(timer);
  }, [progress, safeResult]);

  const titleColor = isWin
    ? 'text-neon-cyan text-glow-cyan'
    : 'text-neon-magenta text-glow-magenta';
  const titleText = isWin ? 'VICTORY' : 'DEFEAT';
  return (
    <motion.div
      className="relative w-full h-screen bg-dark-darker flex flex-col items-center justify-center overflow-hidden"
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
      <ParticleBackground />

      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] opacity-20 pointer-events-none ${isWin ? 'bg-neon-cyan' : 'bg-neon-magenta'}`}
      />

      <div className="z-10 flex flex-col items-center w-full max-w-2xl px-4">
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
          className="text-center mb-12">
          <TrophyIcon
            size={64}
            className={`mx-auto mb-4 ${isWin ? 'text-neon-yellow' : 'text-gray-600'}`}
          />
          <p className="text-sm font-display tracking-[0.4em] text-gray-500 mb-2">
            HITBOW
          </p>
          <h1
            className={`text-7xl md:text-9xl font-display font-black tracking-widest ${titleColor}`}>
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
            className="p-8 w-full flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-xl border-2 ${isWin ? 'border-neon-cyan shadow-neon-cyan' : 'border-gray-600'} overflow-hidden bg-dark-darker p-1`}>
                  <StickerAvatar
                    characterId={progress.equippedCharacterId}
                    side="player"
                    accentHex={progress.playerAccentHex}
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <div className="font-display font-bold text-lg">
                    {safeResult.player.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    Dmg {safeResult.player.damage} - Acc {safeResult.player.accuracy}%
                  </div>
                </div>
              </div>

              <div className="text-2xl font-display font-black text-gray-500">VS</div>

              <div className="flex items-center gap-4 flex-row-reverse text-right">
                <div
                  className={`w-16 h-16 rounded-xl border-2 ${!isWin ? 'border-neon-magenta shadow-neon-magenta' : 'border-gray-600'} overflow-hidden bg-dark-darker p-1`}>
                  <StickerAvatar
                    characterId={progress.equippedEnemyCharacterId}
                    side="enemy"
                    accentHex="#ff00e5"
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <div className="font-display font-bold text-lg">
                    {safeResult.enemy.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    Dmg {safeResult.enemy.damage} - Acc {safeResult.enemy.accuracy}%
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-display mb-2">
                  <span className="text-neon-cyan flex items-center gap-2">
                    <StarIcon size={16} /> RANK XP
                  </span>
                  <span>+{xpGain} XP</span>
                </div>
                <ProgressBar progress={xpProgress} color="bg-neon-cyan" height="h-4" />
                <div className="text-right text-xs text-gray-500 mt-1">
                  Rank {progress.playerRank} ({Math.round(xpProgress)}%)
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-dark-darker/50 rounded-xl px-6 py-3 flex items-center gap-3 border border-neon-yellow/30 shadow-[0_0_15px_rgba(255,234,0,0.1)]">
                  <CoinsIcon className="text-neon-yellow" />
                  <span className="font-display font-bold text-2xl text-neon-yellow">
                    +{coins}
                  </span>
                </div>
              </div>
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
          className="flex gap-6 mt-12 w-full">
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
      </div>
    </motion.div>
  );
}