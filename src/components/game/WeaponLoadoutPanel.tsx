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
      className="fixed bottom-8 left-1/2 z-30 -translate-x-1/2 w-fit max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="card-professional rounded-xl px-6 py-4 space-y-3">
        <div className="text-center pb-2 border-b border-slate-700/50">
          <span className="font-sans font-semibold text-xs uppercase text-slate-400 tracking-wider">
            Select Weapon
          </span>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {weapons.map((weapon) => {
            const isSelected = selectedWeaponId === weapon.id;
            return (
              <motion.button
                key={weapon.id}
                onClick={() => onWeaponSelect(weapon.id)}
                className={`relative px-3 py-2 rounded-lg border font-sans font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                  isSelected
                    ? 'border-slate-500 bg-slate-800/80 text-slate-100 shadow-md-professional'
                    : 'border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-300'
                }`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{weapon.icon}</span>
                  <span>{weapon.name}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="text-center text-xs font-sans text-slate-500 pt-2 border-t border-slate-700/50">
          Selected: <span className="text-slate-300 font-semibold">{getWeaponById(selectedWeaponId).name}</span>
        </div>
      </div>
    </motion.div>
  );
}
