import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MapDefinition, ProjectileStyle } from '../../types';
import { getMapFloorTheme } from '../../game/mapFloorTheme';
import type { CharacterId } from '../../game/charactersCatalog';
import { ProjectileGraphic } from './projectiles/ProjectileGraphic';
import { CharacterSticker } from './CharacterSticker';
import type { WindDirection } from '../../game/artilleryPhysics';
import {
  GROUND_Y,
  HIT_RADIUS,
  OFFSCREEN_X_MAX,
  OFFSCREEN_X_MIN,
  P1_POS,
  P2_POS,
  PROJECTILE_START_Y_OFFSET,
  computeHitDamage,
  computeHitDamageWithZone,
  initialVelocity,
  simulateStep,
  windAccelPerFrame
} from '../../game/artilleryPhysics';

export type ShotResult =
  | {
      outcome: 'hit';
      damage: number;
      impactX: number;
      impactY: number;
      /** Who fired this shot (snapshot when the volley started). */
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
}

interface BattlefieldProps {
  isPlayerTurn: boolean;
  windSpeed: number;
  windDirection: WindDirection;
  playerHp: number;
  enemyHp: number;
  triggerFire: FirePayload | null;
  onShotResult: (result: ShotResult) => void;
  reduceMotion?: boolean;
  playerAccentHex?: string;
  /** Concept-sheet sticker id per side (defaults handled in CharacterSticker). */
  playerCharacterId?: CharacterId | null;
  enemyCharacterId?: CharacterId | null;
  onReady?: () => void;
  /** Local 2P: scale damage by impact region vs defender anchor. */
  bodyPartDamage?: boolean;
  /** Bowmasters-style pull / charge feedback on stickers. */
  aimFeedback?: {
    playerPullDeg: number;
    enemyPullDeg: number;
    chargingSide: 'player' | 'enemy' | null;
    chargePowerPct: number;
    playerLaunchNonce: number;
    enemyLaunchNonce: number;
  };
  /** Injected under projectiles (trajectory, drag-to-aim hit layer). */
  hudOverlay?: React.ReactNode;
  /** Selected arena — background art and floor tint. */
  map?: MapDefinition;
}

export function Battlefield({
  isPlayerTurn,
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
  aimFeedback,
  hudOverlay,
  map
}: BattlefieldProps) {
  const floorTheme = getMapFloorTheme(map?.id ?? 'birch_night_glade');
  const [projectile, setProjectile] = useState<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
  } | null>(null);
  const shotVisualRef = useRef<{
    style: ProjectileStyle;
    shooterIsPlayer: boolean;
  }>({
    style: 'basic_arrow',
    shooterIsPlayer: true
  });
  const [hitEffect, setHitEffect] = useState<{
    x: number;
    y: number;
    active: boolean;
    damage: number;
  } | null>(null);
  const [cameraShake, setCameraShake] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const physicsState = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false
  });
  const windAccelRef = useRef(0);
  const shotPowerRef = useRef(0);
  const shotDamageBaseRef = useRef(0);

  const p1Pos = P1_POS;
  const p2Pos = P2_POS;
  const af = aimFeedback ?? {
    playerPullDeg: 0,
    enemyPullDeg: 0,
    chargingSide: null as 'player' | 'enemy' | null,
    chargePowerPct: 0,
    playerLaunchNonce: 0,
    enemyLaunchNonce: 0
  };
  const onResultRef = useRef(onShotResult);
  onResultRef.current = onShotResult;

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (!triggerFire?.timestamp) return;
    if (physicsState.current.active) return;

    let cancelled = false;
    const shotByPlayer = isPlayerTurn;
    const power = triggerFire.power;
    const angle = triggerFire.angle;
    const velocityScale = triggerFire.velocityScale;
    const baseDamage = triggerFire.baseDamage;

    shotVisualRef.current = {
      style: triggerFire.projectileStyle,
      shooterIsPlayer: isPlayerTurn
    };

    const startX = isPlayerTurn ? p1Pos.x : p2Pos.x;
    const startY =
      (isPlayerTurn ? p1Pos.y : p2Pos.y) + PROJECTILE_START_Y_OFFSET;
    const facingRight = isPlayerTurn;
    windAccelRef.current = windAccelPerFrame(windSpeed, windDirection);
    shotPowerRef.current = power;
    shotDamageBaseRef.current = baseDamage;
    const v0 = initialVelocity(power, angle, facingRight, velocityScale);
    physicsState.current = {
      x: startX,
      y: startY,
      vx: v0.vx,
      vy: v0.vy,
      active: true
    };
    setProjectile({
      x: startX,
      y: startY,
      vx: v0.vx,
      vy: v0.vy,
      active: true
    });

    const targetX = isPlayerTurn ? p2Pos.x : p1Pos.x;
    const targetY = isPlayerTurn ? p2Pos.y : p1Pos.y;

    const animateProjectile = () => {
      if (cancelled || !physicsState.current.active) return;
      const prev = physicsState.current;
      const next = simulateStep(
        {
          x: prev.x,
          y: prev.y,
          vx: prev.vx,
          vy: prev.vy
        },
        windAccelRef.current
      );
      physicsState.current = { ...next, active: true };
      const { x, y } = next;
      setProjectile({
        x,
        y,
        vx: next.vx,
        vy: next.vy,
        active: true
      });

      if (y > GROUND_Y || x < OFFSCREEN_X_MIN || x > OFFSCREEN_X_MAX) {
        physicsState.current.active = false;
        setProjectile(null);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setTimeout(() => {
          if (!cancelled) {
            onResultRef.current({
              outcome: 'miss',
              shooterWasPlayer: shotByPlayer
            });
          }
        }, 500);
        return;
      }

      const hitDistance = Math.hypot(x - targetX, y - targetY);
      if (hitDistance < HIT_RADIUS) {
        physicsState.current.active = false;
        setProjectile(null);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        const damage = bodyPartDamage
          ? computeHitDamageWithZone(
              shotDamageBaseRef.current,
              shotPowerRef.current,
              x,
              y,
              targetX,
              targetY
            )
          : computeHitDamage(
              shotDamageBaseRef.current,
              shotPowerRef.current
            );
        setHitEffect({
          x: targetX,
          y: targetY,
          active: true,
          damage
        });
        setCameraShake(true);
        setTimeout(() => setCameraShake(false), 500);
        setTimeout(() => setHitEffect(null), 1500);
        setTimeout(() => {
          if (!cancelled) {
            onResultRef.current({
              outcome: 'hit',
              damage,
              impactX: x,
              impactY: y,
              shooterWasPlayer: shotByPlayer
            });
          }
        }, 1000);
        return;
      }

      requestRef.current = requestAnimationFrame(animateProjectile);
    };

    requestRef.current = requestAnimationFrame(animateProjectile);

    return () => {
      cancelled = true;
      physicsState.current.active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot when `triggerFire` updates
  }, [triggerFire, isPlayerTurn, bodyPartDamage]);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const viz = projectile && projectile.active ? shotVisualRef.current : null;
  const rotDeg =
    projectile && projectile.active
      ? Math.atan2(projectile.vy, projectile.vx) * (180 / Math.PI)
      : 0;

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#1a0a2e] via-[#2d1b4e] to-[#0f0620]"
      animate={
        cameraShake
          ? {
              x: [-10, 10, -10, 10, 0],
              y: [-5, 5, -5, 5, 0]
            }
          : {}
      }
      transition={{ duration: 0.4 }}>
      {map ? (
        <>
          <motion.div
            key={map.id}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${map.backgroundSrc})` }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            aria-hidden
          />
          <motion.div
            key={`${map.id}-tint`}
            className="pointer-events-none absolute inset-0"
            style={{ background: map.overlayTint }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            aria-hidden
          />
        </>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,6,32,0.42)_55%,rgba(5,2,14,0.88)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#130a28]/95 via-[#1a0d37]/75 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[22%] h-px"
        style={{ backgroundColor: floorTheme.groundLine }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[18%] h-[10%] opacity-30"
        style={{ background: floorTheme.groundBand }}
        aria-hidden
      />

      <motion.div
        className="absolute top-20 right-40 w-32 h-32 rounded-full blur-xl"
        style={{ backgroundColor: floorTheme.ambientGlow }}
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
        className="absolute top-24 left-28 w-24 h-24 rounded-full blur-xl"
        style={{ backgroundColor: floorTheme.ambientGlow }}
        animate={
          reduceMotion
            ? { scale: 1, opacity: 0.45 }
            : { scale: [1, 1.06, 1], opacity: [0.28, 0.5, 0.28] }
        }
        transition={
          reduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity }
        }
      />

      {hudOverlay}

      <Platform
        x={p1Pos.x}
        y={p1Pos.y + 10}
        color="cyan"
        fill={floorTheme.platformFill}
        reduceMotion={reduceMotion}
      />
      <Platform
        x={p2Pos.x}
        y={p2Pos.y + 10}
        color="magenta"
        fill={floorTheme.platformFill}
        reduceMotion={reduceMotion}
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
        aimPullDeg={af.playerPullDeg}
        isCharging={af.chargingSide === 'player'}
        chargePowerPct={
          af.chargingSide === 'player' ? af.chargePowerPct : 0
        }
        launchPulseNonce={af.playerLaunchNonce}
        isActiveTurn={isPlayerTurn}
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
        aimPullDeg={af.enemyPullDeg}
        isCharging={af.chargingSide === 'enemy'}
        chargePowerPct={
          af.chargingSide === 'enemy' ? af.chargePowerPct : 0
        }
        launchPulseNonce={af.enemyLaunchNonce}
        isActiveTurn={!isPlayerTurn}
      />

      {viz && projectile?.active && (
        <motion.div
          className="absolute z-40 w-0 h-0"
          style={{
            left: `${projectile.x}%`,
            top: `${projectile.y}%`,
            transform: `translate(-50%, -50%) rotate(${rotDeg}deg)`,
            filter: reduceMotion
              ? undefined
              : 'drop-shadow(0 0 10px rgba(0,240,255,0.85)) drop-shadow(0 0 22px rgba(255,0,229,0.35))'
          }}>
          {!reduceMotion ? (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan/25 blur-md scale-x-150"
              aria-hidden
            />
          ) : null}
          <ProjectileGraphic
            style={viz.style}
            shooterIsPlayer={viz.shooterIsPlayer}
            accentHex={playerAccentHex}
          />
        </motion.div>
      )}

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
            {!reduceMotion ? (
              <>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-neon-cyan"
                    style={{
                      left: `${-6 + (i % 3) * 6}px`,
                      top: `${4 + Math.floor(i / 3) * 5}px`
                    }}
                    initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 0,
                      x: (i % 2 === 0 ? 1 : -1) * (18 + i * 6),
                      y: -22 - i * 4
                    }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                ))}
              </>
            ) : null}

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
    </motion.div>
  );
}

function Platform({
  x,
  y,
  color,
  fill,
  reduceMotion
}: {
  x: number;
  y: number;
  color: 'cyan' | 'magenta';
  fill: string;
  reduceMotion: boolean;
}) {
  const shadowColor =
    color === 'cyan' ? 'shadow-neon-cyan' : 'shadow-neon-magenta';
  const borderColor =
    color === 'cyan' ? 'border-neon-cyan' : 'border-neon-magenta';
  return (
    <motion.div
      className={`absolute w-32 h-8 rounded-t-2xl border-t-[5px] ${borderColor} ${shadowColor}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translateX(-50%)',
        boxShadow: '0 6px 0 rgba(0,0,0,0.35)',
        backgroundColor: fill
      }}
      animate={reduceMotion ? { y: 0 } : { y: [-2, 2, -2] }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      }
    />
  );
}
