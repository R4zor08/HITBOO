import React from 'react';
import { motion } from 'framer-motion';

interface AimLinkPanelProps {
  onDismiss: () => void;
  isVisible: boolean;
}

export function AimLinkPanel({ onDismiss, isVisible }: AimLinkPanelProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className="card-professional rounded-xl px-8 py-6 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-sans font-bold text-2xl text-slate-200 text-center mb-4 tracking-tight">
          How to Play
        </h3>
        
        <div className="space-y-4 text-sm text-slate-400 mb-6">
          <div className="flex gap-3">
            <span className="text-indigo-400 font-semibold flex-shrink-0">1.</span>
            <p>Click on your character and drag back to charge your shot</p>
          </div>
          <div className="flex gap-3">
            <span className="text-indigo-400 font-semibold flex-shrink-0">2.</span>
            <p>Adjust angle and power using arrow keys or WASD</p>
          </div>
          <div className="flex gap-3">
            <span className="text-indigo-400 font-semibold flex-shrink-0">3.</span>
            <p>Release the mouse or press Space to fire at your opponent</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <button
            onClick={onDismiss}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-md-professional"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
