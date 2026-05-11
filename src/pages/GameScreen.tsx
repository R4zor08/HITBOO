import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SettingsIcon,
  MaximizeIcon,
  MinimizeIcon,
  WindIcon,
  XIcon,
  LogOutIcon
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
import { ENEMY_WEAPON, WEAPON_PRESETS } from '../game/weapons';
import { playBlip, playHit, playMiss } from '../game/gameAudio';
import type { MatchResult } from '../game/matchResult';

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
  const enemyWeapon = ENEMY_WEAPON;

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
    const err = applyAimError(sol.power, sol.angleDeg, 10, 7);
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
  }, [enemyWeapon, audioMuted, updateMatchStats]);

  const advanceWindAndTurn = useCallback(
    (shooterWasPlayer: boolean) => {
      const newWind = {
        speed: Math.floor(Math.random() * 20),
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
    [scheduleEnemyShot]
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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isPlayerTurn) return;
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
  const handlePointerUp = () => {
    if (!isAiming || !isPlayerTurn) return;
    setIsAiming(false);
  };

  const handleFire = () => {
    if (!isPlayerTurn || aimPower < 5) return;
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
              <GlassCard
                variant="sticker"
                interactive
                className="px-4 py-2 flex items-center gap-2 pointer-events-auto border-neon-yellow/40 min-h-[44px]"
                onClick={() => onExitMatch()}>
                <LogOutIcon size={18} className="text-neon-yellow" />
                <span className="font-display text-xs font-black tracking-wide text-white">
                  EXIT PRACTICE
                </span>
              </GlassCard>
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
                animate={
                  reduceMotion
                    ? { x: 0 }
                    : {
                        x: wind.direction === 'right' ? [0, 5, 0] : [0, -5, 0]
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 1, repeat: Infinity }
                }>
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
                className="flex flex-col items-center gap-6 pointer-events-auto w-full max-w-2xl mx-auto px-4">
                <div className="flex flex-wrap gap-3 w-full justify-center max-h-52 md:max-h-64 overflow-y-auto overflow-x-hidden pb-2 pr-1">
                  {WEAPON_PRESETS.map((w: Weapon) => (
                    <GlassCard
                      key={w.id}
                      variant="sticker"
                      interactive
                      glowColor={
                        selectedWeaponId === w.id ? 'cyan' : 'none'
                      }
                      className={`px-3 py-2 flex items-center gap-2 shrink-0 cursor-pointer border ${selectedWeaponId === w.id ? 'ring-2 ring-neon-cyan border-neon-cyan/50' : 'border-white/20'}`}
                      onClick={() => {
                        setSelectedWeaponId(w.id);
                        progress.setEquippedWeaponId(w.id);
                      }}>
                      <span className="text-lg">{w.icon}</span>
                      <span className="font-display text-xs text-gray-200">
                        {w.name}
                      </span>
                    </GlassCard>
                  ))}
                </div>

                <div
                  ref={aimAreaRef}
                  className="w-full h-48 border-[3px] border-dashed border-neon-cyan/45 rounded-2xl relative overflow-hidden bg-black/45 backdrop-blur-md cursor-crosshair touch-none shadow-[inset_0_0_40px_rgba(0,240,255,0.12),0_0_20px_rgba(0,0,0,0.3)]"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}>
                  <div className="absolute inset-0 flex items-center justify-center text-white/45 font-display text-sm tracking-wide pointer-events-none">
                    DRAG HERE TO AIM
                  </div>
                  {previewPoints.length > 1 && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
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
                    />
                  </div>

                  <NeonButton
                    type="button"
                    size="md"
                    variant="primary"
                    onClick={handleFire}
                    disabled={aimPower <= 5}>
                    FIRE
                  </NeonButton>
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
