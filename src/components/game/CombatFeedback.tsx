import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal' | 'critical' | 'miss';
}

interface CombatFeedbackProps {
  impacts: Array<{
    x: number;
    y: number;
    damage: number;
    type: 'hit' | 'miss' | 'critical';
  }>;
  reduceMotion?: boolean;
}

/**
 * Displays floating damage numbers, hit/miss indicators, and critical hit effects.
 */
export function CombatFeedback({
  impacts,
  reduceMotion = false
}: CombatFeedbackProps) {
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

  useEffect(() => {
    impacts.forEach((impact) => {
      const id = `${impact.x}-${impact.y}-${Date.now()}-${Math.random()}`;
      const feedbackType = impact.type === 'miss' ? 'miss' : impact.type === 'critical' ? 'critical' : 'damage';
      const value = feedbackType === 'miss' ? 0 : impact.damage;

      const newNumber: FloatingNumber = {
        id,
        value,
        x: impact.x,
        y: impact.y,
        type: feedbackType
      };

      setNumbers((prev) => [...prev, newNumber]);

      // Remove after animation completes
      const timer = setTimeout(() => {
        setNumbers((prev) => prev.filter((n) => n.id !== id));
      }, reduceMotion ? 500 : 2000);

      return () => clearTimeout(timer);
    });
  }, [impacts, reduceMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[10] overflow-hidden">
      <AnimatePresence>
        {numbers.map((num) => (
          <FloatingNumber
            key={num.id}
            x={num.x}
            y={num.y}
            value={num.value}
            type={num.type}
            reduceMotion={reduceMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface FloatingNumberProps {
  x: number;
  y: number;
  value: number;
  type: 'damage' | 'heal' | 'critical' | 'miss';
  reduceMotion?: boolean;
}

function FloatingNumber({
  x,
  y,
  value,
  type,
  reduceMotion = false
}: FloatingNumberProps) {
  // Convert percent coords to pixel position
  const containerWidth = 800; // Battlefield width
  const containerHeight = 200; // Battlefield height
  const pixelX = (x / 100) * containerWidth;
  const pixelY = (y / 100) * containerHeight;

  const variants = {
    damage: {
      initial: { opacity: 1, y: pixelY, scale: 1 },
      animate: { 
        opacity: 0, 
        y: pixelY - 60, 
        scale: 1.2,
        filter: 'blur(0px)'
      },
      exit: { opacity: 0 },
      transition: {
        duration: reduceMotion ? 0.3 : 1.5,
        ease: 'easeOut'
      }
    },
    critical: {
      initial: { opacity: 1, y: pixelY, scale: 0.8, rotate: -15 },
      animate: { 
        opacity: 0, 
        y: pixelY - 80, 
        scale: 1.5,
        rotate: 15,
        filter: 'drop-shadow(0 0 10px rgba(255, 0, 229, 0.8))'
      },
      exit: { opacity: 0 },
      transition: {
        duration: reduceMotion ? 0.3 : 1.8,
        ease: 'easeOut'
      }
    },
    miss: {
      initial: { opacity: 1, y: pixelY, scale: 1 },
      animate: { 
        opacity: 0, 
        y: pixelY + 40, 
        scale: 0.8,
        x: pixelX + 30
      },
      exit: { opacity: 0 },
      transition: {
        duration: reduceMotion ? 0.3 : 1.2,
        ease: 'easeOut'
      }
    },
    heal: {
      initial: { opacity: 1, y: pixelY, scale: 1 },
      animate: { 
        opacity: 0, 
        y: pixelY - 60, 
        scale: 1.2
      },
      exit: { opacity: 0 },
      transition: {
        duration: reduceMotion ? 0.3 : 1.5,
        ease: 'easeOut'
      }
    }
  };

  const colorMap = {
    damage: 'text-red-400',
    critical: 'text-neon-magenta',
    miss: 'text-gray-400',
    heal: 'text-neon-lime'
  };

  const glowMap = {
    damage: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))',
    critical: 'drop-shadow(0 0 12px rgba(255, 0, 229, 0.8))',
    miss: 'drop-shadow(0 0 4px rgba(107, 114, 128, 0.4))',
    heal: 'drop-shadow(0 0 8px rgba(132, 255, 0, 0.6))'
  };

  const displayText =
    type === 'miss' ? 'MISS' : type === 'critical' ? `${value}!` : `${value}`;
  const isCritical = type === 'critical';

  return (
    <motion.div
      className="fixed pointer-events-none font-display font-black"
      style={{
        left: pixelX,
        top: pixelY,
        filter: glowMap[type]
      }}
      initial={variants[type].initial}
      animate={variants[type].animate}
      exit={variants[type].exit}
      transition={variants[type].transition}
    >
      <div
        className={`${colorMap[type]} text-2xl tracking-wider ${
          isCritical ? 'text-4xl scale-125 animate-pulse' : ''
        }`}
      >
        {displayText}
      </div>
      
      {/* Particle effect for critical hits */}
      {type === 'critical' && !reduceMotion && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-neon-magenta"
              style={{
                left: 0,
                top: 0
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 4) * Math.PI * 2) * 30,
                y: Math.sin((i / 4) * Math.PI * 2) * 30,
                opacity: 0
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut'
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
