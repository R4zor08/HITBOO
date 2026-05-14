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
  | { outcome: 'miss'; shooterWasPlayer: boolean };

export interface FirePayload {
  power: number;
  angle: number;
  timestamp: number;
  velocityScale: number;
  baseDamage: number;
  projectileStyle: ProjectileStyle;
  /** Who fired; required for real-time multi-shot. */
  shooterWasPlayer: boolean;
}

type SimShot = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  windAccel: number;
  shooterWasPlayer: boolean;
  projectileStyle: ProjectileStyle;
  shotPower: number;
  shotDamageBase: number;
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
  /** Wrap playfield (not map backdrop) for camera motion from parent. */
  wrapDynamic?: (playfield: ReactNode) => ReactNode;
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
  wrapDynamic
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

  useEffect(() => {
    onReady?.();
  }, [onReady]);

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
  };

  const runStep = () => {
    if (cancelledUnmountRef.current) return;
    const gY = arenaRef.current.groundY;
    const pendingMiss: Array<{ id: string; shooterWasPlayer: boolean }> = [];
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
        s.windAccel
      );
      s.x = next.x;
      s.y = next.y;
      s.vx = next.vx;
      s.vy = next.vy;
      const { x, y } = next;

      if (y > gY || x < OFFSCREEN_X_MIN || x > OFFSCREEN_X_MAX) {
        pendingMiss.push({ id, shooterWasPlayer: s.shooterWasPlayer });
        continue;
      }

      const shotByPlayer = s.shooterWasPlayer;
      const def = shotByPlayer ? arenaRef.current.p2 : arenaRef.current.p1;
      const stance = shotByPlayer ? arenaRef.current.s2 : arenaRef.current.s1;
      const hitDistance = Math.hypot(x - def.x, y - def.y);
      if (hitDistance < hitRadiusForStance(stance)) {
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
      setTimeout(() => {
        if (!cancelledUnmountRef.current) {
          onResultRef.current({
            outcome: 'miss',
            shooterWasPlayer: m.shooterWasPlayer
          });
        }
      }, 500);
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
      rafRef.current = requestAnimationFrame(runStep);
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
    const windAccel = windAccelPerFrame(windSpeed, windDirection);
    const v0 = initialVelocity(power, angle, facingRight, velocityScale);
    const id = `${triggerFire.timestamp}-${++shotSeqRef.current}`;

    shotsRef.current.set(id, {
      id,
      x: startX,
      y: startY,
      vx: v0.vx,
      vy: v0.vy,
      windAccel,
      shooterWasPlayer: shotByPlayer,
      projectileStyle: triggerFire.projectileStyle,
      shotPower: power,
      shotDamageBase: baseDamage
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
        className="pointer-events-none absolute inset-x-0 bottom-[22%] h-px bg-white/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[18%] h-[10%] opacity-30 [background:repeating-linear-gradient(-45deg,rgba(255,255,255,0.08)_0_12px,rgba(255,255,255,0.03)_12px_24px)]"
        aria-hidden
      />
    </>
  );

  const playfield = (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      animate={
        cameraShake
          ? {
              x: [-10, 10, -10, 10, 0],
              y: [-5, 5, -5, 5, 0]
            }
          : {}
      }
      transition={{ duration: 0.4 }}>
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
              <ProjectileGraphic
                style={p.style}
                shooterIsPlayer={p.shooterIsPlayer}
                accentHex={playerAccentHex}
              />
            </motion.div>
          </div>
        );
      })}

      <AnimatePresence>
        {hitEffect && hitEffect.active && (
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${hitEffect.x}%`,
              top: `${hitEffect.y}%`
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}>
            <div className="absolute -inset-10 border-4 border-white rounded-full" />
            <div className="absolute -inset-20 bg-neon-yellow/40 rounded-full blur-xl" />

            <motion.div
              className="absolute -top-20 -left-10 text-4xl font-display font-black text-neon-yellow drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]"
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -50, opacity: 0, scale: 1.5 }}
              transition={{ duration: 1, ease: 'easeOut' }}>
              -{hitEffect.damage}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {hitFlash && !reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[95] bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.22, 0] }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
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
