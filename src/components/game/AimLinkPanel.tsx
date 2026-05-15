import React from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from '../ui/NeonButton';

interface AimLinkPanelProps {
  onDismiss: () => void;
  isVisible: boolean;
}

export function AimLinkPanel({ onDismiss, isVisible }: AimLinkPanelProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="pointer-events-auto fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
    >
      <div className="w-fit rounded-3xl border-4 border-neon-cyan bg-dark-card/95 px-8 py-6 backdrop-blur-sm shadow-[0_0_30px_rgba(0,240,255,0.5)]">
        <h3 className="font-display font-black text-xl text-neon-cyan text-center mb-4 tracking-wider">
          AIM LINK
        </h3>
        
        <div className="space-y-3 text-sm font-display text-gray-300 text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-neon-cyan">→</span>
            <span>Press your sticker, pull back to charge trajectory,</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-neon-cyan">→</span>
            <span>release to fire</span>
          </div>
          <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
            <div><span className="text-neon-magenta font-bold">Keys:</span> Arrows / WASD, Space to shoot</div>
          </div>
        </div>

        <div className="flex justify-center">
          <NeonButton
            variant="primary"
            size="md"
            onClick={onDismiss}
            className="px-6"
          >
            OK
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
}
