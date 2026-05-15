import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RadarIcon } from 'lucide-react';
import { StickerAvatar } from '../components/game/StickerAvatar';
import { NeonButton } from '../components/ui/NeonButton';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ScreenFrame } from '../components/ui/ScreenFrame';
import { useHitBowProgress } from '../context/HitBowProgressContext';
import type { MapId } from '../types';
import { getMapById } from '../game/maps';
import { MAP_ARENA_THUMB_SUMMARY } from '../components/game/mapThumbStyles';

interface MatchmakingScreenProps {
  mapId: MapId;
  onMatchFound: (mapId: MapId) => void;
  onCancel: () => void;
}

export function MatchmakingScreen({
  mapId,
  onMatchFound,
  onCancel
}: MatchmakingScreenProps) {
  const progress = useHitBowProgress();
  const reduceMotion = progress.settings.reduceMotion;
  const arena = getMapById(mapId);
  const [status, setStatus] = useState<
    'searching' | 'found' | 'cancelled' | 'error'
  >('searching');
  const [attempt, setAttempt] = useState(1);
  const enemyName = 'SKULL RAIDER';
  const enemyRank = 14;

  useEffect(() => {
    let done = false;
    let matchFoundTimer: number | null = null;
    const shouldFail = attempt % 4 === 0;
    setStatus('searching');
    const revealTimer = window.setTimeout(() => {
      if (done) return;
      setStatus(shouldFail ? 'error' : 'found');
      if (!shouldFail) {
        matchFoundTimer = window.setTimeout(() => {
          if (!done) onMatchFound(mapId);
        }, 1500);
      }
    }, 2200);
    return () => {
      done = true;
      window.clearTimeout(revealTimer);
      if (matchFoundTimer) {
        window.clearTimeout(matchFoundTimer);
      }
    };
  }, [onMatchFound, attempt, mapId]);
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
        opacity: 0,
        scale: 1.2
      }}
      transition={{
        duration: 0.5
      }}>

      <ScreenFrame
        reduceMotion={reduceMotion}
        contentClassName="items-center justify-center">
        {status === 'searching' ?
        <motion.div
          className="flex flex-col items-center z-10"
          initial={{
            scale: 0.8,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          exit={{
            scale: 0.8,
            opacity: 0
          }}>

          <div className="relative mb-8">
            <motion.div
            className="absolute inset-0 border-2 border-neon-cyan rounded-full"
            animate={
              reduceMotion
                ? { scale: 1, opacity: 0.55 }
                : { scale: [1, 2.5], opacity: [1, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
            } />
          
            <motion.div
            className="absolute inset-0 border-2 border-neon-cyan rounded-full"
            animate={
              reduceMotion
                ? { scale: 1, opacity: 0.35 }
                : { scale: [1, 2.5], opacity: [1, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 1.5,
                    delay: 0.75,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }
            } />
          
            <div className="w-24 h-24 bg-dark-card rounded-full border-2 border-neon-cyan flex items-center justify-center shadow-neon-cyan relative z-10">
              <RadarIcon
              size={40}
              className={
                reduceMotion ? 'text-neon-cyan' : 'text-neon-cyan animate-spin-slow'
              } />
            
            </div>
          </div>
          <h2
            className={`text-2xl font-display font-bold text-neon-cyan tracking-widest ${reduceMotion ? '' : 'animate-pulse'}`}>
            PAIRING WITH AI…
          </h2>
          <p className="text-gray-400 mt-2 font-display text-sm">
            Offline — simulated wait, no live lobby.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-neon-cyan/30 bg-dark-card/80 px-3 py-2">
            <div
              className={MAP_ARENA_THUMB_SUMMARY}
              style={{ backgroundImage: `url(${arena.previewSrc})` }}
              aria-hidden
            />
            <div>
              <p className="font-display text-[10px] uppercase tracking-wider text-gray-500">
                Arena
              </p>
              <p className="font-display text-sm font-bold text-neon-cyan">
                {arena.name}
              </p>
            </div>
          </div>
          <SectionHeading
            colorClassName="text-gray-500"
            className="mt-1">
            You vs a local bot, not real PvP
          </SectionHeading>
          <NeonButton
            variant="danger"
            size="sm"
            className="mt-6"
            onClick={() => {
              setStatus('cancelled');
              onCancel();
            }}>
            Cancel
          </NeonButton>
        </motion.div> :
      status === 'error' ? (
      <motion.div
        className="flex flex-col items-center z-10 text-center px-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}>
        <h2 className="text-2xl font-display font-black text-neon-magenta tracking-wide">
          OFFLINE HICCUP
        </h2>
        <p className="text-gray-300 mt-2 font-display">
          Could not finish the fake queue step. Retry or head back — still no
          real matchmaking server.
        </p>
        <div className="mt-6 flex gap-3">
          <NeonButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setAttempt((n) => n + 1);
              setStatus('searching');
            }}>
            Retry
          </NeonButton>
          <NeonButton variant="danger" size="sm" onClick={onCancel}>
            Back
          </NeonButton>
        </div>
      </motion.div>
      ) :

      <div className="w-full h-full flex items-center justify-center relative z-10">
          {/* VS Background Split */}
          <motion.div
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-neon-cyan/10 to-transparent"
          initial={{
            x: '-100%'
          }}
          animate={{
            x: 0
          }}
          transition={{
            type: 'spring',
            damping: 20
          }} />
        
          <motion.div
          className="absolute inset-0 left-1/2 w-1/2 bg-gradient-to-l from-neon-magenta/10 to-transparent"
          initial={{
            x: '100%'
          }}
          animate={{
            x: 0
          }}
          transition={{
            type: 'spring',
            damping: 20
          }} />
        

          <div className="flex items-center justify-between w-full max-w-5xl px-8 relative z-20">
            {/* Player 1 */}
            <motion.div
            className="flex flex-col items-center"
            initial={{
              x: -200,
              opacity: 0
            }}
            animate={{
              x: 0,
              opacity: 1
            }}
            transition={{
              type: 'spring',
              bounce: 0.4,
              duration: 0.8
            }}>
            
              <div className="w-40 h-40 rounded-2xl bg-dark-card border-4 border-neon-cyan shadow-neon-cyan overflow-hidden mb-4 p-2 flex items-center justify-center">
                <StickerAvatar
                  characterId={progress.equippedCharacterId}
                  side="player"
                  accentHex={progress.playerAccentHex}
                  className="h-full w-full"
                />
              </div>
              <h3 className="text-3xl font-display font-bold text-white text-glow-cyan">
                {progress.playerName}
              </h3>
              <p className="text-xs text-gray-400 font-display mt-1 uppercase tracking-wider">
                You · saved locally
              </p>
              <p className="text-neon-cyan font-bold mt-1">
                Rank {progress.playerRank}
              </p>
            </motion.div>

            {/* VS Text */}
            <motion.div
            initial={{
              scale: 0,
              rotate: -180
            }}
            animate={{
              scale: 1,
              rotate: 0
            }}
            transition={{
              type: 'spring',
              bounce: 0.6,
              duration: 0.8,
              delay: 0.3
            }}
            className="text-7xl font-display font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] z-30">
            
              VS
            </motion.div>

            {/* Player 2 */}
            <motion.div
            className="flex flex-col items-center"
            initial={{
              x: 200,
              opacity: 0
            }}
            animate={{
              x: 0,
              opacity: 1
            }}
            transition={{
              type: 'spring',
              bounce: 0.4,
              duration: 0.8,
              delay: 0.1
            }}>
            
              <div className="w-40 h-40 rounded-2xl bg-dark-card border-4 border-neon-magenta shadow-neon-magenta overflow-hidden mb-4 p-2 flex items-center justify-center">
                <StickerAvatar
                  characterId={progress.equippedEnemyCharacterId}
                  side="enemy"
                  accentHex="#ff00e5"
                  className="h-full w-full"
                />
              </div>
              <h3 className="text-3xl font-display font-bold text-white text-glow-magenta">
                {enemyName}
              </h3>
              <p className="text-xs text-gray-400 font-display mt-1 uppercase tracking-wider">
                AI rival · offline
              </p>
              <p className="text-neon-magenta font-bold mt-1">
                Rank {enemyRank}
              </p>
            </motion.div>
          </div>
        </div>
      }
    </ScreenFrame>
    </motion.div>);

}