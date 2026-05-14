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
  Weapon
} from '../types';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { GameSceneBoundary } from '../components/game/GameSceneBoundary';
import {
  GROUND_Y,
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
  const playerHpRef = useRef(playerHp);
  const enemyHpRef = useRef(enemyHp);
  const local2pRef = useRef(local2p);
  const settingsOpenRef = useRef(settingsOpen);
  const matchHelpOpenRef = useRef(matchHelpOpen);
  playerHpRef.current = playerHp;
  enemyHpRef.current = enemyHp;
  local2pRef.current = local2p;
  settingsOpenRef.current = settingsOpen;
  matchHelpOpenRef.current = matchHelpOpen;
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
  const canAim = !local2p;
  const activeMap = useMemo(() => getMapById(mapId), [mapId]);
  const groundY = activeMap.groundYPercent ?? GROUND_Y;
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

  const [chargingBy, setChargingBy] = useState<'p1' | 'p2' | null>(null);
  const [p1Charge01, setP1Charge01] = useState(0);
  const [p2Charge01, setP2Charge01] = useState(0);
  const [playerHitTint, setPlayerHitTint] = useState(false);
  const [enemyHitTint, setEnemyHitTint] = useState(false);
  const keysHeldRef = useRef({
    p1Left: false,
    p1Right: false,
    p2Left: false,
    p2Right: false
  });
  const chargeStartRef = useRef<{ p1: number | null; p2: number | null }>({
    p1: null,
    p2: null
  });

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

  const trajectoryPreview = useMemo(() => {
    if (local2p && p1LoadoutWeapon && p2LoadoutWeapon && chargingBy) {
      const shooterP1 = chargingBy === 'p1';
      const w = shooterP1 ? p1LoadoutWeapon : p2LoadoutWeapon;
      const ch = shooterP1 ? p1Charge01 : p2Charge01;
      const sol = findBestAim({
        shooterFacingRight: shooterP1,
        velocityScale: w.velocityScale,
        windSpeed: wind.speed,
        windDirection: wind.direction,
        startX: shooterP1 ? p1Move.x : p2Move.x,
        startY:
          (shooterP1 ? P1_POS.y + p1Move.yOffset : P2_POS.y + p2Move.yOffset) +
          PROJECTILE_START_Y_OFFSET,
        targetX: shooterP1 ? p2Move.x : p1Move.x,
        targetY: shooterP1
          ? P2_POS.y + p2Move.yOffset
          : P1_POS.y + p1Move.yOffset,
        groundY
      });
      const pMin = 25;
      const power = Math.max(
        pMin,
        pMin + (sol.power - pMin) * Math.max(0.08, ch)
      );
      const { points, terminal } = sampleTrajectoryWithTerminal({
        power,
        angleDeg: sol.angleDeg,
        shooterFacingRight: shooterP1,
        velocityScale: w.velocityScale,
        windSpeed: wind.speed,
        windDirection: wind.direction,
        startX: shooterP1 ? p1Move.x : p2Move.x,
        startY:
          (shooterP1 ? P1_POS.y + p1Move.yOffset : P2_POS.y + p2Move.yOffset) +
          PROJECTILE_START_Y_OFFSET,
        groundY
      });
      return {
        points,
        terminal,
        aimAngleDeg: sol.angleDeg,
        facingRight: shooterP1
      };
    }
    if (!isAiming || aimPower <= 5) {
      return {
        points: [] as { x: number; y: number }[],
        terminal: null as { x: number; y: number } | null,
        aimAngleDeg: aimAngle,
        facingRight: true
      };
    }
    const startX = p1Move.x;
    const startY = P1_POS.y + p1Move.yOffset + PROJECTILE_START_Y_OFFSET;
    const { points, terminal } = sampleTrajectoryWithTerminal({
      power: aimPower,
      angleDeg: aimAngle,
      shooterFacingRight: true,
      velocityScale: selectedWeapon.velocityScale,
      windSpeed: wind.speed,
      windDirection: wind.direction,
      startX,
      startY,
      groundY
    });
    return {
      points,
      terminal,
      aimAngleDeg: aimAngle,
      facingRight: true
    };
  }, [
    local2p,
    p1LoadoutWeapon,
    p2LoadoutWeapon,
    chargingBy,
    p1Charge01,
    p2Charge01,
    p1Move.x,
    p1Move.yOffset,
    p2Move.x,
    p2Move.yOffset,
    wind.speed,
    wind.direction,
    groundY,
    isAiming,
    aimPower,
    aimAngle,
    selectedWeapon.velocityScale
  ]);

  const previewPoints = trajectoryPreview.points;
  const previewTerminal = trajectoryPreview.terminal;
  const previewAimAngleDeg = trajectoryPreview.aimAngleDeg;
  const previewFacingRight = trajectoryPreview.facingRight;

  const sceneCamera = useMemo(() => {
    const centerX = (p1Move.x + p2Move.x) / 2;
    const centerOffset = (50 - centerX) * 0.09;
    if (reduceMotion) {
      return { scale: 0.98, x: centerOffset, y: 0 };
    }
    const aimScale = isAiming ? 1 + (aimPower / 100) * 0.045 : 1;
    const panX =
      (isAiming ? 1.35 * (aimPower / 100) * 1.1 : 0) + centerOffset;
    const panY = isAiming ? -0.75 * (aimPower / 100) : 0;
    return { scale: aimScale * 0.98, x: panX, y: panY };
  }, [reduceMotion, isAiming, aimPower, p1Move.x, p2Move.x]);

  const previewStroke = useMemo(
    () =>
      local2p && chargingBy === 'p2'
        ? '#ff00e5'
        : progress.playerAccentHex,
    [local2p, chargingBy, progress.playerAccentHex]
  );

  const projectileStart = useMemo(() => {
    if (local2p && chargingBy === 'p2') {
      return {
        startX: p2Move.x,
        startY: P2_POS.y + p2Move.yOffset + PROJECTILE_START_Y_OFFSET
      };
    }
    return {
      startX: p1Move.x,
      startY: P1_POS.y + p1Move.yOffset + PROJECTILE_START_Y_OFFSET
    };
  }, [
    local2p,
    chargingBy,
    p1Move.x,
    p1Move.yOffset,
    p2Move.x,
    p2Move.yOffset
  ]);

  const activeStance = p1Move.stance;

  const moveP1 = useCallback((dx: number) => {
    if (playerHp <= 0) return;
    setP1Move((s) => ({
      ...s,
      x: Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, s.x + dx))
    }));
  }, [playerHp]);

  const moveP2 = useCallback((dx: number) => {
    if (enemyHp <= 0) return;
    setP2Move((s) => ({
      ...s,
      x: Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, s.x + dx))
    }));
  }, [enemyHp]);

  const jumpP1 = useCallback(() => {
    if (playerHp <= 0) return;
    setP1Move((s) => {
      if (!s.grounded) return s;
      return { ...s, grounded: false, vy: -1.9, stance: 'jumping' };
    });
  }, [playerHp]);

  const jumpP2 = useCallback(() => {
    if (enemyHp <= 0) return;
    setP2Move((s) => {
      if (!s.grounded) return s;
      return { ...s, grounded: false, vy: -1.9, stance: 'jumping' };
    });
  }, [enemyHp]);

  const cycleP1Stance = useCallback(() => {
    const cycle = (stance: PlayerStance): PlayerStance =>
      stance === 'standing'
        ? 'crouching'
        : stance === 'crouching'
          ? 'prone'
          : 'standing';
    if (playerHp <= 0) return;
    setP1Move((s) => ({ ...s, stance: cycle(s.stance) }));
  }, [playerHp]);

  const playerStickerAim = useMemo(() => {
    if (local2p) {
      if (chargingBy !== 'p1') return null;
      return { isCharging: p1Charge01 > 0.02, aimPullDeg: 0 };
    }
    if (!canAim || !isAiming) return null;
    return { isCharging: aimPower > 5, aimPullDeg };
  }, [local2p, chargingBy, p1Charge01, canAim, isAiming, aimPower, aimPullDeg]);

  const enemyStickerAim = useMemo(() => {
    if (local2p) {
      if (chargingBy !== 'p2') return null;
      return { isCharging: p2Charge01 > 0.02, aimPullDeg: 0 };
    }
    return null;
  }, [local2p, chargingBy, p2Charge01]);

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

  const rollWind = useCallback(() => {
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
      direction: (Math.random() > 0.5 ? 'right' : 'left') as 'left' | 'right'
    };
    windRef.current = newWind;
    setWind(newWind);
  }, [progress.settings.difficulty, activeMap.windBias]);

  const scheduleEnemyShot = useCallback(() => {
    if (enemyHp <= 0 || playerHp <= 0) return;
    const w = windRef.current;
    const sol = findBestAim({
      shooterFacingRight: false,
      velocityScale: enemyWeapon.velocityScale,
      windSpeed: w.speed,
      windDirection: w.direction,
      startX: p2Move.x,
      startY: P2_POS.y + p2Move.yOffset + PROJECTILE_START_Y_OFFSET,
      targetX: p1Move.x,
      targetY: P1_POS.y + p1Move.yOffset,
      groundY
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
      projectileStyle: enemyWeapon.projectileStyle,
      shooterWasPlayer: false
    });
    updateMatchStats((prev) => ({ ...prev, enemyShots: prev.enemyShots + 1 }));
    playBlip(220, 0.06, audioMuted);
  }, [
    enemyWeapon,
    enemyAimError,
    audioMuted,
    updateMatchStats,
    p1Move.x,
    p1Move.yOffset,
    p2Move.x,
    p2Move.yOffset,
    groundY,
    enemyHp,
    playerHp
  ]);

  const scheduleEnemyShotRef = useRef(scheduleEnemyShot);
  scheduleEnemyShotRef.current = scheduleEnemyShot;
  const nextEnemyTimeoutRef = useRef<number | null>(null);

  const handleShotResult = useCallback(
    (result: ShotResult) => {
      setTriggerFire(null);
      const shooterWasPlayer = result.shooterWasPlayer;
      updateMatchStats((prev) => ({ ...prev, turns: prev.turns + 1 }));
      rollWind();

      const queueNextEnemy = () => {
        if (local2pRef.current) return;
        if (nextEnemyTimeoutRef.current != null) {
          window.clearTimeout(nextEnemyTimeoutRef.current);
        }
        nextEnemyTimeoutRef.current = window.setTimeout(() => {
          nextEnemyTimeoutRef.current = null;
          if (local2pRef.current) return;
          if (settingsOpenRef.current || matchHelpOpenRef.current) return;
          if (playerHpRef.current <= 0 || enemyHpRef.current <= 0) return;
          scheduleEnemyShotRef.current();
        }, 2600);
      };

      if (result.outcome === 'miss') {
        playMiss(audioMuted);
        if (typeof navigator !== 'undefined' && navigator.vibrate && !audioMuted) {
          navigator.vibrate(20);
        }
        queueNextEnemy();
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
        setEnemyHitTint(true);
        window.setTimeout(() => setEnemyHitTint(false), 220);
        setEnemyHp((prev) => {
          const next = practice
            ? Math.max(1, prev - damage)
            : Math.max(0, prev - damage);
          if (!practice && next <= 0) {
            setTimeout(() => onGameOver(buildMatchResult('player')), 1500);
          }
          return next;
        });
      } else {
        updateMatchStats((prev) => ({
          ...prev,
          enemyHits: prev.enemyHits + 1,
          enemyDamage: prev.enemyDamage + damage
        }));
        setPlayerHitTint(true);
        window.setTimeout(() => setPlayerHitTint(false), 220);
        setPlayerHp((prev) => {
          const next = Math.max(0, prev - damage);
          if (next <= 0) {
            setTimeout(() => onGameOver(buildMatchResult('enemy')), 1500);
          }
          return next;
        });
      }
      queueNextEnemy();
    },
    [
      practice,
      audioMuted,
      rollWind,
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
      projectileStyle: selectedWeapon.projectileStyle,
      shooterWasPlayer: true
    });
    setIsAiming(false);
    setAimPullDeg(0);
    if (!reduceMotion) {
      setReleaseShaking(true);
      window.setTimeout(() => setReleaseShaking(false), 340);
    }
    playBlip(440, 0.08, audioMuted);
  }, [selectedWeapon, updateMatchStats, audioMuted, reduceMotion]);

  const fireKeyboardVolley = useCallback(
    (shooterWasPlayer: boolean, charge01: number) => {
      if (!local2p || !p1LoadoutWeapon || !p2LoadoutWeapon) return;
      const dead = shooterWasPlayer ? playerHp <= 0 : enemyHp <= 0;
      if (dead) return;
      const w = shooterWasPlayer ? p1LoadoutWeapon : p2LoadoutWeapon;
      const sol = findBestAim({
        shooterFacingRight: shooterWasPlayer,
        velocityScale: w.velocityScale,
        windSpeed: wind.speed,
        windDirection: wind.direction,
        startX: shooterWasPlayer ? p1Move.x : p2Move.x,
        startY:
          (shooterWasPlayer ? P1_POS.y + p1Move.yOffset : P2_POS.y + p2Move.yOffset) +
          PROJECTILE_START_Y_OFFSET,
        targetX: shooterWasPlayer ? p2Move.x : p1Move.x,
        targetY: shooterWasPlayer
          ? P2_POS.y + p2Move.yOffset
          : P1_POS.y + p1Move.yOffset,
        groundY
      });
      const pMin = 25;
      const power = Math.max(
        pMin,
        pMin + (sol.power - pMin) * Math.max(0.08, charge01)
      );
      if (power < pMin + 0.01) return;
      if (shooterWasPlayer) {
        updateMatchStats((prev) => ({
          ...prev,
          playerShots: prev.playerShots + 1
        }));
      } else {
        updateMatchStats((prev) => ({
          ...prev,
          enemyShots: prev.enemyShots + 1
        }));
      }
      setTriggerFire({
        power,
        angle: sol.angleDeg,
        timestamp: Date.now(),
        velocityScale: w.velocityScale,
        baseDamage: w.damage,
        projectileStyle: w.projectileStyle,
        shooterWasPlayer
      });
      if (!reduceMotion) {
        setReleaseShaking(true);
        window.setTimeout(() => setReleaseShaking(false), 220);
      }
      playBlip(440, 0.08, audioMuted);
    },
    [
      local2p,
      p1LoadoutWeapon,
      p2LoadoutWeapon,
      playerHp,
      enemyHp,
      wind.speed,
      wind.direction,
      p1Move.x,
      p1Move.yOffset,
      p2Move.x,
      p2Move.yOffset,
      groundY,
      updateMatchStats,
      audioMuted,
      reduceMotion
    ]
  );

  const fireKeyboardVolleyRef = useRef(fireKeyboardVolley);
  fireKeyboardVolleyRef.current = fireKeyboardVolley;

  useEffect(() => {
    if (local2p) return;
    const id = window.setTimeout(() => scheduleEnemyShotRef.current(), 2200);
    return () => window.clearTimeout(id);
  }, [local2p]);

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

  useEffect(() => {
    const id = window.setInterval(() => {
      const k = keysHeldRef.current;
      if (k.p1Left) moveP1(-1.6);
      if (k.p1Right) moveP1(1.6);
      if (k.p2Left) moveP2(-1.6);
      if (k.p2Right) moveP2(1.6);
    }, 16);
    return () => window.clearInterval(id);
  }, [moveP1, moveP2]);

  useEffect(() => {
    if (!local2p) return;
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      if (chargeStartRef.current.p1 != null) {
        setP1Charge01(Math.min(1, (now - chargeStartRef.current.p1) / 1400));
      } else {
        setP1Charge01(0);
      }
      if (chargeStartRef.current.p2 != null) {
        setP2Charge01(Math.min(1, (now - chargeStartRef.current.p2) / 1400));
      } else {
        setP2Charge01(0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [local2p]);

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
      const ax = p1Move.x;
      const ay = P1_POS.y + p1Move.yOffset;
      if (!pointerNearAnchor(pct.x, pct.y, ax, ay, 10)) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      slingshotDraggingRef.current = true;
      setIsAiming(true);
      const r = slingshotAimFromPointer(
        pct,
        { x: ax, y: ay },
        true,
        aimSensitivityRef.current
      );
      setAimAngle(r.aimAngle);
      setAimPower(r.aimPower);
      setAimPullDeg(r.aimPullDeg);
      aimAngleRef.current = r.aimAngle;
      aimPowerRef.current = r.aimPower;
    },
    [settingsOpen, p1Move.x, p1Move.yOffset]
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
      const ax = p1Move.x;
      const ay = P1_POS.y + p1Move.yOffset;
      const r = slingshotAimFromPointer(
        pct,
        { x: ax, y: ay },
        true,
        aimSensitivityRef.current
      );
      setAimAngle(r.aimAngle);
      setAimPower(r.aimPower);
      setAimPullDeg(r.aimPullDeg);
      aimAngleRef.current = r.aimAngle;
      aimPowerRef.current = r.aimPower;
    },
    [p1Move.x, p1Move.yOffset]
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
    const onKeyDown = (ev: KeyboardEvent) => {
      if (settingsOpen || matchHelpOpen) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;

      if (local2p) {
        const k = ev.key;
        if (
          ['a', 'A', 'd', 'D', 'w', 'W', 'f', 'F', 'l', 'L'].includes(k) ||
          k === 'ArrowLeft' ||
          k === 'ArrowRight' ||
          k === 'ArrowUp'
        ) {
          ev.preventDefault();
        }
        if (k === 'a' || k === 'A') keysHeldRef.current.p1Left = true;
        else if (k === 'd' || k === 'D') keysHeldRef.current.p1Right = true;
        else if (k === 'w' || k === 'W') {
          if (ev.repeat) return;
          if (playerHpRef.current > 0) jumpP1();
        } else if (k === 'f' || k === 'F') {
          if (playerHpRef.current > 0 && chargeStartRef.current.p1 == null) {
            chargeStartRef.current.p1 = performance.now();
            setChargingBy('p1');
          }
        } else if (k === 'ArrowLeft') keysHeldRef.current.p2Left = true;
        else if (k === 'ArrowRight') keysHeldRef.current.p2Right = true;
        else if (k === 'ArrowUp') {
          if (ev.repeat) return;
          if (enemyHpRef.current > 0) jumpP2();
        } else if (k === 'l' || k === 'L') {
          if (enemyHpRef.current > 0 && chargeStartRef.current.p2 == null) {
            chargeStartRef.current.p2 = performance.now();
            setChargingBy('p2');
          }
        }
        return;
      }

      if (!canAimRef.current) return;
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
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') moveP1(-1.6);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') moveP1(1.6);
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        if (ev.repeat) return;
        jumpP1();
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') cycleP1Stance();
      else if (k === ' ' || k === 'Enter') handleFire();
    };

    const onKeyUp = (ev: KeyboardEvent) => {
      if (settingsOpen || matchHelpOpen) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;

      if (local2p) {
        const k = ev.key;
        if (k === 'a' || k === 'A') keysHeldRef.current.p1Left = false;
        else if (k === 'd' || k === 'D') keysHeldRef.current.p1Right = false;
        else if (k === 'ArrowLeft') keysHeldRef.current.p2Left = false;
        else if (k === 'ArrowRight') keysHeldRef.current.p2Right = false;
        else if (k === 'f' || k === 'F') {
          const started = chargeStartRef.current.p1;
          chargeStartRef.current.p1 = null;
          setChargingBy((c) => (c === 'p1' ? null : c));
          if (started != null && playerHpRef.current > 0) {
            const ch = Math.min(1, (performance.now() - started) / 1400);
            fireKeyboardVolleyRef.current(true, ch);
          }
        } else if (k === 'l' || k === 'L') {
          const started = chargeStartRef.current.p2;
          chargeStartRef.current.p2 = null;
          setChargingBy((c) => (c === 'p2' ? null : c));
          if (started != null && enemyHpRef.current > 0) {
            const ch = Math.min(1, (performance.now() - started) / 1400);
            fireKeyboardVolleyRef.current(false, ch);
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    settingsOpen,
    matchHelpOpen,
    local2p,
    handleFire,
    moveP1,
    jumpP1,
    cycleP1Stance,
    jumpP2
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
      className="relative w-full min-h-dvh h-dvh overflow-hidden bg-dark-darker select-none touch-none">
      <div className="absolute inset-0">
      <GameSceneBoundary
        fallback={
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <GlassCard
              variant="sticker"
              className="w-full max-w-xl p-7 text-center shadow-glass backdrop-blur-md border-neon-magenta/60">
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
          windSpeed={wind.speed}
          windDirection={wind.direction}
          playerHp={playerHp}
          enemyHp={enemyHp}
          mapId={mapId}
          groundY={groundY}
          playerHitTint={playerHitTint}
          enemyHitTint={enemyHitTint}
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
          wrapDynamic={(playfield) => (
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
                {playfield}
                <AimTrajectoryOverlay
                  points={previewPoints}
                  terminal={previewTerminal}
                  startX={projectileStart.startX}
                  startY={projectileStart.startY}
                  aimAngleDeg={previewAimAngleDeg}
                  facingRight={previewFacingRight}
                  stroke={previewStroke}
                  reduceMotion={reduceMotion}
                  visible={
                    local2p
                      ? !!chargingBy &&
                        (chargingBy === 'p1' ? p1Charge01 : p2Charge01) > 0.02
                      : isAiming && aimPower > 5
                  }
                />
                {!local2p ? (
                  <AimInteractionLayer
                    active={canAim && !settingsOpen && !matchHelpOpen}
                    onPointerDown={handleSlingshotPointerDown}
                    onPointerMove={handleSlingshotPointerMove}
                    onPointerUp={handleSlingshotPointerUp}
                    onPointerCancel={handleSlingshotPointerCancel}
                  />
                ) : null}
              </motion.div>
            </motion.div>
          )}
        />
      </GameSceneBoundary>
      </div>

      {arenaFallbackVisible && !arenaReady && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center px-6">
          <GlassCard
            variant="sticker"
            className="w-full max-w-lg p-6 text-center shadow-glass backdrop-blur-md border-neon-yellow/60 bg-dark-card/90">
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
            className="space-y-3 border-neon-cyan/40 p-4 shadow-glass backdrop-blur-md">
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
            className="space-y-3 border-neon-cyan/40 p-4 shadow-glass backdrop-blur-md">
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
                  Same keyboard: P1 A/D move, W jump, hold F to charge and release
                  to shoot. P2 arrows move/jump, hold L to charge and release to
                  shoot.
                </li>
              ) : (
                <li>Offline vs AI — not live PvP.</li>
              )}
              <li>Drag from your fighter to aim; release to fire (solo / vs AI).</li>
              <li>
                Keys: WASD + arrows move/jump (solo); Space or Enter fires after
                aiming.
              </li>
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
            className="pointer-events-auto flex min-w-0 max-w-[calc(50%-0.25rem)] flex-1 items-center gap-2 border-neon-cyan/35 bg-dark-card/85 p-2.5 shadow-glass backdrop-blur-md sm:max-w-[min(16rem,44vw)] sm:gap-3 sm:p-4 md:w-[18rem] md:max-w-[42vw] md:flex-none md:gap-4 md:p-5">
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
            {local2p ? (
              <GlassCard
                variant="sticker"
                className="pointer-events-none rounded-full border border-neon-lime/50 px-3 py-1.5 text-neon-lime">
                <span className="font-display text-[10px] font-black tracking-wide sm:text-xs">
                  REAL-TIME
                </span>
              </GlassCard>
            ) : null}

            {!local2p && canAim && (isAiming || aimPower > 4) ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none w-[min(14rem,72vw)]">
                <GlassCard
                  variant="sticker"
                  className="border border-neon-cyan/40 px-3 py-2 shadow-[0_0_16px_rgba(0,240,255,0.12)]">
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
                                '0 0 18px rgba(0,240,255,0.45)',
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
                        aimPower > 80 ? 'bg-neon-magenta' : 'bg-neon-cyan'
                      }
                      height="h-2.5"
                      variant="arcade"
                      reduceMotion={reduceMotion}
                    />
                  </motion.div>
                </GlassCard>
              </motion.div>
            ) : null}

            {local2p &&
            chargingBy &&
            (chargingBy === 'p1' ? p1Charge01 : p2Charge01) > 0.02 ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none w-[min(14rem,72vw)]">
                <GlassCard
                  variant="sticker"
                  className={`border px-3 py-2 ${
                    chargingBy === 'p1'
                      ? 'border-neon-cyan/40 shadow-[0_0_16px_rgba(0,240,255,0.12)]'
                      : 'border-neon-magenta/40 shadow-[0_0_16px_rgba(255,0,229,0.12)]'
                  }`}>
                  <div className="mb-1 flex justify-between font-display text-[10px] tracking-wide text-gray-300">
                    <span>CHARGE</span>
                    <span>
                      {Math.round(
                        (chargingBy === 'p1' ? p1Charge01 : p2Charge01) * 100
                      )}
                      %
                    </span>
                  </div>
                  <ProgressBar
                    progress={
                      (chargingBy === 'p1' ? p1Charge01 : p2Charge01) * 100
                    }
                    color={
                      chargingBy === 'p1' ? 'bg-neon-cyan' : 'bg-neon-magenta'
                    }
                    height="h-2.5"
                    variant="arcade"
                    reduceMotion={reduceMotion}
                  />
                </GlassCard>
              </motion.div>
            ) : null}

            <GlassCard
              variant="sticker"
              className="pointer-events-none flex items-center gap-2 rounded-full border-cyan-500/45 bg-dark-darker/90 px-2.5 py-1.5 shadow-glass backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2">
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
            className="pointer-events-auto flex min-w-0 max-w-[calc(50%-0.25rem)] flex-1 flex-row-reverse items-center gap-2 border-neon-magenta/35 bg-dark-card/85 p-2.5 shadow-glass backdrop-blur-md sm:max-w-[min(16rem,44vw)] sm:gap-3 sm:p-4 md:w-[18rem] md:max-w-[42vw] md:flex-none md:gap-4 md:p-5">
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
              onClick={() => moveP1(-1.8)}
              aria-label="Move backward">
              <MoveLeftIcon size={18} />
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
              onClick={() => moveP1(1.8)}
              aria-label="Move forward">
              <MoveRightIcon size={18} />
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
              onClick={jumpP1}
              aria-label="Jump">
              <ArrowUpIcon size={18} />
            </GlassCard>
            <GlassCard
              variant="sticker"
              interactive
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
              onClick={cycleP1Stance}
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
