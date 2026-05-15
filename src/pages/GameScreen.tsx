import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
import type { Local2pLoadout, MapId, Weapon } from '../types';
import { getMapById } from '../game/maps';
import { getMapWindBias } from '../game/mapPlayfield';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { GameSceneBoundary } from '../components/game/GameSceneBoundary';
import {
  P1_POS,
  P2_POS,
  PROJECTILE_START_Y_OFFSET,
  applyAimError,
  estimateGroundLandingPoint,
  findBestAim,
  sampleTrajectoryPoints
} from '../game/artilleryPhysics';
import { getWeaponById, pickEnemyWeaponId } from '../game/weapons';
import { PLAYABLE_WEAPON_PRESETS } from '../game/weaponsCatalog';
import { getSkillBehavior } from '../game/skillBehaviorConfig';
import { playBlip, playHit, playMiss } from '../game/gameAudio';
import type { MatchResult } from '../game/matchResult';
import { STORAGE } from '../game/storageKeys';
import { AimLinkPanel } from '../components/game/AimLinkPanel';
import { ChargeMeter } from '../components/game/ChargeMeter';
import { PlayerStatusPanel } from '../components/game/PlayerStatusPanel';

if (!PLAYABLE_WEAPON_PRESETS.length) {
  throw new Error('PLAYABLE_WEAPON_PRESETS must not be empty');
}

export type GameMode = 'standard' | 'practice' | 'local2p';

interface GameScreenProps {
  onGameOver: (result: MatchResult) => void;
  gameMode?: GameMode;
  mapId: MapId;
  /** Session loadout when `gameMode === 'local2p'`. */
  local2pLoadout?: Local2pLoadout | null;
  /** Return to main menu from match (standard or practice). */
  onExitMatch: () => void;
}

export function GameScreen({
  onGameOver,
  gameMode = 'standard',
  mapId,
  local2pLoadout = null,
  onExitMatch
}: GameScreenProps) {
  const activeMap = useMemo(() => getMapById(mapId), [mapId]);
  const mapWindBias = useMemo(() => getMapWindBias(mapId), [mapId]);
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
  const selectedWeapon = useMemo(
    (): Weapon => getWeaponById(selectedWeaponId),
    [selectedWeaponId]
  );

  useEffect(() => {
    if (local2p) return;
    setSelectedWeaponId(progress.equippedWeaponId);
  }, [progress.equippedWeaponId, local2p]);

  const p1LoadoutWeapon = useMemo((): Weapon | null => {
    if (!local2pLoadout) return null;
    return getWeaponById(local2pLoadout.p1WeaponId);
  }, [local2pLoadout]);

  const p2LoadoutWeapon = useMemo((): Weapon | null => {
    if (!local2pLoadout) return null;
    return getWeaponById(local2pLoadout.p2WeaponId);
  }, [local2pLoadout]);

  const enemyWeaponReadyRef = useRef<Record<string, number>>({});
  const [enemyWeaponId, setEnemyWeaponId] = useState(() =>
    pickEnemyWeaponId(progress.settings.difficulty, 0, () => 0)
  );
  const enemyWeapon = useMemo(() => {
    if (local2p && p2LoadoutWeapon) return p2LoadoutWeapon;
    return getWeaponById(enemyWeaponId);
  }, [local2p, p2LoadoutWeapon, enemyWeaponId]);

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
    if (local2p) {
      setShowMatchTips(false);
      return;
    }
    setShowMatchTips(
      localStorage.getItem(STORAGE.matchOnboardingDismissed) !== '1'
    );
  }, [local2p]);

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
  const arenaSurfaceRef = useRef<HTMLDivElement>(null);
  const arenaCam = useAnimation();
  const [playerLaunchNonce, setPlayerLaunchNonce] = useState(0);
  const [enemyLaunchNonce, setEnemyLaunchNonce] = useState(0);
  const [aimPullVisualDeg, setAimPullVisualDeg] = useState(0);
  const [aimFingerPct, setAimFingerPct] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hitFlash, setHitFlash] = useState(false);
  const [aimSensitivity, setAimSensitivity] = useState(
    progress.settings.defaultAimSensitivity
  );
  const maxDragPixels = 320 / aimSensitivity;

  const aimPowerRef = useRef(aimPower);
  const aimAngleRef = useRef(aimAngle);
  aimPowerRef.current = aimPower;
  aimAngleRef.current = aimAngle;

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
  const settingsOpenRef = useRef(settingsOpen);
  settingsOpenRef.current = settingsOpen;
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
  const triggerFireRef = useRef<FirePayload | null>(null);
  triggerFireRef.current = triggerFire;
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
  const canAimRef = useRef(canAim);
  canAimRef.current = canAim;

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

  useEffect(() => {
    const bias = mapWindBias;
    const next = {
      speed: Math.min(20, 8 + Math.floor(Math.random() * 6) + bias),
      direction: (Math.random() > 0.5 ? 'right' : 'left') as 'left' | 'right'
    };
    windRef.current = next;
    setWind(next);
  }, [mapId, mapWindBias]);

  const isPlayerTurnRef = useRef(isPlayerTurn);
  isPlayerTurnRef.current = isPlayerTurn;

  useEffect(() => {
    if (reduceMotion) {
      void arenaCam.set({ scale: 1, x: 0, y: 0 });
      return;
    }
    if (triggerFire) {
      void arenaCam.start({
        scale: 1,
        x: [0, 7, -5, 2, 0],
        y: [0, 4, -3, 0],
        transition: { duration: 0.26, ease: 'easeOut' }
      });
      return;
    }
    if (!isAiming) {
      void arenaCam.start({
        scale: 1,
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 190, damping: 28, mass: 0.62 }
      });
      return;
    }
    const rad = (aimAngle * Math.PI) / 180;
    const charging = aimPower > 2;
    const pan = charging
      ? (isPlayerTurn ? 1 : -1) *
        Math.min(28, 12 + aimPower * 0.18) *
        Math.cos(rad)
      : 0;
    const panY = charging ? -Math.min(14, aimPower * 0.08) * Math.sin(rad) : 0;
    void arenaCam.start({
      scale: 1,
      x: pan,
      y: panY,
      transition: { type: 'spring', stiffness: 170, damping: 24, mass: 0.62 }
    });
  }, [
    triggerFire,
    isAiming,
    aimPower,
    aimAngle,
    isPlayerTurn,
    reduceMotion,
    arenaCam
  ]);

  useEffect(() => {
    setAimPower(0);
    setAimAngle(45);
    aimPowerRef.current = 0;
    aimAngleRef.current = 45;
    setIsAiming(false);
    setAimFingerPct(null);
    setAimPullVisualDeg(0);
  }, [isPlayerTurn]);

  const previewPoints = useMemo(() => {
    const showPreview = canAim && aimPower > 2;
    if (!showPreview) return [];
    const facing = isPlayerTurn;
    const startX = isPlayerTurn ? P1_POS.x : P2_POS.x;
    const startY =
      (isPlayerTurn ? P1_POS.y : P2_POS.y) + PROJECTILE_START_Y_OFFSET;
    return sampleTrajectoryPoints(
      {
        power: aimPower,
        angleDeg: aimAngle,
        shooterFacingRight: facing,
        velocityScale: activeWeapon.velocityScale,
        windSpeed: wind.speed,
        windDirection: wind.direction,
        startX,
        startY
      },
      96,
      2
    );
  }, [
    canAim,
    aimPower,
    aimAngle,
    isPlayerTurn,
    activeWeapon.velocityScale,
    wind.speed,
    wind.direction
  ]);

  const landingPoint = useMemo(() => {
    if (!canAim || aimPower <= 2) return null;
    const facing = isPlayerTurn;
    const startX = isPlayerTurn ? P1_POS.x : P2_POS.x;
    const startY =
      (isPlayerTurn ? P1_POS.y : P2_POS.y) + PROJECTILE_START_Y_OFFSET;
    return estimateGroundLandingPoint({
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
    canAim,
    aimPower,
    aimAngle,
    isPlayerTurn,
    activeWeapon.velocityScale,
    wind.speed,
    wind.direction
  ]);

  const aimFeedback = useMemo(
    () => ({
      playerPullDeg:
        isPlayerTurn && isAiming ? aimPullVisualDeg : 0,
      enemyPullDeg:
        !isPlayerTurn && isAiming ? aimPullVisualDeg : 0,
      chargingSide: (isAiming
        ? isPlayerTurn
          ? 'player'
          : 'enemy'
        : null) as 'player' | 'enemy' | null,
      chargePowerPct: aimPower,
      playerLaunchNonce,
      enemyLaunchNonce
    }),
    [
      isPlayerTurn,
      isAiming,
      aimPullVisualDeg,
      aimPower,
      playerLaunchNonce,
      enemyLaunchNonce
    ]
  );

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
    const now = Date.now();
    const tier = progress.settings.difficulty;
    const weaponId = pickEnemyWeaponId(tier, now, (id) =>
      enemyWeaponReadyRef.current[id] ?? 0
    );
    const weapon = getWeaponById(weaponId);
    const cd = getSkillBehavior(weaponId).cooldownMs;
    if (cd > 0) {
      enemyWeaponReadyRef.current[weaponId] = now + cd;
    }
    setEnemyWeaponId(weaponId);

    const sol = findBestAim({
      shooterFacingRight: false,
      velocityScale: weapon.velocityScale,
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
      timestamp: now,
      velocityScale: weapon.velocityScale,
      baseDamage: weapon.damage,
      projectileStyle: weapon.projectileStyle
    });
    updateMatchStats((prev) => ({ ...prev, enemyShots: prev.enemyShots + 1 }));
    playBlip(220, 0.06, audioMuted);
  }, [
    progress.settings.difficulty,
    enemyAimError,
    audioMuted,
    updateMatchStats
  ]);

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
        speed: Math.min(
          20,
          Math.floor(Math.random() * windSpan) + windMin + mapWindBias
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
    [scheduleEnemyShot, progress.settings.difficulty, local2p, mapWindBias]
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

      setHitFlash(true);
      window.setTimeout(() => setHitFlash(false), 140);

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

  const updateAimFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const el = arenaSurfaceRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pTurn = isPlayerTurnRef.current;
      const ax = pTurn ? P1_POS.x : P2_POS.x;
      const ay = (pTurn ? P1_POS.y : P2_POS.y) + PROJECTILE_START_Y_OFFSET;
      const anchorXc = rect.left + (ax / 100) * rect.width;
      const anchorYc = rect.top + (ay / 100) * rect.height;
      const fxPct = ((clientX - rect.left) / rect.width) * 100;
      const fyPct = ((clientY - rect.top) / rect.height) * 100;
      setAimFingerPct({ x: fxPct, y: fyPct });
      const dx = pTurn ? clientX - anchorXc : anchorXc - clientX;
      const dy = anchorYc - clientY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = Math.max(0, Math.min(90, angle));
      const distance = Math.hypot(clientX - anchorXc, clientY - anchorYc);
      const power = Math.min(100, (distance / maxDragPixels) * 100);
      aimAngleRef.current = angle;
      aimPowerRef.current = power;
      setAimAngle(angle);
      setAimPower(power);
      setAimPullVisualDeg(
        Math.atan2(clientY - anchorYc, clientX - anchorXc) * (180 / Math.PI)
      );
    },
    [maxDragPixels]
  );

  const handleAimPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      !canAimRef.current ||
      showMatchTipsRef.current ||
      triggerFireRef.current ||
      settingsOpenRef.current
    ) {
      return;
    }
    const el = arenaSurfaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pTurn = isPlayerTurnRef.current;
    const ax = pTurn ? P1_POS.x : P2_POS.x;
    const ay = (pTurn ? P1_POS.y : P2_POS.y) + PROJECTILE_START_Y_OFFSET;
    const anchorXc = rect.left + (ax / 100) * rect.width;
    const anchorYc = rect.top + (ay / 100) * rect.height;
    const r = Math.min(rect.width, rect.height) * 0.09;
    if (Math.hypot(e.clientX - anchorXc, e.clientY - anchorYc) > r) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setIsAiming(true);
    updateAimFromClient(e.clientX, e.clientY);
  };

  const handleAimPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAiming || !canAimRef.current) return;
    updateAimFromClient(e.clientX, e.clientY);
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
    const wasAiming = isAiming;
    setIsAiming(false);
    setAimFingerPct(null);
    if (!wasAiming || !canAimRef.current) return;
    if (aimPowerRef.current >= 5 && !showMatchTipsRef.current) {
      handleFireRef.current();
    }
  };

  const handleFire = useCallback(() => {
    if (
      !canAimRef.current ||
      aimPowerRef.current < 5 ||
      showMatchTipsRef.current
    ) {
      return;
    }
    const pwr = aimPowerRef.current;
    const ang = aimAngleRef.current;
    const pTurn = isPlayerTurnRef.current;

    if (local2p && p1LoadoutWeapon && p2LoadoutWeapon) {
      if (pTurn) {
        updateMatchStats((prev) => ({
          ...prev,
          playerShots: prev.playerShots + 1
        }));
        setTriggerFire({
          power: pwr,
          angle: ang,
          timestamp: Date.now(),
          velocityScale: p1LoadoutWeapon.velocityScale,
          baseDamage: p1LoadoutWeapon.damage,
          projectileStyle: p1LoadoutWeapon.projectileStyle
        });
        setPlayerLaunchNonce((n) => n + 1);
      } else {
        updateMatchStats((prev) => ({
          ...prev,
          enemyShots: prev.enemyShots + 1
        }));
        setTriggerFire({
          power: pwr,
          angle: ang,
          timestamp: Date.now(),
          velocityScale: p2LoadoutWeapon.velocityScale,
          baseDamage: p2LoadoutWeapon.damage,
          projectileStyle: p2LoadoutWeapon.projectileStyle
        });
        setEnemyLaunchNonce((n) => n + 1);
      }
    } else {
      updateMatchStats((prev) => ({
        ...prev,
        playerShots: prev.playerShots + 1
      }));
      setTriggerFire({
        power: pwr,
        angle: ang,
        timestamp: Date.now(),
        velocityScale: selectedWeapon.velocityScale,
        baseDamage: selectedWeapon.damage,
        projectileStyle: selectedWeapon.projectileStyle
      });
      setPlayerLaunchNonce((n) => n + 1);
    }

    playBlip(440, 0.08, audioMuted);

    aimPowerRef.current = 0;
    aimAngleRef.current = 45;
    setAimPower(0);
    setAimAngle(45);
    setAimPullVisualDeg(0);
    setIsAiming(false);
    setAimFingerPct(null);
  }, [
    local2p,
    p1LoadoutWeapon,
    p2LoadoutWeapon,
    selectedWeapon,
    audioMuted,
    updateMatchStats
  ]);

  const handleFireRef = useRef(handleFire);
  handleFireRef.current = handleFire;

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!canAimRef.current || settingsOpen || showMatchTipsRef.current)
        return;
      if (triggerFireRef.current) return;
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
  }, [settingsOpen, triggerFire]);

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
  const previewStroke = useMemo(
    () =>
      local2p
        ? isPlayerTurn
          ? progress.playerAccentHex
          : '#ff00e5'
        : progress.playerAccentHex,
    [local2p, isPlayerTurn, progress.playerAccentHex]
  );

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
        {/* AIM LINK instructions panel */}
        <AimLinkPanel
          isVisible={showMatchTips}
          onDismiss={dismissMatchTips}
        />

        {/* Player status panels */}
        <PlayerStatusPanel
          position="left"
          name={playerDisplayName}
          hp={playerHp}
          maxHp={100}
          rank={playerRankLabel}
          isCurrentTurn={isPlayerTurn}
          characterId={
            local2p && local2pLoadout
              ? local2pLoadout.p1CharacterId
              : progress.equippedCharacterId
          }
          accentColor={progress.playerAccentHex}
          reduceMotion={reduceMotion}
        />

        <PlayerStatusPanel
          position="right"
          name={enemyName}
          hp={enemyHp}
          maxHp={100}
          rank={enemyRankLabel}
          isCurrentTurn={!isPlayerTurn && !practice}
          characterId={
            local2p && local2pLoadout
              ? local2pLoadout.p2CharacterId
              : progress.equippedEnemyCharacterId
          }
          accentColor="#ff00e5"
          reduceMotion={reduceMotion}
        />

        {/* Charge meter */}
        {isPlayerTurn && (
          <ChargeMeter
            power={aimPower}
            angle={aimAngle}
            isCharging={isAiming}
            isPlayerTurn={isPlayerTurn}
            reduceMotion={reduceMotion}
          />
        )}

        <motion.div
          ref={arenaSurfaceRef}
          className="absolute inset-0"
          style={{ transformOrigin: '50% 58%' }}
          animate={arenaCam}>
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
          map={activeMap}
          aimFeedback={aimFeedback}
            hudOverlay={
              <>
                <svg
                  className="absolute inset-0 z-[22] h-full w-full pointer-events-none overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden>
                  <defs>
                    <filter
                      id="hbTrajGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%">
                      <feGaussianBlur stdDeviation="0.35" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {(() => {
                    const ax = isPlayerTurn ? P1_POS.x : P2_POS.x;
                    const ay =
                      (isPlayerTurn ? P1_POS.y : P2_POS.y) +
                      PROJECTILE_START_Y_OFFSET;
                    const rad = (aimAngle * Math.PI) / 180;
                    const mul = isPlayerTurn ? 1 : -1;
                    const arrLen = 12;
                    const arx = ax + mul * Math.cos(rad) * arrLen;
                    const ary = ay - Math.sin(rad) * arrLen;
                    return (
                      <>
                        {isAiming &&
                        aimFingerPct &&
                        aimPower > 1 &&
                        !reduceMotion ? (
                          <line
                            x1={ax}
                            y1={ay}
                            x2={aimFingerPct.x}
                            y2={aimFingerPct.y}
                            stroke="rgba(255,0,229,0.55)"
                            strokeWidth={0.35}
                            strokeDasharray="0.6 0.9"
                            strokeLinecap="round"
                          />
                        ) : null}
                        {previewPoints.length > 1 ? (
                          <>
                            <polyline
                              points={polylinePoints}
                              fill="none"
                              stroke="rgba(0,240,255,0.35)"
                              strokeWidth={1.1}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter="url(#hbTrajGlow)"
                            />
                            <polyline
                              points={polylinePoints}
                              fill="none"
                              stroke={previewStroke}
                              strokeOpacity={0.95}
                              strokeWidth={0.42}
                              strokeDasharray="0.9 1.35"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        ) : null}
                        {canAim && aimPower > 2 ? (
                          <line
                            x1={ax}
                            y1={ay}
                            x2={arx}
                            y2={ary}
                            stroke={previewStroke}
                            strokeWidth={0.45}
                            strokeLinecap="round"
                            opacity={0.85}
                          />
                        ) : null}
                        {landingPoint &&
                        previewPoints.length > 1 &&
                        !reduceMotion ? (
                          <g
                            transform={`translate(${landingPoint.x},${landingPoint.y})`}>
                            <circle
                              r={2.4}
                              fill="none"
                              stroke="rgba(0,240,255,0.9)"
                              strokeWidth={0.35}
                            />
                            <circle
                              r={1.1}
                              fill="rgba(0,240,255,0.35)"
                              stroke="none"
                            />
                            <line
                              x1={-3.2}
                              y1={0}
                              x2={3.2}
                              y2={0}
                              stroke="rgba(255,0,229,0.85)"
                              strokeWidth={0.28}
                            />
                            <line
                              x1={0}
                              y1={-3.2}
                              x2={0}
                              y2={3.2}
                              stroke="rgba(255,0,229,0.85)"
                              strokeWidth={0.28}
                            />
                            {!reduceMotion ? (
                              <motion.circle
                                r={4}
                                fill="none"
                                stroke="rgba(0,240,255,0.45)"
                                strokeWidth={0.2}
                                initial={{ scale: 0.6, opacity: 0.9 }}
                                animate={{ scale: 1.35, opacity: 0 }}
                                transition={{
                                  duration: 1.1,
                                  repeat: Infinity,
                                  ease: 'easeOut'
                                }}
                              />
                            ) : null}
                          </g>
                        ) : null}
                      </>
                    );
                  })()}
                </svg>
                <div
                  className="absolute inset-0 z-[28] touch-none"
                  style={{
                    pointerEvents:
                      canAim && !triggerFire && !settingsOpen
                        ? 'auto'
                        : 'none'
                  }}
                  onPointerDown={handleAimPointerDown}
                  onPointerMove={handleAimPointerMove}
                  onPointerUp={endAim}
                  onPointerCancel={endAim}
                />
              </>
            }
          />
        </motion.div>
      </GameSceneBoundary>

      {hitFlash ? (
        <div
          className="pointer-events-none absolute inset-0 z-[18] bg-gradient-to-b from-cyan-200/25 via-fuchsia-300/15 to-transparent mix-blend-screen"
          aria-hidden
        />
      ) : null}

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

      {showMatchTips && !local2p && (
        <div className="absolute inset-x-0 top-0 z-[25] flex justify-center px-3 pt-3 sm:pt-4 pointer-events-none">
          <motion.div
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="pointer-events-auto w-full max-w-md">
            <GlassCard
              variant="sticker"
              className="border border-neon-cyan/45 bg-dark-card/88 px-4 py-3 shadow-[0_0_26px_rgba(0,240,255,0.18)] backdrop-blur-md">
              <p className="font-display text-[11px] sm:text-xs leading-relaxed text-gray-100">
                <span className="font-black tracking-[0.18em] text-neon-cyan">
                  AIM LINK
                </span>{' '}
                Press your sticker, pull back to charge trajectory, release to
                fire. Keys: arrows / WASD, Space to shoot.
              </p>
              <div className="mt-2 flex justify-end">
                <NeonButton size="sm" variant="primary" onClick={dismissMatchTips}>
                  OK
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 gap-8">
        <div className="flex justify-between items-start gap-8">
          <GlassCard variant="sticker" className="p-4 md:p-5 flex items-center gap-4 w-[18rem] max-w-[42vw] pointer-events-auto border-neon-cyan/35 bg-dark-card/80 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-neon-cyan overflow-hidden bg-dark-darker p-1">
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
              <div className="absolute -bottom-2 -right-2 bg-dark-card text-[10px] font-bold border border-neon-cyan rounded px-1 text-neon-cyan">
                Lv.{playerRankLabel}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-display font-bold text-white mb-1">
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

          <div className="flex flex-col items-center gap-4">
            {local2p && onExitMatch && (
              <div className="flex flex-col sm:flex-row gap-2 items-center pointer-events-auto">
                <GlassCard
                  variant="sticker"
                  interactive
                  className="px-4 py-2 flex items-center gap-2 border-neon-lime/40 min-h-[44px]"
                  onClick={() => onExitMatch()}>
                  <LogOutIcon size={18} className="text-neon-lime" />
                  <span className="font-display text-xs font-black tracking-wide text-white">
                    EXIT MATCH
                  </span>
                </GlassCard>
              </div>
            )}
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
                  scale: 0.82,
                  opacity: 0,
                  y: -12
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  scale: 1.12,
                  opacity: 0,
                  y: 8
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className={`rounded-full border px-4 py-2 sm:px-6 sm:py-2.5 bg-dark-card/80 font-display font-black text-base sm:text-xl tracking-[0.24em] uppercase shadow-[0_0_24px_rgba(0,0,0,0.5)] ${
                  isPlayerTurn
                    ? 'border-neon-cyan/60 text-neon-cyan drop-shadow-[0_0_14px_rgba(0,240,255,0.45)]'
                    : 'border-neon-magenta/60 text-neon-magenta drop-shadow-[0_0_14px_rgba(255,0,229,0.45)]'
                }`}>
                {local2p
                  ? isPlayerTurn
                    ? 'PLAYER 1 TURN'
                    : 'PLAYER 2 TURN'
                  : isPlayerTurn
                    ? 'YOUR TURN'
                    : 'ENEMY TURN'}
              </motion.div>
            </AnimatePresence>

            <GlassCard
              variant="sticker"
              className="max-w-[11rem] px-3 py-1.5 pointer-events-none border-white/15 bg-dark-card/75"
              title={activeMap.name}>
              <p className="truncate font-display text-[10px] font-bold uppercase tracking-wider text-neon-cyan">
                {activeMap.name}
              </p>
              <p className="truncate font-display text-[9px] text-gray-500">
                {activeMap.biome}
              </p>
            </GlassCard>

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
              <div className="absolute -bottom-2 -left-2 bg-dark-card text-[10px] font-bold border border-neon-magenta rounded px-1 text-neon-magenta">
                Lv.{enemyRankLabel}
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm font-display font-bold text-white mb-1">
                {enemyName}
              </div>
              {!local2p ? (
                <p className="mb-1 font-display text-[10px] text-gray-400">
                  {enemyWeapon.icon} {enemyWeapon.name}
                </p>
              ) : null}
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

        <div className="flex justify-between items-end gap-4 sm:gap-8">
          <div className="w-10 shrink-0 pointer-events-none sm:w-12" aria-hidden />

          <div className="relative flex min-h-[3.5rem] flex-1 flex-col items-center justify-end">
            <AnimatePresence>
              {canAim ? (
                <motion.div
                  key="aim-dock"
                  initial={{ y: 36, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 28, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  className="pointer-events-auto flex w-full max-w-xl flex-col items-stretch gap-2 px-1 sm:px-2">
                  <p className="text-center font-sans text-xs tracking-wide text-slate-400">
                    Drag from your character · Release to fire
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {canAim ? (
              <motion.div
                key={isPlayerTurn ? 'pwr-p1' : 'pwr-p2'}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className={`pointer-events-none absolute bottom-full mb-2 w-[min(15rem,46vw)] rounded-xl border border-neon-cyan/35 bg-dark-card/80 px-3 py-2 shadow-[0_0_20px_rgba(0,240,255,0.12)] backdrop-blur-sm ${
                  isPlayerTurn ? 'left-0' : 'right-0 left-auto'
                }`}>
                <div className="mb-1 flex items-center justify-between font-display text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  <span>Charge</span>
                  <span
                    className={
                      aimPower > 88
                        ? 'font-black text-neon-magenta'
                        : 'text-neon-cyan'
                    }>
                    {Math.round(aimPower)}%
                  </span>
                </div>
                <div className="relative">
                  {aimPower > 88 && !reduceMotion ? (
                    <motion.div
                      className="pointer-events-none absolute -inset-1 rounded-lg bg-neon-magenta/25 blur-md"
                      animate={{
                        opacity: [0.35, 0.75, 0.35],
                        scale: [1, 1.04, 1]
                      }}
                      transition={{
                        duration: 0.55,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      aria-hidden
                    />
                  ) : null}
                  <ProgressBar
                    progress={aimPower}
                    color={
                      aimPower > 80 ? 'bg-neon-magenta' : 'bg-neon-cyan'
                    }
                    height="h-3"
                    variant="arcade"
                    reduceMotion={reduceMotion}
                  />
                </div>
              </motion.div>
            ) : null}
          </div>

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
