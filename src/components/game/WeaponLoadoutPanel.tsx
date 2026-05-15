import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Weapon } from '../../types';
import { getWeaponById } from '../../game/weapons';

interface WeaponLoadoutPanelProps {
  selectedWeaponId: string;
  onWeaponSelect: (weaponId: string) => void;
  availableWeapons: string[];
  isPlayerTurn: boolean;
  reduceMotion?: boolean;
}

export function WeaponLoadoutPanel({
  selectedWeaponId,
  onWeaponSelect,
  availableWeapons,
  isPlayerTurn,
  reduceMotion
}: WeaponLoadoutPanelProps) {
  const weapons = useMemo(
    () => availableWeapons.map(id => getWeaponById(id)),
    [availableWeapons]
  );

  if (!isPlayerTurn) return null;

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 z-30 -translate-x-1/2 w-fit max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="rounded-3xl border-3 border-white/40 bg-black/50 backdrop-blur-sm px-6 py-4 shadow-[0_0_25px_rgba(139,92,246,0.3)]">
        <div className="mb-3 text-center">
          <span className="font-display font-black text-xs uppercase text-white/60 tracking-widest">
            Loadout
          </span>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {weapons.map((weapon) => (
            <motion.button
              key={weapon.id}
              onClick={() => onWeaponSelect(weapon.id)}
              className={`relative px-4 py-2.5 rounded-2xl border-2 font-display font-bold text-sm uppercase tracking-wide transition-all duration-200 ${
                selectedWeaponId === weapon.id
                  ? 'border-neon-magenta bg-neon-magenta/20 text-neon-magenta shadow-[0_0_20px_rgba(255,0,229,0.5)]'
                  : 'border-white/30 bg-white/5 text-white/70 hover:border-white/50 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                selectedWeaponId === weapon.id && !reduceMotion
                  ? { boxShadow: [
                      '0 0 20px rgba(255, 0, 229, 0.5)',
                      '0 0 30px rgba(255, 0, 229, 0.8)',
                      '0 0 20px rgba(255, 0, 229, 0.5)'
                    ]}
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{weapon.icon}</span>
                <span>{weapon.name}</span>
              </div>
              
              {/* Damage indicator */}
              <div className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-neon-lime bg-black/80 text-[10px] font-bold text-neon-lime">
                {weapon.damage}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-3 text-center text-[10px] font-display text-gray-400">
          Click to select weapon • Selected: <span className="text-neon-cyan">{getWeaponById(selectedWeaponId).name}</span>
        </div>
      </div>
    </motion.div>
  );
}
