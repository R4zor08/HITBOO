import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CrosshairIcon } from 'lucide-react';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ParticleBackground } from '../components/ui/ParticleBackground';
import { useHitBowProgress } from '../context/HitBowProgressContext';

interface LoadingScreenProps {
  onComplete: () => void;
}
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { settings } = useHitBowProgress();
  const reduceMotion = settings.reduceMotion;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const duration = 2500; // 2.5s loading simulation
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min(currentStep / steps * 100, 100));
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 400); // Small delay before transition
      }
    }, interval);
    return () => clearInterval(timer);
  }, [onComplete]);
  return (
    <motion.div
      className="relative w-full h-screen flex flex-col items-center justify-center bg-dark-darker overflow-hidden"
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: 'blur(10px)'
      }}
      transition={{
        duration: 0.8
      }}>
      <ParticleBackground reduceMotion={reduceMotion} />

      <div className="z-10 flex flex-col items-center max-w-md w-full px-8">
        <motion.div
          animate={
            reduceMotion
              ? { rotate: 0, scale: 1 }
              : {
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  rotate: {
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear'
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }
          }
          className="mb-8 text-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
          
          <CrosshairIcon size={80} strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          className="text-5xl font-display font-black tracking-widest mb-12 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-magenta"
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.2
          }}>
          
          HITBOW
        </motion.h1>

        <motion.div
          className="w-full space-y-2"
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.4
          }}>
          
          <div className="flex justify-between text-xs font-display text-gray-400 uppercase tracking-wider">
            <span>Loading Assets...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar progress={progress} color="bg-neon-cyan" height="h-2" />
        </motion.div>
      </div>
    </motion.div>);

}