import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectileStyle } from '../../types';
import type { CharacterId } from '../../game/charactersCatalog';
import { ProjectileGraphic } from './projectiles/ProjectileGraphic';
import { CharacterSticker } from './CharacterSticker';
import type { WindDirection } from '../../game/artilleryPhysics';
import {
  GROUND_Y,
  OFFSCREEN_X_MAX,
  OFFSCREEN_X_MIN,
  P1_POS,
  P2_POS,
  PROJECTILE_START_Y_OFFSET,
  computeHitDamage,
  computeHitDamageWithZone,
  hitRadiusForStance,
  initialVelocity,
  simulateStep,
  windAccelPerFrame
} from '../../game/artilleryPhysics';
import type { MapId, PlayerStance } from '../../types';
import { getMapById } from '../../game/maps';

export type ShotResult =
  | {
      outcome: 'hit';
      damage: number;
      impactX: number;
      impactY: number;
      shooterWasPlayer: boolean;
    }
  | {
      outcome: 'miss';
      shooterWasPlayer: boolean;
      /** Projectile reached target during damage immunity — no damage, softer feedback. */
      blockedByInvuln?: boolean;
      impactX?: number;
      impactY?: number;
      missKind?: 'ground' | 'offscreen';
      /** Passed closest-approach band without scoring a hit. */
      nearMiss?: boolean;
    };

export interface FirePayload {
  power: number;
  angle: number;
  timestamp: number;
  velocityScale: number;
  baseDamage: number;
  projectileStyle: ProjectileStyle;
  /** Who fired; required for real-time multi-shot. */
  shooterWasPlayer: boolean;
  /** Multiplies arena wind acceleration for this shot (mode × per-weapon). */
  windEffectMultiplier?: number;
  /** Multiplies gravity for this shot (per-weapon arc identity). */
  gravityScale?: number;
}

type SimShot = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  windAccel: number;
  gravityScale: number;
  shooterWasPlayer: boolean;
  projectileStyle: ProjectileStyle;
  shotPower: number;
  shotDamageBase: number;
  /** Minimum distance to defender hurtbox this flight (for near-miss). */
  closestDefenderDist: number;
};

export type ProjectileVisual = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  style: ProjectileStyle;
  shooterIsPlayer: boolean;
};

interface BattlefieldProps {
  windSpeed: number;
  windDirection: WindDirection;
  playerHp: number;
  enemyHp: number;
  triggerFire: FirePayload | null;
  onShotResult: (result: ShotResult) => void;
  reduceMotion?: boolean;
  playerAccentHex?: string;
  playerCharacterId?: CharacterId | null;
  enemyCharacterId?: CharacterId | null;
  onReady?: () => void;
  bodyPartDamage?: boolean;
  playerStickerAim?: { isCharging: boolean; aimPullDeg: number } | null;
  enemyStickerAim?: { isCharging: boolean; aimPullDeg: number } | null;
  mapId: MapId;
  playerPos: { x: number; y: number };
  enemyPos: { x: number; y: number };
  playerStance: PlayerStance;
  enemyStance: PlayerStance;
  /** Miss / ground collision plane (percent Y). */
  groundY?: number;
  /** Brief red tint on P1 sticker after damage. */
  playerHitTint?: boolean;
  /** Brief red tint on P2 sticker after damage. */
  enemyHitTint?: boolean;
  /** `performance.now()` until which P1 cannot be damaged by hits (exclusive of UI tint). */
  playerDamageImmuneUntil?: number;
  /** `performance.now()` until which P2 / enemy cannot be damaged. */
  enemyDamageImmuneUntil?: number;
  /** Wrap playfield (not map backdrop) for camera motion from parent. */
  wrapDynamic?: (playfield: ReactNode) => ReactNode;
  /** When true, projectiles stop advancing until resumed. */
  simPaused?: boolean;
  /** Live count of simulated shots (for HUD danger hint). */
  onProjectileCount?: (n: number) => void;
  /** Throttled near-miss (non-damage) for HUD / SFX. */
  onNearMiss?: (payload: {
    shooterWasPlayer: boolean;
    margin: number;
  }) => void;
}

export function Battlefield({
  windSpeed,
  windDirection,
  playerHp,
  enemyHp,
  triggerFire,
  onShotResult,
  reduceMotion = false,
  playerAccentHex = '#00f0ff',
  playerCharacterId = null,
  enemyCharacterId = null,
  onReady,
  bodyPartDamage = false,
  playerStickerAim = null,
  enemyStickerAim = null,
  mapId,
  playerPos,
  enemyPos,
  playerStance,
  enemyStance,
  groundY: groundYProp,
  playerHitTint = false,
  enemyHitTint = false,
  playerDamageImmuneUntil = 0,
  enemyDamageImmuneUntil = 0,
  wrapDynamic,
  simPaused = false,
  onProjectileCount,
  onNearMiss
}: BattlefieldProps) {
  const effectiveGroundY = groundYProp ?? GROUND_Y;
  const [projectiles, setProjectiles] = useState<ProjectileVisual[]>([]);
  const [hitEffect, setHitEffect] = useState<{
    x: number;
    y: number;
    active: boolean;
    damage: number;
  } | null>(null);
  const [cameraShake, setCameraShake] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const shotsRef = useRef<Map<string, SimShot>>(new Map());
  const shotSeqRef = useRef(0);
  const loopRunningRef = useRef(false);
  const cancelledUnmountRef = useRef(false);

  const p1Pos = playerPos ?? P1_POS;
  const p2Pos = enemyPos ?? P2_POS;
  const map = getMapById(mapId);
  const onResultRef = useRef(onShotResult);
  onResultRef.current = onShotResult;

  const arenaRef = useRef({
    p1: p1Pos,
    p2: p2Pos,
    s1: playerStance,
    s2: enemyStance,
    groundY: effectiveGroundY
  });
  arenaRef.current = {
    p1: p1Pos,
    p2: p2Pos,
    s1: playerStance,
    s2: enemyStance,
    groundY: effectiveGroundY
  };

  const bodyPartDamageRef = useRef(bodyPartDamage);
  bodyPartDamageRef.current = bodyPartDamage;
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;
  const playerImmuneUntilRef = useRef(0);
  const enemyImmuneUntilRef = useRef(0);
  playerImmuneUntilRef.current = playerDamageImmuneUntil;
  enemyImmuneUntilRef.current = enemyDamageImmuneUntil;

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (simPaused) return;
    if (shotsRef.current.size === 0) return;
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;
    rafRef.current = requestAnimationFrame(runStep);
  }, [simPaused]);

  const [groundDust, setGroundDust] = useState<
    Array<{ id: string; x: number; y: number }>
  >([]);
  const onProjectileCountRef = useRef(onProjectileCount);
  onProjectileCountRef.current = onProjectileCount;
  const simPausedRef = useRef(simPaused);
  simPausedRef.current = simPaused;

  const onNearMissRef = useRef(onNearMiss);
  onNearMissRef.current = onNearMiss;

  const pushVisuals = () => {
    const list: ProjectileVisual[] = [];
    for (const s of shotsRef.current.values()) {
      list.push({
        id: s.id,
        x: s.x,
        y: s.y,
        vx: s.vx,
        vy: s.vy,
        style: s.projectileStyle,
        shooterIsPlayer: s.shooterWasPlayer
      });
    }
    setProjectiles(list);
    onProjectileCountRef.current?.(list.length);
  };

  const runStep = () => {
    if (cancelledUnmountRef.current) return;
    if (simPausedRef.current) {
      loopRunningRef.current = false;
      return;
    }
    const gY = arenaRef.current.groundY;
    const NEAR_MISS_PAD = 3.8;
    const pendingMiss: Array<{
      id: string;
      shooterWasPlayer: boolean;
      blockedByInvuln?: boolean;
      impactX?: number;
      impactY?: number;
      missKind?: 'ground' | 'offscreen';
      closestDefenderDist?: number;
      defenderHitRadius?: number;
    }> = [];
    const pendingHit: Array<{
      id: string;
      shooterWasPlayer: boolean;
      damage: number;
      impactX: number;
      impactY: number;
      fxX: number;
      fxY: number;
    }> = [];

    for (const [id, s] of shotsRef.current) {
      const next = simulateStep(
        { x: s.x, y: s.y, vx: s.vx, vy: s.vy },
        s.windAccel,
        s.gravityScale
      );
      s.x = next.x;
      s.y = next.y;
      s.vx = next.vx;
      s.vy = next.vy;
      const { x, y } = next;

      const shotByPlayer = s.shooterWasPlayer;
      const def = shotByPlayer ? arenaRef.current.p2 : arenaRef.current.p1;
      const stance = shotByPlayer ? arenaRef.current.s2 : arenaRef.current.s1;
      const hitR = hitRadiusForStance(stance);
      const distDef = Math.hypot(x - def.x, y - def.y);
      s.closestDefenderDist = Math.min(s.closestDefenderDist, distDef);

      if (y > gY || x < OFFSCREEN_X_MIN || x > OFFSCREEN_X_MAX) {
        const kind: 'ground' | 'offscreen' = y > gY ? 'ground' : 'offscreen';
        const ix =
          kind === 'ground'
            ? x
            : Math.max(OFFSCREEN_X_MIN, Math.min(OFFSCREEN_X_MAX, x));
        const iy = kind === 'ground' ? gY : y;
        pendingMiss.push({
          id,
          shooterWasPlayer: s.shooterWasPlayer,
          impactX: ix,
          impactY: iy,
          missKind: kind,
          closestDefenderDist: s.closestDefenderDist,
          defenderHitRadius: hitR
        });
        continue;
      }

      if (distDef < hitR) {
        const now = typeof performance !== 'undefined' ? performance.now() : 0;
        const targetImmuneUntil = shotByPlayer
          ? enemyImmuneUntilRef.current
          : playerImmuneUntilRef.current;
        if (now < targetImmuneUntil) {
          pendingMiss.push({
            id,
            shooterWasPlayer: shotByPlayer,
            blockedByInvuln: true,
            closestDefenderDist: s.closestDefenderDist,
            defenderHitRadius: hitR
          });
          continue;
        }
        const damage = bodyPartDamageRef.current
          ? computeHitDamageWithZone(
              s.shotDamageBase,
              s.shotPower,
              x,
              y,
              def.x,
              def.y
            )
          : computeHitDamage(s.shotDamageBase, s.shotPower);
        pendingHit.push({
          id,
          shooterWasPlayer: shotByPlayer,
          damage,
          impactX: x,
          impactY: y,
          fxX: def.x,
          fxY: def.y
        });
      }
    }

    for (const m of pendingMiss) {
      shotsRef.current.delete(m.id);
      const delayMs = m.blockedByInvuln ? 120 : 500;
      if (!m.blockedByInvuln && m.impactX != null && m.impactY != null && !reduceMotionRef.current) {
        const dustId = `dust-${m.id}-${Date.now()}`;
        setGroundDust((prev) =>
          [...prev, { id: dustId, x: m.impactX!, y: m.impactY! }].slice(-8)
        );
        window.setTimeout(() => {
          setGroundDust((prev) => prev.filter((d) => d.id !== dustId));
        }, 520);
      }
      setTimeout(() => {
        if (!cancelledUnmountRef.current) {
          const r = m.defenderHitRadius ?? hitRadiusForStance('standing');
          const closest = m.closestDefenderDist ?? 1e9;
          const nearMiss =
            !m.blockedByInvuln &&
            closest < r + NEAR_MISS_PAD &&
            closest > r - 0.02;
          onResultRef.current({
            outcome: 'miss',
            shooterWasPlayer: m.shooterWasPlayer,
            blockedByInvuln: m.blockedByInvuln,
            impactX: m.impactX,
            impactY: m.impactY,
            missKind: m.missKind,
            nearMiss
          });
          if (nearMiss) {
            onNearMissRef.current?.({
              shooterWasPlayer: m.shooterWasPlayer,
              margin: closest - r
            });
          }
        }
      }, delayMs);
    }

    for (const h of pendingHit) {
      shotsRef.current.delete(h.id);
      setHitEffect({
        x: h.fxX,
        y: h.fxY,
        active: true,
        damage: h.damage
      });
      setCameraShake(true);
      if (!reduceMotionRef.current) {
        setHitFlash(true);
        setTimeout(() => setHitFlash(false), 140);
      } else {
        setHitFlash(true);
        setTimeout(() => setHitFlash(false), 80);
      }
      setTimeout(() => setCameraShake(false), 500);
      setTimeout(() => setHitEffect(null), 1500);
      setTimeout(() => {
        if (!cancelledUnmountRef.current) {
          onResultRef.current({
            outcome: 'hit',
            damage: h.damage,
            impactX: h.impactX,
            impactY: h.impactY,
            shooterWasPlayer: h.shooterWasPlayer
          });
        }
      }, 1000);
    }

    pushVisuals();

    if (shotsRef.current.size > 0) {
      if (!simPausedRef.current) {
        rafRef.current = requestAnimationFrame(runStep);
      } else {
        loopRunningRef.current = false;
      }
    } else {
      loopRunningRef.current = false;
    }
  };

  const ensureLoop = () => {
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;
    rafRef.current = requestAnimationFrame(runStep);
  };

  useEffect(() => {
    if (!triggerFire?.timestamp) return;
    const shotByPlayer = triggerFire.shooterWasPlayer;
    const power = triggerFire.power;
    const angle = triggerFire.angle;
    const velocityScale = triggerFire.velocityScale;
    const baseDamage = triggerFire.baseDamage;

    const startX = shotByPlayer ? p1Pos.x : p2Pos.x;
    const startY =
      (shotByPlayer ? p1Pos.y : p2Pos.y) + PROJECTILE_START_Y_OFFSET;
    const facingRight = shotByPlayer;
    const windMult = triggerFire.windEffectMultiplier ?? 1;
    const windAccel = windAccelPerFrame(windSpeed * windMult, windDirection);
    const v0 = initialVelocity(power, angle, facingRight, velocityScale);
    const id = `${triggerFire.timestamp}-${++shotSeqRef.current}`;
    const grav = triggerFire.gravityScale ?? 1;

    shotsRef.current.set(id, {
      id,
      x: startX,
      y: startY,
      vx: v0.vx,
      vy: v0.vy,
      windAccel,
      gravityScale: grav,
      shooterWasPlayer: shotByPlayer,
      projectileStyle: triggerFire.projectileStyle,
      shotPower: power,
      shotDamageBase: baseDamage,
      closestDefenderDist: Number.POSITIVE_INFINITY
    });
    pushVisuals();
    ensureLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enqueue when a new volley is queued
  }, [triggerFire]);

  useEffect(() => {
    cancelledUnmountRef.current = false;
    return () => {
      cancelledUnmountRef.current = true;
      shotsRef.current.clear();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      loopRunningRef.current = false;
    };
  }, []);

  const staticBackdrop = (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${map.backgroundSrc})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{ background: map.overlayTint ?? 'transparent' }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.12] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,6,32,0.55)_55%,rgba(5,2,14,0.92)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#130a28]/95 via-[#1a0d37]/75 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 z-[2]"
        style={{
          top: `${Math.max(0, effectiveGroundY - 4.5)}%`,
          height: `${Math.min(14, Math.max(3, 100 - effectiveGroundY + 1))}%`,
          background:
            'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05))'
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 z-[3] h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.15)]"
        style={{ top: `${effectiveGroundY}%`, transform: 'translateY(-1px)' }}
        aria-hidden
      />
    </>
  );

  const playfield = (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      animate={
        cameraShake
          ? reduceMotion
            ? { x: [-3, 3, 0], y: [-2, 2, 0] }
            : { x: [-10, 10, -10, 10, 0], y: [-5, 5, -5, 5, 0] }
          : {}
      }
      transition={{ duration: reduceMotion ? 0.22 : 0.4 }}>
      <motion.div
        className="absolute top-20 right-40 w-32 h-32 rounded-full bg-neon-purple/25 blur-xl"
        animate={
          reduceMotion
            ? { scale: 1, opacity: 0.5 }
            : { scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }
        }
        transition={
          reduceMotion ? { duration: 0 } : { duration: 5, repeat: Infinity }
        }
      />
      <motion.div
        className="absolute top-24 left-28 w-24 h-24 rounded-full bg-neon-cyan/20 blur-xl"
        animate={
          reduceMotion
            ? { scale: 1, opacity: 0.45 }
            : { scale: [1, 1.06, 1], opacity: [0.28, 0.5, 0.28] }
        }
        transition={
          reduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity }
        }
      />

      <CharacterSticker
        side="player"
        characterId={playerCharacterId}
        x={p1Pos.x}
        y={p1Pos.y}
        accentHex={playerAccentHex}
        hp={playerHp}
        facingRight={true}
        reduceMotion={reduceMotion}
        aimPullDeg={playerStickerAim?.aimPullDeg}
        isCharging={playerStickerAim?.isCharging}
        stance={playerStance}
        hitTintActive={playerHitTint}
      />

      <CharacterSticker
        side="enemy"
        characterId={enemyCharacterId}
        x={p2Pos.x}
        y={p2Pos.y}
        accentHex="#ff3355"
        hp={enemyHp}
        facingRight={false}
        reduceMotion={reduceMotion}
        aimPullDeg={enemyStickerAim?.aimPullDeg}
        isCharging={enemyStickerAim?.isCharging}
        stance={enemyStance}
        hitTintActive={enemyHitTint}
      />

      {projectiles.map((p) => {
        const rotDeg = Math.atan2(p.vy, p.vx) * (180 / Math.PI);
        return (
          <div key={p.id}>
            <div
              className="pointer-events-none absolute z-[36]"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '9999px',
                background: p.shooterIsPlayer
                  ? 'radial-gradient(circle, rgba(0,240,255,0.45), transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,51,85,0.42), transparent 70%)',
                filter: 'blur(10px)',
                opacity: 0.85
              }}
              aria-hidden
            />
            {!reduceMotion ? (
              <div
                className="pointer-events-none absolute z-[35]"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `translate(-50%, -50%) rotate(${rotDeg}deg) scaleX(1.2)`,
                  width: '2.25rem',
                  height: '0.55rem',
                  borderRadius: '9999px',
                  background: p.shooterIsPlayer
                    ? 'linear-gradient(90deg, transparent, rgba(0,240,255,0.35), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255,51,85,0.32), transparent)',
                  filter: 'blur(6px)',
                  opacity: 0.55
                }}
                aria-hidden
              />
            ) : null}
            <motion.div
              className="absolute z-40 w-0 h-0"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) rotate(${rotDeg}deg)`
              }}>
              <div
                className={
                  p.shooterIsPlayer
                    ? 'rounded-full ring-2 ring-neon-cyan/55 ring-offset-2 ring-offset-transparent'
                    : 'rounded-md ring-2 ring-dashed ring-neon-magenta/60 ring-offset-2 ring-offset-transparent'
                }
                style={{ padding: 2 }}>
                <ProjectileGraphic
                  style={p.style}
                  shooterIsPlayer={p.shooterIsPlayer}
                  accentHex={playerAccentHex}
                />
              </div>
            </motion.div>
          </div>
        );
      })}

      <AnimatePresence>
        {groundDust.map((d) => (
          <motion.div
            key={d.id}
            className="pointer-events-none absolute z-[38]"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0.4, opacity: 0.85 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}>
            <div className="h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-400/50 blur-md" />
            <div className="absolute inset-0 h-6 w-6 rounded-full bg-amber-900/35 blur-sm" />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {hitEffect && hitEffect.active && (
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${hitEffect.x}%`,
              top: `${hitEffect.y}%`
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.35, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}>
            <div className="absolute -inset-10 border-4 border-white rounded-full" />
            <div className="absolute -inset-14 border-2 border-neon-yellow/90 rounded-full" />
            <div className="absolute -inset-24 bg-neon-yellow/45 rounded-full blur-xl" />
            <div className="absolute -inset-32 bg-white/25 rounded-full blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {hitFlash ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[95] bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: reduceMotion ? [0, 0.08, 0] : [0, 0.22, 0] }}
          transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: 'easeOut' }}
        />
      ) : null}
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#0f0620' }}>
      <div className="absolute inset-0">{staticBackdrop}</div>
      {wrapDynamic ? wrapDynamic(playfield) : playfield}
    </div>
  );
}
