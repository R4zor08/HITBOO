import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SettingsIcon,
  MaximizeIcon,
  MinimizeIcon,
  WindIcon,
  XIcon,
  LogOutIcon,
  CircleHelpIcon,
  TimerIcon,
  MoveLeftIcon,
  MoveRightIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import {
  Battlefield,
  type FirePayload,
  type ShotResult
} from '../components/game/Battlefield';
import { AimInteractionLayer } from '../components/game/AimInteractionLayer';
import { AimTrajectoryOverlay } from '../components/game/AimTrajectoryOverlay';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import { NeonButton } from '../components/ui/NeonButton';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GlassCard } from '../components/ui/GlassCard';
import type {
  Local2pLoadout,
  MapId,
  PlayerMovementState,
  PlayerStance,
  TurnTimerConfig,
  Weapon
} from '../types';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { GameSceneBoundary } from '../components/game/GameSceneBoundary';
import {
  P1_POS,
  P2_POS,
  PROJECTILE_START_Y_OFFSET,
  applyAimError,
  findBestAim,
  sampleTrajectoryWithTerminal
} from '../game/artilleryPhysics';
import {
  clientToArenaPercent,
  pointerNearAnchor,
  slingshotAimFromPointer
} from '../game/aimFromDrag';
import { getEnemyWeapon, WEAPON_PRESETS } from '../game/weapons';
import { playBlip, playHit, playMiss } from '../game/gameAudio';
import type { MatchResult } from '../game/matchResult';
import { STORAGE } from '../game/storageKeys';
import { DEFAULT_MAP_ID, getMapById } from '../game/maps';

if (!WEAPON_PRESETS.length) {
  throw new Error('WEAPON_PRESETS must not be empty');
}

export type GameMode = 'standard' | 'practice' | 'local2p';

interface GameScreenProps {
  onGameOver: (result: MatchResult) => void;
  gameMode?: GameMode;
  mapId?: MapId;
  /** Session loadout when `gameMode === 'local2p'`. */
  local2pLoadout?: Local2pLoadout | null;
  /** Return to main menu from match (standard or practice). */
  onExitMatch: () => void;
}

export function GameScreen({
  onGameOver,
  gameMode = 'standard',
  mapId = DEFAULT_MAP_ID,
  local2pLoadout = null,
  onExitMatch
}: GameScreenProps) {
  const progress = useHitBowProgress();
  const local2p = gameMode === 'local2p';
  if (local2p && !local2pLoadout) {
    throw new Error('GameScreen: local2p mode requires local2pLoadout');
  }
  const practice = gameMode === 'practice';
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [wind, setWind] = useState({
    speed: 12,
    direction: 'right' as 'left' | 'right'
  });
  const [selectedWeaponId, setSelectedWeaponId] = useState(
    local2pLoadout?.p1WeaponId ?? progress.equippedWeaponId
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
    if (local2p) return;
    setSelectedWeaponId(progress.equippedWeaponId);
  }, [progress.equippedWeaponId, local2p]);

  const p1LoadoutWeapon = useMemo((): Weapon | null => {
    if (!local2pLoadout) return null;
    return (
      WEAPON_PRESETS.find((x) => x.id === local2pLoadout.p1WeaponId) ??
      WEAPON_PRESETS[0] ??
      null
    );
  }, [local2pLoadout]);

  const p2LoadoutWeapon = useMemo((): Weapon | null => {
    if (!local2pLoadout) return null;
    return (
      WEAPON_PRESETS.find((x) => x.id === local2pLoadout.p2WeaponId) ??
      WEAPON_PRESETS[0] ??
      null
    );
  }, [local2pLoadout]);

  const activeWeapon = useMemo((): Weapon => {
    if (local2p && p1LoadoutWeapon && p2LoadoutWeapon) {
      return isPlayerTurn ? p1LoadoutWeapon : p2LoadoutWeapon;
    }
    return selectedWeapon;
  }, [
    local2p,
    p1LoadoutWeapon,
    p2LoadoutWeapon,
    isPlayerTurn,
    selectedWeapon
  ]);

  const enemyWeapon = useMemo(() => {
    if (local2p && p2LoadoutWeapon) return p2LoadoutWeapon;
    return getEnemyWeapon(progress.settings.difficulty);
  }, [local2p, p2LoadoutWeapon, progress.settings.difficulty]);

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

  const [onboardingHintVisible, setOnboardingHintVisible] = useState(false);
  const [matchHelpOpen, setMatchHelpOpen] = useState(false);

  useEffect(() => {
    if (local2p) {
      setOnboardingHintVisible(false);
      return;
    }
    setOnboardingHintVisible(
      localStorage.getItem(STORAGE.matchOnboardingDismissed) !== '1'
    );
  }, [local2p]);

  const dismissMatchTips = useCallback(() => {
    try {
      localStorage.setItem(STORAGE.matchOnboardingDismissed, '1');
    } catch {
      /* ignore */
    }
    setOnboardingHintVisible(false);
    setMatchHelpOpen(false);
  }, []);

  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(45);
  const [aimPower, setAimPower] = useState(0);
  const [aimPullDeg, setAimPullDeg] = useState(0);
  const [releaseShaking, setReleaseShaking] = useState(false);
  const [turnNudgeX, setTurnNudgeX] = useState(0);
  const gameRootRef = useRef<HTMLDivElement>(null);
  const loadoutScrollRef = useRef<HTMLDivElement>(null);
  const slingshotDraggingRef = useRef(false);
  const aimPowerRef = useRef(0);
  const aimAngleRef = useRef(45);
  const aimSensitivityRef = useRef(progress.settings.defaultAimSensitivity);
  const isAimingRef = useRef(false);
  const [aimSensitivity, setAimSensitivity] = useState(
    progress.settings.defaultAimSensitivity
  );

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
  const enemyName = local2p
    ? 'Player 2'
    : practice
      ? 'TARGET DUMMY'
      : 'SKULL RAIDER';
  const enemyRank = local2p ? 1 : practice ? 1 : 14;
  const enemyRankLabel = local2p ? '—' : String(enemyRank);
  const playerDisplayName = local2p ? 'Player 1' : progress.playerName;
  const playerRankLabel = local2p ? '—' : String(progress.playerRank);
  const canAim = local2p || isPlayerTurn;
  const activeMap = useMemo(() => getMapById(mapId), [mapId]);
  const [turnTimerConfig, setTurnTimerConfig] = useState<TurnTimerConfig>({
    durationSec: 8
  });
  const [turnTimeLeftMs, setTurnTimeLeftMs] = useState(
    turnTimerConfig.durationSec * 1000
  );
  const deadlineRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const turnExpiredRef = useRef(false);
  const [p1Move, setP1Move] = useState<PlayerMovementState>({
    x: P1_POS.x,
    yOffset: 0,
    vy: 0,
    grounded: true,
    stance: 'standing'
  });
  const [p2Move, setP2Move] = useState<PlayerMovementState>({
    x: P2_POS.x,
    yOffset: 0,
    vy: 0,
    grounded: true,
    stance: 'standing'
  });
  const ARENA_X_MIN = 10;
  const ARENA_X_MAX = 90;
  const canAimRef = useRef(canAim);
  canAimRef.current = canAim;

  useEffect(() => {
    aimSensitivityRef.current = aimSensitivity;
  }, [aimSensitivity]);

  useEffect(() => {
    aimPowerRef.current = aimPower;
  }, [aimPower]);

  useEffect(() => {
    aimAngleRef.current = aimAngle;
  }, [aimAngle]);

  useEffect(() => {
    isAimingRef.current = isAiming;
  }, [isAiming]);

  useEffect(() => {
    setTurnNudgeX(isPlayerTurn ? 1.6 : -1.6);
    const id = window.setTimeout(() => setTurnNudgeX(0), 480);
    return () => window.clearTimeout(id);
  }, [isPlayerTurn]);

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

  const trajectoryPreview = useMemo(() => {
    if (!isAiming || aimPower <= 5) {
      return { points: [] as { x: number; y: number }[], terminal: null as { x: number; y: number } | null };
    }
    const facing = isPlayerTurn;
    const startX = isPlayerTurn ? p1Move.x : p2Move.x;
    const startY =
      (isPlayerTurn ? P1_POS.y + p1Move.yOffset : P2_POS.y + p2Move.yOffset) +
      PROJECTILE_START_Y_OFFSET;
    return sampleTrajectoryWithTerminal({
      power: aimPower,
      angleDeg: aimAngle,
      shooterFacingRight: facing,
      velocityScale: activeWeapon.velocityScale,
      windSpeed: wind.speed,
      windDirection: wind.direction,
      startX,
      startY
    });
  }, [
    isAiming,
    aimPower,
    aimAngle,
    isPlayerTurn,
    p1Move.x,
    p1Move.yOffset,
    p2Move.x,
    p2Move.yOffset,
    activeWeapon.velocityScale,
    wind.speed,
    wind.direction
  ]);

  const previewPoints = trajectoryPreview.points;
  const previewTerminal = trajectoryPreview.terminal;

  const sceneCamera = useMemo(() => {
    const centerX = (p1Move.x + p2Move.x) / 2;
    const centerOffset = (50 - centerX) * 0.09;
    if (reduceMotion) {
      return { scale: 0.98, x: centerOffset + turnNudgeX, y: 0 };
    }
    const aimScale = isAiming ? 1 + (aimPower / 100) * 0.045 : 1;
    const panX =
      (isAiming
        ? (isPlayerTurn ? 1.35 : -1.35) * (aimPower / 100) * 1.1
        : 0) + turnNudgeX + centerOffset;
    const panY = isAiming ? -0.75 * (aimPower / 100) : 0;
    return { scale: aimScale * 0.98, x: panX, y: panY };
  }, [reduceMotion, isAiming, aimPower, isPlayerTurn, turnNudgeX, p1Move.x, p2Move.x]);

  const previewStroke = useMemo(
    () =>
      local2p
        ? isPlayerTurn
          ? progress.playerAccentHex
          : '#ff00e5'
        : progress.playerAccentHex,
    [local2p, isPlayerTurn, progress.playerAccentHex]
  );

  const projectileStart = useMemo(() => {
    const startX = isPlayerTurn ? p1Move.x : p2Move.x;
    const startY =
      (isPlayerTurn ? P1_POS.y + p1Move.yOffset : P2_POS.y + p2Move.yOffset) +
      PROJECTILE_START_Y_OFFSET;
    return { startX, startY };
  }, [isPlayerTurn, p1Move.x, p1Move.yOffset, p2Move.x, p2Move.yOffset]);

  const activeStance = isPlayerTurn ? p1Move.stance : p2Move.stance;

  const moveActivePlayer = useCallback((dx: number) => {
    if (isPlayerTurnRef.current) {
      setP1Move((s) => ({
        ...s,
        x: Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, s.x + dx))
      }));
    } else {
      setP2Move((s) => ({
        ...s,
        x: Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, s.x + dx))
      }));
    }
  }, []);

  const jumpActivePlayer = useCallback(() => {
    if (isPlayerTurnRef.current) {
      setP1Move((s) => {
        if (!s.grounded) return s;
        return { ...s, grounded: false, vy: -1.9, stance: 'jumping' };
      });
    } else {
      setP2Move((s) => {
        if (!s.grounded) return s;
        return { ...s, grounded: false, vy: -1.9, stance: 'jumping' };
      });
    }
  }, []);

  const cycleDownStance = useCallback(() => {
    const cycle = (stance: PlayerStance): PlayerStance =>
      stance === 'standing'
        ? 'crouching'
        : stance === 'crouching'
          ? 'prone'
          : 'standing';
    if (isPlayerTurnRef.current) {
      setP1Move((s) => ({ ...s, stance: cycle(s.stance) }));
    } else {
      setP2Move((s) => ({ ...s, stance: cycle(s.stance) }));
    }
  }, []);

  const playerStickerAim = useMemo(() => {
    if (!canAim || !isAiming || !isPlayerTurn) return null;
    return { isCharging: aimPower > 5, aimPullDeg };
  }, [canAim, isAiming, isPlayerTurn, aimPower, aimPullDeg]);

  const enemyStickerAim = useMemo(() => {
    if (!canAim || !isAiming || isPlayerTurn) return null;
    return { isCharging: aimPower > 5, aimPullDeg };
  }, [canAim, isAiming, isPlayerTurn, aimPower, aimPullDeg]);

  const turnBannerText = useMemo(() => {
    const base = local2p
      ? isPlayerTurn
        ? 'PLAYER 1 TURN'
        : 'PLAYER 2 TURN'
      : isPlayerTurn
        ? 'YOUR TURN'
        : 'ENEMY TURN';
    return `${base} - ${String(Math.ceil(turnTimeLeftMs / 1000)).padStart(2, '0')}S`;
  }, [local2p, isPlayerTurn, turnTimeLeftMs]);

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
      if (local2p) {
        return {
          winner,
          mode: 'local2p',
          turns: s.turns,
          player: {
            name: 'Player 1',
            rank: 1,
            damage: s.playerDamage,
            shots: s.playerShots,
            hits: s.playerHits,
            accuracy: Number(playerAccuracy.toFixed(1))
          },
          enemy: {
            name: 'Player 2',
            rank: 1,
            damage: s.enemyDamage,
            shots: s.enemyShots,
            hits: s.enemyHits,
            accuracy: Number(enemyAccuracy.toFixed(1))
          }
        };
      }
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
    [
      enemyName,
      enemyRank,
      gameMode,
      local2p,
      progress.playerName,
      progress.playerRank
    ]
  );

  const scheduleEnemyShot = useCallback(() => {
    const w = windRef.current;
    const sol = findBestAim({
      shooterFacingRight: false,
      velocityScale: enemyWeapon.velocityScale,
      windSpeed: w.speed,
      windDirection: w.direction,
      startX: p2Move.x,
      startY: P2_POS.y + p2Move.yOffset + PROJECTILE_START_Y_OFFSET,
      targetX: p1Move.x,
      targetY: P1_POS.y + p1Move.yOffset
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
  }, [enemyWeapon, enemyAimError, audioMuted, updateMatchStats, p1Move.x, p1Move.yOffset, p2Move.x, p2Move.yOffset]);

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
        speed: Math.max(
          0,
          Math.floor(Math.random() * windSpan) + windMin + (activeMap.windBias ?? 0)
        ),
        direction: (Math.random() > 0.5 ? 'right' : 'left') as
          | 'left'
          | 'right'
      };
      windRef.current = newWind;
      setWind(newWind);
      setIsPlayerTurn((t) => !t);
      if (!local2p && shooterWasPlayer) {
        setTimeout(() => scheduleEnemyShot(), 2000);
      }
    },
    [scheduleEnemyShot, progress.settings.difficulty, local2p, activeMap.windBias]
  );

  const handleShotResult = useCallback(
    (result: ShotResult) => {
      setTriggerFire(null);
      const shooterWasPlayer = result.shooterWasPlayer;
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

  const fireFromSnapshot = useCallback(() => {
    if (!canAimRef.current) return;
    const power = aimPowerRef.current;
    const angle = aimAngleRef.current;
    if (power < 5) return;

    if (local2p && p1LoadoutWeapon && p2LoadoutWeapon) {
      if (isPlayerTurnRef.current) {
        updateMatchStats((prev) => ({
          ...prev,
          playerShots: prev.playerShots + 1
        }));
        setTriggerFire({
          power,
          angle,
          timestamp: Date.now(),
          velocityScale: p1LoadoutWeapon.velocityScale,
          baseDamage: p1LoadoutWeapon.damage,
          projectileStyle: p1LoadoutWeapon.projectileStyle
        });
      } else {
        updateMatchStats((prev) => ({
          ...prev,
          enemyShots: prev.enemyShots + 1
        }));
        setTriggerFire({
          power,
          angle,
          timestamp: Date.now(),
          velocityScale: p2LoadoutWeapon.velocityScale,
          baseDamage: p2LoadoutWeapon.damage,
          projectileStyle: p2LoadoutWeapon.projectileStyle
        });
      }
    } else {
      updateMatchStats((prev) => ({
        ...prev,
        playerShots: prev.playerShots + 1
      }));
      setTriggerFire({
        power,
        angle,
        timestamp: Date.now(),
        velocityScale: selectedWeapon.velocityScale,
        baseDamage: selectedWeapon.damage,
        projectileStyle: selectedWeapon.projectileStyle
      });
    }
    setIsAiming(false);
    setAimPullDeg(0);
    if (!reduceMotion) {
      setReleaseShaking(true);
      window.setTimeout(() => setReleaseShaking(false), 340);
    }
    playBlip(440, 0.08, audioMuted);
  }, [
    local2p,
    p1LoadoutWeapon,
    p2LoadoutWeapon,
    selectedWeapon,
    updateMatchStats,
    audioMuted,
    reduceMotion
  ]);

  const handleFire = useCallback(() => {
    if (!canAim || aimPower < 5) return;
    aimPowerRef.current = aimPower;
    aimAngleRef.current = aimAngle;
    fireFromSnapshot();
  }, [canAim, aimPower, aimAngle, fireFromSnapshot]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const step = (s: PlayerMovementState): PlayerMovementState => {
        if (s.grounded) return s;
        const vy = s.vy + 0.13;
        const yOffset = s.yOffset + vy;
        if (yOffset >= 0) {
          return { ...s, yOffset: 0, vy: 0, grounded: true, stance: 'standing' };
        }
        return { ...s, yOffset, vy, stance: 'jumping' };
      };
      setP1Move(step);
      setP2Move(step);
    }, 16);
    return () => window.clearInterval(id);
  }, []);

  const skipCurrentTurn = useCallback(() => {
    if (triggerFire) return;
    setIsAiming(false);
    setAimPower(0);
    setAimPullDeg(0);
    setAimAngle(45);
    playBlip(180, 0.05, audioMuted);
    advanceWindAndTurn(isPlayerTurnRef.current);
  }, [advanceWindAndTurn, triggerFire, audioMuted]);

  useEffect(() => {
    deadlineRef.current = Date.now() + turnTimerConfig.durationSec * 1000;
    turnExpiredRef.current = false;
    pausedAtRef.current = null;
    setTurnTimeLeftMs(turnTimerConfig.durationSec * 1000);
  }, [isPlayerTurn, turnTimerConfig.durationSec]);

  useEffect(() => {
    const paused = settingsOpen || matchHelpOpen || !!triggerFire;
    if (paused) {
      if (!pausedAtRef.current) {
        pausedAtRef.current = Date.now();
      }
      return;
    }
    if (pausedAtRef.current && deadlineRef.current) {
      const pausedFor = Date.now() - pausedAtRef.current;
      deadlineRef.current += pausedFor;
      pausedAtRef.current = null;
    }
  }, [settingsOpen, matchHelpOpen, triggerFire]);

  useEffect(() => {
    if (settingsOpen || matchHelpOpen || triggerFire) return;
    const id = window.setInterval(() => {
      if (!deadlineRef.current) return;
      const left = Math.max(0, deadlineRef.current - Date.now());
      setTurnTimeLeftMs(left);
      if (left <= 0 && !turnExpiredRef.current) {
        turnExpiredRef.current = true;
        skipCurrentTurn();
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [settingsOpen, matchHelpOpen, triggerFire, skipCurrentTurn]);

  const timerWarnSecondRef = useRef<number | null>(null);
  useEffect(() => {
    const s = Math.ceil(turnTimeLeftMs / 1000);
    if (s > 3 || s <= 0) {
      timerWarnSecondRef.current = null;
      return;
    }
    if (timerWarnSecondRef.current === s) return;
    timerWarnSecondRef.current = s;
    playBlip(320 + s * 40, 0.04, audioMuted);
  }, [turnTimeLeftMs, audioMuted]);

  const handleSlingshotPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canAimRef.current || settingsOpen) return;
      const root = gameRootRef.current;
      if (!root) return;
      const pct = clientToArenaPercent(
        e.clientX,
        e.clientY,
        root.getBoundingClientRect()
      );
      const ax = isPlayerTurnRef.current ? p1Move.x : p2Move.x;
      const ay = isPlayerTurnRef.current
        ? P1_POS.y + p1Move.yOffset
        : P2_POS.y + p2Move.yOffset;
      if (!pointerNearAnchor(pct.x, pct.y, ax, ay, 10)) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      slingshotDraggingRef.current = true;
      setIsAiming(true);
      const facing = isPlayerTurnRef.current;
      const r = slingshotAimFromPointer(
        pct,
        { x: ax, y: ay },
        facing,
        aimSensitivityRef.current
      );
      setAimAngle(r.aimAngle);
      setAimPower(r.aimPower);
      setAimPullDeg(r.aimPullDeg);
      aimAngleRef.current = r.aimAngle;
      aimPowerRef.current = r.aimPower;
    },
    [settingsOpen, p1Move.x, p1Move.yOffset, p2Move.x, p2Move.yOffset]
  );

  const handleSlingshotPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!slingshotDraggingRef.current || !canAimRef.current) return;
      const root = gameRootRef.current;
      if (!root) return;
      const pct = clientToArenaPercent(
        e.clientX,
        e.clientY,
        root.getBoundingClientRect()
      );
      const ax = isPlayerTurnRef.current ? p1Move.x : p2Move.x;
      const ay = isPlayerTurnRef.current
        ? P1_POS.y + p1Move.yOffset
        : P2_POS.y + p2Move.yOffset;
      const facing = isPlayerTurnRef.current;
      const r = slingshotAimFromPointer(
        pct,
        { x: ax, y: ay },
        facing,
        aimSensitivityRef.current
      );
      setAimAngle(r.aimAngle);
      setAimPower(r.aimPower);
      setAimPullDeg(r.aimPullDeg);
      aimAngleRef.current = r.aimAngle;
      aimPowerRef.current = r.aimPower;
    },
    [p1Move.x, p1Move.yOffset, p2Move.x, p2Move.yOffset]
  );

  const handleSlingshotPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
      const wasDragging = slingshotDraggingRef.current;
      slingshotDraggingRef.current = false;
      if (!wasDragging) return;
      setIsAiming(false);
      setAimPullDeg(0);
      if (aimPowerRef.current >= 5) {
        fireFromSnapshot();
      }
    },
    [fireFromSnapshot]
  );

  const handleSlingshotPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      handleSlingshotPointerUp(e);
    },
    [handleSlingshotPointerUp]
  );

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!canAimRef.current || settingsOpen || matchHelpOpen) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;

      const k = ev.key;
      if (
        k === 'ArrowLeft' ||
        k === 'ArrowRight' ||
        k === 'a' ||
        k === 'A' ||
        k === 'd' ||
        k === 'D' ||
        k === 'w' ||
        k === 'W' ||
        k === 's' ||
        k === 'S' ||
        k === ' ' ||
        k === 'Enter'
      ) {
        ev.preventDefault();
      }

      if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        moveActivePlayer(-1.6);
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        moveActivePlayer(1.6);
      } else if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        jumpActivePlayer();
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        cycleDownStance();
      } else if (k === ' ' || k === 'Enter') {
        handleFire();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    settingsOpen,
    matchHelpOpen,
    handleFire,
    moveActivePlayer,
    jumpActivePlayer,
    cycleDownStance
  ]);

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

  useEffect(() => {
    if (!matchHelpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMatchHelpOpen(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [matchHelpOpen]);

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

  return (
    <div
      ref={gameRootRef}
      className="relative w-full min-h-dvh h-dvh overflow-hidden bg-[#0f0622] select-none touch-none">
      <motion.div
        className="absolute inset-0 origin-[50%_72%]"
        animate={{
          scale: sceneCamera.scale,
          x: sceneCamera.x,
          y: sceneCamera.y
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 140, damping: 20 }
        }>
        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion || !releaseShaking
              ? { x: 0, y: 0 }
              : { x: [0, -7, 7, -4, 4, 0], y: [0, 3, -3, 2, 0] }
          }
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.34, ease: 'easeOut' }
          }>
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
              mapId={mapId}
              playerPos={{ x: p1Move.x, y: P1_POS.y + p1Move.yOffset }}
              enemyPos={{ x: p2Move.x, y: P2_POS.y + p2Move.yOffset }}
              playerStance={p1Move.stance}
              enemyStance={p2Move.stance}
              triggerFire={triggerFire}
              onShotResult={handleShotResult}
              reduceMotion={reduceMotion}
              playerAccentHex={progress.playerAccentHex}
              playerCharacterId={
                local2p && local2pLoadout
                  ? local2pLoadout.p1CharacterId
                  : progress.equippedCharacterId
              }
              enemyCharacterId={
                local2p && local2pLoadout
                  ? local2pLoadout.p2CharacterId
                  : progress.equippedEnemyCharacterId
              }
              onReady={handleArenaReady}
              bodyPartDamage={local2p}
              playerStickerAim={playerStickerAim}
              enemyStickerAim={enemyStickerAim}
            />
          </GameSceneBoundary>
          <AimTrajectoryOverlay
            points={previewPoints}
            terminal={previewTerminal}
            startX={projectileStart.startX}
            startY={projectileStart.startY}
            aimAngleDeg={aimAngle}
            facingRight={isPlayerTurn}
            stroke={previewStroke}
            reduceMotion={reduceMotion}
            visible={isAiming && aimPower > 5}
          />
          <AimInteractionLayer
            active={canAim && !settingsOpen && !matchHelpOpen}
            onPointerDown={handleSlingshotPointerDown}
            onPointerMove={handleSlingshotPointerMove}
            onPointerUp={handleSlingshotPointerUp}
            onPointerCancel={handleSlingshotPointerCancel}
          />
        </motion.div>
      </motion.div>

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

      {!local2p && onboardingHintVisible && (
        <div className="pointer-events-auto absolute bottom-[max(5rem,env(safe-area-inset-bottom))] left-2 right-2 z-[22] mx-auto max-w-[min(22rem,calc(100vw-1rem))] sm:left-4 sm:right-4 sm:mx-0 sm:max-w-[min(22rem,calc(100vw-2rem))]">
          <GlassCard
            variant="sticker"
            className="space-y-3 border-neon-cyan/40 p-4 shadow-[0_0_24px_rgba(0,240,255,0.12)]">
            <p className="font-display text-xs font-bold tracking-wide text-white">
              Pull from your fighter to aim — release to fire (needs a little
              power). Wind shifts each volley.
            </p>
            {practice ? (
              <p className="text-[11px] text-neon-yellow font-display">
                Practice dummy never hits 0 HP.
              </p>
            ) : null}
            <NeonButton size="sm" variant="primary" onClick={dismissMatchTips}>
              Got it
            </NeonButton>
          </GlassCard>
        </div>
      )}

      {matchHelpOpen && (
        <div
          className="pointer-events-auto absolute bottom-[max(7rem,env(safe-area-inset-bottom))] left-2 right-2 z-[22] mx-auto w-[min(22rem,calc(100vw-1rem))] sm:left-auto sm:right-4 sm:mx-0 sm:w-[min(22rem,calc(100vw-2rem))]"
          role="dialog"
          aria-label="How to play">
          <GlassCard
            variant="sticker"
            className="space-y-3 border-neon-cyan/40 p-4 shadow-[0_0_24px_rgba(0,240,255,0.12)]">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-sm font-black text-neon-cyan tracking-wide">
                Controls
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-white"
                onClick={() => setMatchHelpOpen(false)}
                aria-label="Close">
                <XIcon size={18} />
              </button>
            </div>
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-gray-200 marker:text-neon-cyan">
              {local2p ? (
                <li>
                  Two players on one device — pass it back each turn; the
                  glowing fighter is active.
                </li>
              ) : (
                <li>Offline vs AI — not live PvP.</li>
              )}
              <li>Drag from the active fighter to aim; release to fire.</li>
              <li>Keys: arrows / WASD adjust aim; Space or Enter fires.</li>
              <li>Win by bringing the rival to 0 HP.</li>
            </ul>
            {local2p ? (
              <NeonButton
                size="sm"
                variant="secondary"
                onClick={() => setMatchHelpOpen(false)}>
                Close
              </NeonButton>
            ) : (
              <NeonButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  dismissMatchTips();
                }}>
                Don&apos;t show again
              </NeonButton>
            )}
          </GlassCard>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-[15] flex flex-col justify-between gap-3 p-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:gap-6 sm:p-6 md:gap-8 md:p-8">
        <div className="flex min-h-0 justify-between gap-1.5 sm:gap-4 md:gap-8 items-start">
          <GlassCard
            variant="sticker"
            className="pointer-events-auto flex min-w-0 max-w-[calc(50%-0.25rem)] flex-1 items-center gap-2 border-neon-cyan/35 bg-dark-card/80 p-2.5 shadow-[0_0_20px_rgba(0,240,255,0.12)] sm:max-w-[min(16rem,44vw)] sm:gap-3 sm:p-4 md:w-[18rem] md:max-w-[42vw] md:flex-none md:gap-4 md:p-5">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full border-2 border-neon-cyan overflow-hidden bg-dark-darker p-0.5 sm:h-12 sm:w-12 sm:border-2 sm:p-1">
                <StickerAvatar
                  characterId={
                    local2p && local2pLoadout
                      ? local2pLoadout.p1CharacterId
                      : progress.equippedCharacterId
                  }
                  side="player"
                  accentHex={progress.playerAccentHex}
                  className="h-full w-full"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-dark-card text-[9px] font-bold border border-neon-cyan rounded px-0.5 text-neon-cyan sm:-bottom-2 sm:-right-2 sm:text-[10px] sm:px-1">
                Lv.{playerRankLabel}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 truncate font-display text-[11px] font-bold text-white sm:mb-1 sm:text-sm">
                {playerDisplayName}
              </div>
              <ProgressBar
                progress={playerHp}
                color="bg-neon-cyan"
                height="h-3"
                showLabel
              />
            </div>
          </GlassCard>

          <div className="relative z-20 flex min-w-0 max-w-[36%] shrink flex-col items-center gap-2 sm:max-w-none sm:gap-4">
            {local2p && onExitMatch && (
              <div className="pointer-events-auto flex flex-col items-center gap-2 sm:flex-row">
                <GlassCard
                  variant="sticker"
                  interactive
                  aria-label="Exit match"
                  className="flex min-h-[44px] min-w-0 max-w-full items-center gap-1.5 border-neon-lime/40 px-2 py-2 sm:gap-2 sm:px-4"
                  onClick={() => onExitMatch()}>
                  <LogOutIcon size={18} className="shrink-0 text-neon-lime" />
                  <span className="whitespace-nowrap font-display text-[10px] font-black tracking-wide text-white sm:text-xs">
                    EXIT MATCH
                  </span>
                </GlassCard>
              </div>
            )}
            {practice && onExitMatch && (
              <div className="pointer-events-auto flex max-w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <GlassCard
                  variant="sticker"
                  interactive
                  className="flex min-h-[44px] items-center justify-center gap-2 border-neon-yellow/40 px-3 py-2"
                  onClick={() => onExitMatch()}>
                  <LogOutIcon size={18} className="text-neon-yellow" />
                  <span className="font-display text-[10px] font-black tracking-wide text-white sm:text-xs">
                    EXIT PRACTICE
                  </span>
                </GlassCard>
                <GlassCard
                  variant="sticker"
                  interactive
                  className="flex min-h-[44px] items-center justify-center gap-2 border-neon-lime/40 px-3 py-2"
                  onClick={() => {
                    setEnemyHp(100);
                    setPlayerHp(100);
                  }}>
                  <span className="text-center font-display text-[10px] font-black tracking-wide text-neon-lime sm:text-xs">
                    RESET DUMMY HP
                  </span>
                </GlassCard>
              </div>
            )}
            <GlassCard
              variant="sticker"
              className={`pointer-events-none rounded-full border px-3 py-1.5 ${
                turnTimeLeftMs <= 3000
                  ? 'border-neon-yellow/70 text-neon-yellow'
                  : 'border-white/30 text-white'
              }`}>
              <span
                className={`flex items-center gap-1.5 font-display text-xs font-black tracking-wide ${
                  turnTimeLeftMs <= 3000 && !reduceMotion ? 'animate-pulse' : ''
                }`}>
                <TimerIcon size={14} />
                {String(Math.ceil(turnTimeLeftMs / 1000)).padStart(2, '0')}s
              </span>
            </GlassCard>
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
                className="flex justify-center">
                <motion.div
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.04,
                        delayChildren: 0.06
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                  className={`flex max-w-[min(92vw,18rem)] flex-wrap justify-center gap-y-0.5 rounded-full border bg-dark-card/70 px-2 py-1.5 font-display text-[10px] font-black uppercase leading-tight tracking-[0.08em] drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:max-w-none sm:gap-y-1 sm:px-4 sm:py-2 sm:text-base sm:tracking-[0.14em] md:px-5 md:text-2xl md:tracking-[0.18em] ${isPlayerTurn ? 'text-neon-cyan border-neon-cyan/45' : 'text-neon-magenta border-neon-magenta/45'}`}>
                  {turnBannerText
                    .split('')
                    .map((ch, i) => (
                      <motion.span
                        key={`${isPlayerTurn ? 'p' : 'e'}-${i}-${ch}`}
                        variants={{
                          hidden: { y: 10, opacity: 0 },
                          visible: {
                            y: 0,
                            opacity: 1,
                            transition: { ease: 'easeOut' }
                          }
                        }}
                        className="inline-block">
                        {ch === ' ' ? '\u00A0' : ch}
                      </motion.span>
                    ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {canAim && (isAiming || aimPower > 4) ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none w-[min(14rem,72vw)]">
                <GlassCard
                  variant="sticker"
                  className={`border px-3 py-2 ${
                    isPlayerTurn
                      ? 'border-neon-cyan/40 shadow-[0_0_16px_rgba(0,240,255,0.12)]'
                      : 'border-neon-magenta/40 shadow-[0_0_16px_rgba(255,0,229,0.12)]'
                  }`}>
                  <div className="mb-1 flex justify-between font-display text-[10px] tracking-wide text-gray-300">
                    <span>POWER</span>
                    <span>{Math.round(aimPower)}%</span>
                  </div>
                  <motion.div
                    animate={
                      reduceMotion
                        ? {}
                        : aimPower > 85
                          ? {
                              scale: [1, 1.04, 1],
                              boxShadow: [
                                '0 0 0 rgba(0,240,255,0)',
                                isPlayerTurn
                                  ? '0 0 18px rgba(0,240,255,0.45)'
                                  : '0 0 18px rgba(255,0,229,0.45)',
                                '0 0 0 rgba(0,240,255,0)'
                              ]
                            }
                          : { scale: 1 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                    }>
                    <ProgressBar
                      progress={aimPower}
                      color={
                        aimPower > 80
                          ? 'bg-neon-magenta'
                          : isPlayerTurn
                            ? 'bg-neon-cyan'
                            : 'bg-neon-magenta'
                      }
                      height="h-2.5"
                      variant="arcade"
                      reduceMotion={reduceMotion}
                    />
                  </motion.div>
                </GlassCard>
              </motion.div>
            ) : null}

            <GlassCard
              variant="sticker"
              className="pointer-events-none flex items-center gap-2 rounded-full border-cyan-500/45 bg-dark-darker/90 px-2.5 py-1.5 shadow-[0_0_14px_rgba(0,240,255,0.14)] sm:gap-3 sm:px-4 sm:py-2">
              <WindIcon
                size={18}
                className="h-4 w-4 shrink-0 text-neon-cyan sm:h-[18px] sm:w-[18px]"
              />
              <span className="font-display text-xs font-bold sm:text-sm">
                {wind.speed}
              </span>
              <motion.div
                animate={windArrowMotion.animate}
                transition={windArrowMotion.transition}>
                {wind.direction === 'right' ? '→' : '←'}
              </motion.div>
            </GlassCard>
            <p className="pointer-events-none font-display text-[10px] uppercase tracking-[0.18em] text-gray-300">
              {activeMap.name}
            </p>
          </div>

          <GlassCard
            variant="sticker"
            className="pointer-events-auto flex min-w-0 max-w-[calc(50%-0.25rem)] flex-1 flex-row-reverse items-center gap-2 border-neon-magenta/35 bg-dark-card/80 p-2.5 shadow-[0_0_20px_rgba(255,0,229,0.12)] sm:max-w-[min(16rem,44vw)] sm:gap-3 sm:p-4 md:w-[18rem] md:max-w-[42vw] md:flex-none md:gap-4 md:p-5">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full border-2 border-neon-magenta overflow-hidden bg-dark-darker p-0.5 sm:h-12 sm:w-12 sm:border-2 sm:p-1">
                <StickerAvatar
                  characterId={
                    local2p && local2pLoadout
                      ? local2pLoadout.p2CharacterId
                      : progress.equippedEnemyCharacterId
                  }
                  side="enemy"
                  accentHex="#ff00e5"
                  className="h-full w-full"
                />
              </div>
              <div className="absolute -bottom-1.5 -left-1.5 bg-dark-card text-[9px] font-bold border border-neon-magenta rounded px-0.5 text-neon-magenta sm:-bottom-2 sm:-left-2 sm:text-[10px] sm:px-1">
                Lv.{enemyRankLabel}
              </div>
            </div>
            <div className="min-w-0 flex-1 text-right">
              <div className="mb-0.5 truncate font-display text-[11px] font-bold text-white sm:mb-1 sm:text-sm">
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

        <div className="flex min-h-0 items-end justify-between gap-2 sm:gap-6 md:gap-8">
          <div className="pointer-events-auto flex w-[7.25rem] shrink-0 flex-wrap gap-1 sm:w-12 sm:gap-0">
            <GlassCard
              variant="sticker"
              interactive
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
              onClick={() => moveActivePlayer(-1.8)}
              aria-label="Move backward">
              <MoveLeftIcon size={18} />
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
              onClick={() => moveActivePlayer(1.8)}
              aria-label="Move forward">
              <MoveRightIcon size={18} />
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
              onClick={jumpActivePlayer}
              aria-label="Jump">
              <ArrowUpIcon size={18} />
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
              onClick={cycleDownStance}
              aria-label="Crouch or prone">
              <ArrowDownIcon size={18} />
            </GlassCard>
          </div>

          <div className="pointer-events-none mt-1 hidden w-[7.25rem] text-center sm:block">
            <span className="font-display text-[10px] uppercase tracking-wide text-gray-400">
              {activeStance}
            </span>
          </div>

          <AnimatePresence>
            {!local2p && (
              <motion.div
                initial={{
                  y: 80,
                  opacity: 0
                }}
                animate={{
                  y: 0,
                  opacity: 1
                }}
                exit={{
                  y: 80,
                  opacity: 0
                }}
                className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col items-center gap-2 px-4">
                <div className="w-full space-y-1">
                  {!canAim ? (
                    <p className="text-center font-display text-[10px] uppercase tracking-wide text-gray-500">
                      Weapons apply on your next turn
                    </p>
                  ) : null}
                  <div className="flex justify-center">
                    <GlassCard
                      variant="sticker"
                      interactive
                      aria-label="Weapon loadout"
                      className="min-h-[44px] px-4 py-2 flex items-center justify-center border-white/25"
                      onClick={() =>
                        loadoutScrollRef.current?.scrollIntoView({
                          behavior: reduceMotion ? 'auto' : 'smooth',
                          block: 'nearest',
                          inline: 'nearest'
                        })
                      }>
                      <span className="font-display text-[10px] uppercase tracking-[0.25em] text-gray-500 text-center">
                        LOADOUT
                      </span>
                    </GlassCard>
                  </div>
                  <div className="relative w-full">
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 bg-gradient-to-r from-[#0f0622] to-transparent"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-[#0f0622] to-transparent"
                      aria-hidden
                    />
                    <div
                      ref={loadoutScrollRef}
                      className="relative z-0 flex touch-pan-x snap-x snap-mandatory flex-nowrap gap-1.5 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth px-2 py-1 pb-1 [-webkit-overflow-scrolling:touch]">
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
                            className="max-w-[9.5rem] shrink-0 snap-start">
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
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex flex-wrap items-center justify-end gap-2 pointer-events-auto sm:gap-4">
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-14 right-0 left-auto z-20 w-[min(18rem,calc(100vw-1rem-env(safe-area-inset-left)-env(safe-area-inset-right)))] sm:bottom-16">
                  <GlassCard
                    variant="sticker"
                    className="space-y-4 border-neon-purple/35 p-4 sm:space-y-5 sm:p-6">
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
                    <div>
                      <label className="text-xs text-gray-400 font-display block mb-1">
                        Turn timer (seconds)
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={10}
                        step={1}
                        value={turnTimerConfig.durationSec}
                        onChange={(e) =>
                          setTurnTimerConfig({
                            durationSec: Number(e.target.value)
                          })
                        }
                        className="w-full"
                      />
                      <p className="mt-1 text-[11px] text-gray-500 font-display">
                        {turnTimerConfig.durationSec}s (timeout: skip turn)
                      </p>
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

                    {!local2p && (
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
                    )}

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
              onClick={() => setMatchHelpOpen(true)}
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
