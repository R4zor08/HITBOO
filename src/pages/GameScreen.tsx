import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SettingsIcon,
  MaximizeIcon,
  MinimizeIcon,
  WindIcon,
  XIcon,
  LogOutIcon,
  CircleHelpIcon
} from 'lucide-react';
import {
  Battlefield,
  type FirePayload,
  type ShotResult
} from '../components/game/Battlefield';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import { NeonButton } from '../components/ui/NeonButton';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GlassCard } from '../components/ui/GlassCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import type { Weapon } from '../types';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { GameSceneBoundary } from '../components/game/GameSceneBoundary';
import {
  P1_POS,
  P2_POS,
  PROJECTILE_START_Y_OFFSET,
  applyAimError,
  findBestAim,
  sampleTrajectoryPoints
} from '../game/artilleryPhysics';
import { getEnemyWeapon, WEAPON_PRESETS } from '../game/weapons';
import { playBlip, playHit, playMiss } from '../game/gameAudio';
import type { MatchResult } from '../game/matchResult';
import { STORAGE } from '../game/storageKeys';

if (!WEAPON_PRESETS.length) {
  throw new Error('WEAPON_PRESETS must not be empty');
}

export type GameMode = 'standard' | 'practice';

interface GameScreenProps {
  onGameOver: (result: MatchResult) => void;
  gameMode?: GameMode;
  /** Return to main menu from match (standard or practice). */
  onExitMatch: () => void;
}

export function GameScreen({
  onGameOver,
  gameMode = 'standard',
  onExitMatch
}: GameScreenProps) {
  const progress = useHitBowProgress();
  const practice = gameMode === 'practice';
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [wind, setWind] = useState({
    speed: 12,
    direction: 'right' as 'left' | 'right'
  });
  const [selectedWeaponId, setSelectedWeaponId] = useState(
    progress.equippedWeaponId
  );
  const selectedWeapon = useMemo((): Weapon => {
    const match = WEAPON_PRESETS.find((x) => x.id === selectedWeaponId);
    if (match) return match;
    const first = WEAPON_PRESETS[0];
    if (!first) {
      throw new Error('Weapon presets corrupted');
    }
    return first;
  }, [selectedWeaponId]);

  useEffect(() => {
    setSelectedWeaponId(progress.equippedWeaponId);
  }, [progress.equippedWeaponId]);

  const enemyWeapon = useMemo(
    () => getEnemyWeapon(progress.settings.difficulty),
    [progress.settings.difficulty]
  );

  const enemyAimError = useMemo(() => {
    switch (progress.settings.difficulty) {
      case 'casual':
        return { power: 14, angle: 9 };
      case 'hard':
        return { power: 6, angle: 5 };
      default:
        return { power: 10, angle: 7 };
    }
  }, [progress.settings.difficulty]);

  const [showMatchTips, setShowMatchTips] = useState(false);

  useEffect(() => {
    setShowMatchTips(
      localStorage.getItem(STORAGE.matchOnboardingDismissed) !== '1'
    );
  }, []);

  const dismissMatchTips = useCallback(() => {
    try {
      localStorage.setItem(STORAGE.matchOnboardingDismissed, '1');
    } catch {
      /* ignore */
    }
    setShowMatchTips(false);
  }, []);

  const showMatchTipsRef = useRef(showMatchTips);
  showMatchTipsRef.current = showMatchTips;

  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(45);
  const [aimPower, setAimPower] = useState(0);
  const aimAreaRef = useRef<HTMLDivElement>(null);
  const [aimSensitivity, setAimSensitivity] = useState(
    progress.settings.defaultAimSensitivity
  );
  const maxDistance = 300 / aimSensitivity;

  /** Sole volume UX is main-menu Settings; in-game HUD uses this derived mute only. */
  const audioMuted = useMemo(
    () =>
      progress.settings.masterVolume * progress.settings.sfxVolume < 0.001,
    [progress.settings.masterVolume, progress.settings.sfxVolume]
  );
  const [fullscreen, setFullscreen] = useState(
    () =>
      typeof document !== 'undefined' && !!document.fullscreenElement
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    progress.settings.reduceMotion
  );
  const [matchStats, setMatchStats] = useState({
    turns: 0,
    playerShots: 0,
    enemyShots: 0,
    playerHits: 0,
    enemyHits: 0,
    playerDamage: 0,
    enemyDamage: 0
  });
  const matchStatsRef = useRef(matchStats);
  matchStatsRef.current = matchStats;

  const [triggerFire, setTriggerFire] = useState<FirePayload | null>(null);
  const [arenaReady, setArenaReady] = useState(false);
  const [arenaFallbackVisible, setArenaFallbackVisible] = useState(false);
  const enemyName = practice ? 'TARGET DUMMY' : 'SKULL RAIDER';
  const enemyRank = practice ? 1 : 14;

  useEffect(() => {
    setAimSensitivity(progress.settings.defaultAimSensitivity);
  }, [progress.settings.defaultAimSensitivity]);

  useEffect(() => {
    setReduceMotion(progress.settings.reduceMotion);
  }, [progress.settings.reduceMotion]);

  const handleArenaReady = useCallback(() => {
    setArenaReady(true);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!arenaReady) {
        setArenaFallbackVisible(true);
      }
    }, 1500);
    return () => window.clearTimeout(id);
  }, [arenaReady]);
  const windRef = useRef(wind);
  windRef.current = wind;
  const isPlayerTurnRef = useRef(isPlayerTurn);
  isPlayerTurnRef.current = isPlayerTurn;

  const previewPoints = useMemo(() => {
    if (!isAiming || aimPower <= 5) return [];
    return sampleTrajectoryPoints({
      power: aimPower,
      angleDeg: aimAngle,
      shooterFacingRight: true,
      velocityScale: selectedWeapon.velocityScale,
      windSpeed: wind.speed,
      windDirection: wind.direction,
      startX: P1_POS.x,
      startY: P1_POS.y + PROJECTILE_START_Y_OFFSET
    });
  }, [
    isAiming,
    aimPower,
    aimAngle,
    selectedWeapon.velocityScale,
    wind.speed,
    wind.direction
  ]);

  /** 0–1 charge tint for aim box (cyan → magenta). */
  const aimChargeBlend = useMemo(() => {
    const t = aimPower > 5 ? Math.min(1, (aimPower - 5) / 95) : 0;
    if (t <= 0) return null;
    const r = Math.round(255 * t);
    const g = Math.round(240 * (1 - t));
    const b = Math.round(255 * (1 - t) + 229 * t);
    return { t, r, g, b };
  }, [aimPower]);

  const aimAreaStyle = useMemo((): React.CSSProperties => {
    const base =
      'inset 0 0 40px rgba(0,240,255,0.12), 0 0 20px rgba(0,0,0,0.3)';
    if (!aimChargeBlend) return { boxShadow: base };
    const { r, g, b } = aimChargeBlend;
    return {
      boxShadow: `${base}, inset 0 0 48px rgba(${r},${g},${b},0.22), 0 0 28px rgba(${r},${g},${b},0.42)`
    };
  }, [aimChargeBlend]);

  const windArrowMotion = useMemo(() => {
    if (reduceMotion) {
      return {
        animate: { x: 0 },
        transition: { duration: 0 }
      };
    }
    const duration = Math.max(
      0.45,
      Math.min(1.2, 1.25 - wind.speed * 0.035)
    );
    const amp = Math.min(10, 4 + wind.speed * 0.25);
    const x =
      wind.direction === 'right'
        ? [0, amp, 0]
        : [0, -amp, 0];
    return {
      animate: { x },
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    };
  }, [reduceMotion, wind.speed, wind.direction]);

  const aimDecorLit = isAiming || aimPower > 5;
  const aimDecorTransition =
    reduceMotion ? '' : 'transition-opacity duration-200 ease-out';

  useEffect(() => {
    const onFs = () =>
      setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const updateMatchStats = useCallback(
    (
      updater: (prev: typeof matchStats) => typeof matchStats
    ) => {
      setMatchStats((prev) => {
        const next = updater(prev);
        matchStatsRef.current = next;
        return next;
      });
    },
    []
  );

  const buildMatchResult = useCallback(
    (winner: 'player' | 'enemy'): MatchResult => {
      const s = matchStatsRef.current;
      const playerAccuracy =
        s.playerShots > 0 ? (s.playerHits / s.playerShots) * 100 : 0;
      const enemyAccuracy =
        s.enemyShots > 0 ? (s.enemyHits / s.enemyShots) * 100 : 0;
      return {
        winner,
        mode: gameMode,
        turns: s.turns,
        player: {
          name: progress.playerName,
          rank: progress.playerRank,
          damage: s.playerDamage,
          shots: s.playerShots,
          hits: s.playerHits,
          accuracy: Number(playerAccuracy.toFixed(1))
        },
        enemy: {
          name: enemyName,
          rank: enemyRank,
          damage: s.enemyDamage,
          shots: s.enemyShots,
          hits: s.enemyHits,
          accuracy: Number(enemyAccuracy.toFixed(1))
        }
      };
    },
    [enemyName, enemyRank, gameMode, progress.playerName, progress.playerRank]
  );

  const scheduleEnemyShot = useCallback(() => {
    const w = windRef.current;
    const sol = findBestAim({
      shooterFacingRight: false,
      velocityScale: enemyWeapon.velocityScale,
      windSpeed: w.speed,
      windDirection: w.direction,
      startX: P2_POS.x,
      startY: P2_POS.y + PROJECTILE_START_Y_OFFSET,
      targetX: P1_POS.x,
      targetY: P1_POS.y
    });
    const err = applyAimError(
      sol.power,
      sol.angleDeg,
      enemyAimError.power,
      enemyAimError.angle
    );
    setTriggerFire({
      power: err.power,
      angle: err.angleDeg,
      timestamp: Date.now(),
      velocityScale: enemyWeapon.velocityScale,
      baseDamage: enemyWeapon.damage,
      projectileStyle: enemyWeapon.projectileStyle
    });
    updateMatchStats((prev) => ({ ...prev, enemyShots: prev.enemyShots + 1 }));
    playBlip(220, 0.06, audioMuted);
  }, [enemyWeapon, enemyAimError, audioMuted, updateMatchStats]);

  const advanceWindAndTurn = useCallback(
    (shooterWasPlayer: boolean) => {
      const tier = progress.settings.difficulty;
      let windMin = 2;
      let windSpan = 17;
      if (tier === 'casual') {
        windMin = 0;
        windSpan = 15;
      } else if (tier === 'hard') {
        windMin = 5;
        windSpan = 18;
      }
      const newWind = {
        speed: Math.floor(Math.random() * windSpan) + windMin,
        direction: (Math.random() > 0.5 ? 'right' : 'left') as
          | 'left'
          | 'right'
      };
      windRef.current = newWind;
      setWind(newWind);
      setIsPlayerTurn((t) => !t);
      if (shooterWasPlayer) {
        setTimeout(() => scheduleEnemyShot(), 2000);
      }
    },
    [scheduleEnemyShot, progress.settings.difficulty]
  );

  const handleShotResult = useCallback(
    (result: ShotResult) => {
      setTriggerFire(null);
      const shooterWasPlayer = isPlayerTurnRef.current;
      updateMatchStats((prev) => ({ ...prev, turns: prev.turns + 1 }));

      if (result.outcome === 'miss') {
        playMiss(audioMuted);
        if (typeof navigator !== 'undefined' && navigator.vibrate && !audioMuted) {
          navigator.vibrate(20);
        }
        advanceWindAndTurn(shooterWasPlayer);
        return;
      }

      const { damage } = result;
      playHit(audioMuted);
      if (typeof navigator !== 'undefined' && navigator.vibrate && !audioMuted) {
        navigator.vibrate([30, 40, 30]);
      }

      if (shooterWasPlayer) {
        updateMatchStats((prev) => ({
          ...prev,
          playerHits: prev.playerHits + 1,
          playerDamage: prev.playerDamage + damage
        }));
        setEnemyHp((prev) => {
          const next = practice
            ? Math.max(1, prev - damage)
            : Math.max(0, prev - damage);
          if (!practice && next <= 0) {
            setTimeout(() => onGameOver(buildMatchResult('player')), 1500);
          } else {
            advanceWindAndTurn(true);
          }
          return next;
        });
      } else {
        updateMatchStats((prev) => ({
          ...prev,
          enemyHits: prev.enemyHits + 1,
          enemyDamage: prev.enemyDamage + damage
        }));
        setPlayerHp((prev) => {
          const next = Math.max(0, prev - damage);
          if (next <= 0) {
            setTimeout(() => onGameOver(buildMatchResult('enemy')), 1500);
          } else {
            advanceWindAndTurn(false);
          }
          return next;
        });
      }
    },
    [
      practice,
      audioMuted,
      advanceWindAndTurn,
      onGameOver,
      buildMatchResult,
      updateMatchStats
    ]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlayerTurn || showMatchTipsRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setIsAiming(true);
    updateAim(e);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isAiming || !isPlayerTurn) return;
    updateAim(e);
  };
  const updateAim = (e: React.PointerEvent) => {
    if (!aimAreaRef.current) return;
    const rect = aimAreaRef.current.getBoundingClientRect();
    const startX = rect.left + 50;
    const startY = rect.bottom - 50;
    const dx = e.clientX - startX;
    const dy = startY - e.clientY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = Math.max(0, Math.min(90, angle));
    const distance = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(100, (distance / maxDistance) * 100);
    setAimAngle(angle);
    setAimPower(power);
  };
  const endAim = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e?.currentTarget && e.pointerId != null) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
    }
    if (!isAiming || !isPlayerTurn) return;
    setIsAiming(false);
  };

  const handleFire = () => {
    if (!isPlayerTurn || aimPower < 5 || showMatchTipsRef.current) return;
    updateMatchStats((prev) => ({ ...prev, playerShots: prev.playerShots + 1 }));
    setTriggerFire({
      power: aimPower,
      angle: aimAngle,
      timestamp: Date.now(),
      velocityScale: selectedWeapon.velocityScale,
      baseDamage: selectedWeapon.damage,
      projectileStyle: selectedWeapon.projectileStyle
    });
    setIsAiming(false);
    playBlip(440, 0.08, audioMuted);
  };

  const handleFireRef = useRef(handleFire);
  handleFireRef.current = handleFire;

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!isPlayerTurnRef.current || settingsOpen || showMatchTipsRef.current)
        return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;

      const k = ev.key;
      if (
        k === 'ArrowUp' ||
        k === 'ArrowDown' ||
        k === 'ArrowLeft' ||
        k === 'ArrowRight' ||
        k === ' ' ||
        k === 'Enter'
      ) {
        ev.preventDefault();
      }

      if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        setAimPower((p) => Math.min(100, p + 4));
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        setAimPower((p) => Math.max(0, p - 4));
      } else if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        setAimAngle((a) => Math.max(0, a - 2));
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        setAimAngle((a) => Math.min(90, a + 2));
      } else if (k === ' ' || k === 'Enter') {
        handleFireRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [settingsOpen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  };

  const polylinePoints = previewPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const previewStroke = progress.playerAccentHex;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f0622] select-none touch-none">
      <GameSceneBoundary
        fallback={
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <GlassCard
              variant="sticker"
              className="w-full max-w-xl p-7 text-center border-neon-magenta/60">
              <h2 className="font-display text-2xl font-black text-neon-magenta">
                Arena failed to render
              </h2>
              <p className="mt-2 text-sm text-gray-300 font-display">
                We hit a scene error. Return to menu and start a new match.
              </p>
              <NeonButton
                variant="secondary"
                size="md"
                className="mt-5"
                onClick={onExitMatch}>
                Back to Menu
              </NeonButton>
            </GlassCard>
          </div>
        }>
        <Battlefield
          isPlayerTurn={isPlayerTurn}
          windSpeed={wind.speed}
          windDirection={wind.direction}
          playerHp={playerHp}
          enemyHp={enemyHp}
          triggerFire={triggerFire}
          onShotResult={handleShotResult}
          reduceMotion={reduceMotion}
          playerAccentHex={progress.playerAccentHex}
          playerCharacterId={progress.equippedCharacterId}
          enemyCharacterId={progress.equippedEnemyCharacterId}
          onReady={handleArenaReady}
        />
      </GameSceneBoundary>

      {arenaFallbackVisible && !arenaReady && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center px-6">
          <GlassCard
            variant="sticker"
            className="w-full max-w-lg p-6 text-center border-neon-yellow/60 bg-dark-card/90">
            <p className="font-display text-neon-yellow font-black tracking-wide">
              Preparing arena...
            </p>
            <p className="mt-2 text-xs text-gray-300 font-display">
              If this takes too long, open Match settings and return to menu.
            </p>
          </GlassCard>
        </div>
      )}

      {showMatchTips && (
        <div className="absolute inset-0 z-[25] flex items-start justify-center pt-4 sm:pt-8 px-4 pointer-events-none">
          <GlassCard
            variant="sticker"
            className="max-w-lg w-full pointer-events-auto border-neon-cyan/45 p-5 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            <h2 className="font-display text-lg font-black text-neon-cyan tracking-wide">
              Quick briefing
            </h2>
            <ul className="text-sm text-gray-200 font-display space-y-2 list-disc pl-4 marker:text-neon-cyan">
              <li>
                This match is{' '}
                <strong className="text-white">offline vs AI</strong> — no
                real PvP queue.
              </li>
              <li>
                Drag inside the aim box for angle and power, then tap{' '}
                <strong className="text-white">FIRE</strong> (needs a little
                power).
              </li>
              <li>Wind shifts after each shot — watch the HUD arrow.</li>
              <li>
                Standard win: bring the rival to{' '}
                <strong className="text-white">0 HP</strong>.
              </li>
              {practice ? (
                <li>
                  Training dummy{' '}
                  <strong className="text-neon-yellow">
                    never reaches 0 HP
                  </strong>{' '}
                  so you can drill shots safely.
                </li>
              ) : null}
            </ul>
            <NeonButton size="sm" variant="primary" onClick={dismissMatchTips}>
              Got it
            </NeonButton>
          </GlassCard>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 gap-8">
        <div className="flex justify-between items-start gap-8">
          <GlassCard variant="sticker" className="p-4 md:p-5 flex items-center gap-4 w-[18rem] max-w-[42vw] pointer-events-auto border-neon-cyan/35 bg-dark-card/80 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-neon-cyan overflow-hidden bg-dark-darker p-1">
                <StickerAvatar
                  characterId={progress.equippedCharacterId}
                  side="player"
                  accentHex={progress.playerAccentHex}
                  className="h-full w-full"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-dark-card text-[10px] font-bold border border-neon-cyan rounded px-1 text-neon-cyan">
                Lv.{progress.playerRank}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-display font-bold text-white mb-1">
                {progress.playerName}
              </div>
              <ProgressBar
                progress={playerHp}
                color="bg-neon-cyan"
                height="h-3"
                showLabel
              />
            </div>
          </GlassCard>

          <div className="flex flex-col items-center gap-4">
            {practice && onExitMatch && (
              <div className="flex flex-col sm:flex-row gap-2 items-center pointer-events-auto">
                <GlassCard
                  variant="sticker"
                  interactive
                  className="px-4 py-2 flex items-center gap-2 border-neon-yellow/40 min-h-[44px]"
                  onClick={() => onExitMatch()}>
                  <LogOutIcon size={18} className="text-neon-yellow" />
                  <span className="font-display text-xs font-black tracking-wide text-white">
                    EXIT PRACTICE
                  </span>
                </GlassCard>
                <GlassCard
                  variant="sticker"
                  interactive
                  className="px-4 py-2 flex items-center gap-2 border-neon-lime/40 min-h-[44px]"
                  onClick={() => {
                    setEnemyHp(100);
                    setPlayerHp(100);
                  }}>
                  <span className="font-display text-xs font-black tracking-wide text-neon-lime">
                    RESET DUMMY HP
                  </span>
                </GlassCard>
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlayerTurn ? 'player' : 'enemy'}
                initial={{
                  scale: 0.5,
                  opacity: 0,
                  y: -20
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  scale: 1.5,
                  opacity: 0
                }}
                className={`rounded-full border px-5 py-2 bg-dark-card/70 font-display font-black text-xl md:text-2xl tracking-[0.2em] uppercase ${isPlayerTurn ? 'text-neon-cyan border-neon-cyan/45 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]' : 'text-neon-magenta border-neon-magenta/45 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]'}`}>
                {isPlayerTurn ? 'Your turn' : 'Enemy turn'}
              </motion.div>
            </AnimatePresence>

            <GlassCard variant="sticker" className="px-4 py-2 flex items-center gap-3 rounded-full border-cyan-500/45 bg-dark-darker/90 pointer-events-none shadow-[0_0_14px_rgba(0,240,255,0.14)]">
              <WindIcon size={18} className="text-neon-cyan shrink-0" />
              <span className="font-display font-bold text-sm">
                {wind.speed}
              </span>
              <motion.div
                animate={windArrowMotion.animate}
                transition={windArrowMotion.transition}>
                {wind.direction === 'right' ? '→' : '←'}
              </motion.div>
            </GlassCard>
          </div>

          <GlassCard variant="sticker" className="p-4 md:p-5 flex items-center gap-4 w-[18rem] max-w-[42vw] flex-row-reverse pointer-events-auto border-neon-magenta/35 bg-dark-card/80 shadow-[0_0_20px_rgba(255,0,229,0.12)]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-neon-magenta overflow-hidden bg-dark-darker p-1">
                <StickerAvatar
                  characterId={progress.equippedEnemyCharacterId}
                  side="enemy"
                  accentHex="#ff00e5"
                  className="h-full w-full"
                />
              </div>
              <div className="absolute -bottom-2 -left-2 bg-dark-card text-[10px] font-bold border border-neon-magenta rounded px-1 text-neon-magenta">
                Lv.{enemyRank}
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm font-display font-bold text-white mb-1">
                {enemyName}
              </div>
              <ProgressBar
                progress={enemyHp}
                color="bg-neon-magenta"
                height="h-3"
                showLabel
                className="rotate-180"
              />
            </div>
          </GlassCard>
        </div>

        <div className="flex justify-between items-end gap-8">
          <div className="w-12 shrink-0 pointer-events-none" aria-hidden />

          <AnimatePresence>
            {isPlayerTurn && (
              <motion.div
                initial={{
                  y: 100,
                  opacity: 0
                }}
                animate={{
                  y: 0,
                  opacity: 1
                }}
                exit={{
                  y: 100,
                  opacity: 0
                }}
                className="flex flex-col items-center gap-4 pointer-events-auto w-full max-w-2xl mx-auto px-4">
                <div className="w-full space-y-1">
                  <SectionHeading
                    colorClassName="text-gray-500"
                    className="text-center">
                    LOADOUT
                  </SectionHeading>
                  <div className="relative w-full">
                    <div
                      className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-[#0f0622] to-transparent"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-[#0f0622] to-transparent"
                      aria-hidden
                    />
                    <div className="relative z-0 flex snap-x snap-mandatory flex-nowrap gap-1.5 overflow-x-auto overflow-y-visible scroll-smooth px-2 py-1 pb-1 [-webkit-overflow-scrolling:touch]">
                      {WEAPON_PRESETS.map((w: Weapon) => {
                        const selected = selectedWeaponId === w.id;
                        const card = (
                          <GlassCard
                            variant="sticker"
                            interactive
                            glowColor={selected ? 'cyan' : 'none'}
                            className={`flex h-full shrink-0 cursor-pointer items-center gap-1.5 border px-2 py-1.5 ${
                              selected
                                ? 'ring-2 ring-neon-cyan border-neon-cyan/50'
                                : 'border-white/20'
                            }`}
                            onClick={() => {
                              setSelectedWeaponId(w.id);
                              progress.setEquippedWeaponId(w.id);
                            }}>
                            <span className="text-base leading-none">
                              {w.icon}
                            </span>
                            <span className="font-display text-[11px] leading-tight text-gray-200">
                              {w.name}
                            </span>
                          </GlassCard>
                        );
                        return (
                          <div
                            key={w.id}
                            className="snap-start shrink-0 max-w-[9.5rem]">
                            {selected && !reduceMotion ? (
                              <motion.div
                                className="rounded-3xl"
                                animate={{
                                  boxShadow: [
                                    '0 0 0 rgba(0,240,255,0)',
                                    '0 0 22px rgba(0,240,255,0.5)',
                                    '0 0 0 rgba(0,240,255,0)'
                                  ]
                                }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                  ease: 'easeInOut'
                                }}>
                                {card}
                              </motion.div>
                            ) : (
                              card
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-1">
                  <SectionHeading
                    colorClassName="text-gray-500"
                    className="text-center">
                    AIM
                  </SectionHeading>
                  <div
                  ref={aimAreaRef}
                  style={aimAreaStyle}
                  className="relative h-48 w-full cursor-crosshair touch-none overflow-hidden rounded-2xl border-[3px] border-dashed border-neon-cyan/45 bg-black/45 backdrop-blur-md"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endAim}
                  onPointerCancel={endAim}
                  onPointerLeave={endAim}>
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl ${aimDecorTransition} ${
                      aimDecorLit ? 'opacity-100' : 'opacity-[0.38]'
                    }`}>
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage: `
                        linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)
                      `,
                        backgroundSize: '14px 14px'
                      }}
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.55)_100%)]"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-neon-cyan/55"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-neon-cyan/55"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-neon-magenta/45"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-neon-magenta/45"
                      aria-hidden
                    />
                  </div>
                  {aimChargeBlend ? (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{
                        background: `radial-gradient(ellipse 85% 75% at 50% 88%, rgba(${aimChargeBlend.r},${aimChargeBlend.g},${aimChargeBlend.b},0.38), transparent 70%)`
                      }}
                      aria-hidden
                    />
                  ) : null}
                  <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1 px-2 text-center font-display text-xs tracking-wide text-white/60 sm:text-sm">
                    <span>DRAG TO AIM · TAP OUTSIDE TO ADJUST</span>
                    <span className="max-w-[22rem] text-[10px] text-gray-200 sm:text-xs">
                      <span className="md:hidden">
                        <span className="block">
                          Keys: ↑↓ / W S power · ←→ / A D angle
                        </span>
                        <span className="block">Space / Enter fire</span>
                      </span>
                      <span className="hidden md:inline">
                        Keys: ↑↓ / W S power · ←→ / A D angle · Space / Enter fire
                      </span>
                    </span>
                  </div>
                  {previewPoints.length > 1 && (
                    <svg
                      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none">
                      <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke={previewStroke}
                        strokeOpacity={0.9}
                        strokeWidth="0.35"
                        strokeDasharray="1 1"
                      />
                    </svg>
                  )}
                </div>
                </div>

                <div className="flex items-center gap-4 w-full border-4 border-neon-cyan/30 bg-dark-card/95 p-3 rounded-3xl shadow-[0_8px_0_0_rgba(0,0,0,0.35),0_0_20px_rgba(0,240,255,0.12)]">
                  <div className="flex-1">
                    <div className="text-[10px] font-display text-gray-300 mb-1 flex justify-between tracking-wide">
                      <span>POWER</span>
                      <span>{Math.round(aimPower)}%</span>
                    </div>
                    <ProgressBar
                      progress={aimPower}
                      color={
                        aimPower > 80 ? 'bg-neon-magenta' : 'bg-neon-cyan'
                      }
                      height="h-4"
                      variant="arcade"
                      reduceMotion={reduceMotion}
                    />
                  </div>

                  <div className="group relative z-0 inline-flex">
                    {aimPower > 5 && !reduceMotion ? (
                      <motion.div
                        className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-neon-cyan/30 blur-md group-hover:bg-neon-cyan/45 group-hover:blur-lg group-focus-within:bg-neon-cyan/45"
                        animate={{
                          opacity: [0.32, 0.78, 0.32],
                          scale: [1, 1.08, 1]
                        }}
                        transition={{
                          duration: 2.6,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        aria-hidden
                      />
                    ) : null}
                    {aimPower > 5 && reduceMotion ? (
                      <div
                        className="pointer-events-none absolute -inset-1 -z-10 rounded-full ring-2 ring-neon-cyan/35"
                        aria-hidden
                      />
                    ) : null}
                    <NeonButton
                      type="button"
                      size="md"
                      variant="primary"
                      className={`relative transition-shadow group-hover:shadow-[0_0_22px_rgba(0,240,255,0.55)] group-focus-visible:shadow-[0_0_22px_rgba(0,240,255,0.55)] ${
                        aimPower <= 5
                          ? 'opacity-50 saturate-50 !shadow-none'
                          : ''
                      }`}
                      onClick={handleFire}
                      disabled={aimPower <= 5}>
                      FIRE
                    </NeonButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 pointer-events-auto relative items-center">
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-16 right-0 w-72 z-20">
                  <GlassCard variant="sticker" className="p-6 space-y-5 border-neon-purple/35">
                    <div className="flex justify-between items-center">
                      <span className="font-display text-sm font-bold">
                        Settings
                      </span>
                      <button
                        type="button"
                        onClick={() => setSettingsOpen(false)}
                        className="text-gray-400 hover:text-white">
                        <XIcon size={18} />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-display block mb-1">
                        Aim sensitivity
                      </label>
                      <input
                        type="range"
                        min={0.6}
                        max={1.6}
                        step={0.1}
                        value={aimSensitivity}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setAimSensitivity(v);
                          progress.updateSettings({
                            defaultAimSensitivity: v
                          });
                        }}
                        className="w-full"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reduceMotion}
                        onChange={(e) => {
                          const v = e.target.checked;
                          setReduceMotion(v);
                          progress.updateSettings({ reduceMotion: v });
                        }}
                      />
                      <span className="text-sm font-display">
                        Reduce motion
                      </span>
                    </label>

                    <div>
                      <span className="text-xs text-gray-400 font-display block mb-2">
                        AI difficulty (standard matches)
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {(['casual', 'standard', 'hard'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() =>
                              progress.updateSettings({ difficulty: d })
                            }
                            className={`rounded-full border-2 px-3 py-1 text-xs font-display font-bold uppercase ${
                              progress.settings.difficulty === d
                                ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                                : 'border-white/25 text-gray-300 hover:border-white/50'
                            }`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={progress.settings.musicEnabled}
                        onChange={(e) =>
                          progress.updateSettings({
                            musicEnabled: e.target.checked
                          })
                        }
                      />
                      <span className="text-sm font-display">Ambient music</span>
                    </label>
                    <div>
                      <label className="text-xs text-gray-400 font-display block mb-1">
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
                        className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan rounded"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        onExitMatch();
                      }}
                      className="w-full rounded-full border-[3px] border-neon-magenta/70 bg-neon-magenta/15 py-3 font-display font-black text-sm text-neon-magenta uppercase tracking-wide shadow-[0_4px_0_0_rgba(0,0,0,0.35)] hover:bg-neon-magenta/25">
                      Exit to menu
                    </button>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            <GlassCard
              variant="sticker"
              interactive
              className="min-h-[44px] min-w-[44px] p-3 rounded-full flex items-center justify-center"
              onClick={() => setShowMatchTips(true)}
              aria-label="How to play">
              <CircleHelpIcon className="text-neon-cyan" size={22} />
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="min-h-[44px] min-w-[44px] p-3 rounded-full flex items-center justify-center"
              onClick={() => void toggleFullscreen()}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {fullscreen ? (
                <MinimizeIcon className="text-neon-cyan" size={22} />
              ) : (
                <MaximizeIcon className="text-neon-cyan" size={22} />
              )}
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="min-h-[44px] min-w-[44px] p-3 rounded-full flex items-center justify-center"
              onClick={() => setSettingsOpen((o) => !o)}
              aria-label="Match settings">
              <SettingsIcon className="text-white" size={22} />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
