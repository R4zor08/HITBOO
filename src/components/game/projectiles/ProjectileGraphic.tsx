import type { ProjectileStyle } from '../../../types';

const STROKE = '#140820';

type Props = {
  style: ProjectileStyle;
  shooterIsPlayer: boolean;
  accentHex: string;
};

const ENEMY_TINT = '#ff3355';

export function ProjectileGraphic({
  style,
  shooterIsPlayer,
  accentHex
}: Props) {
  const blend = shooterIsPlayer ? accentHex : ENEMY_TINT;
  switch (style) {
    case 'dual_spear':
      return (
        <svg
          width="52"
          height="14"
          viewBox="0 0 52 14"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <polygon points="48,7 52,7 50,11" fill="#cbd5e1" stroke={STROKE} strokeWidth="0.75" />
          <polygon points="4,7 8,7 6,11" fill="#cbd5e1" stroke={STROKE} strokeWidth="0.75" />
          <rect x="8" y="5" width="36" height="4" rx="1" fill="#dc2626" stroke={STROKE} strokeWidth="0.75" />
          <rect x="22" y="4" width="8" height="6" rx="1" fill="#fde047" stroke={STROKE} strokeWidth="0.75" />
          <polygon points="10,13 16,11 13,14" fill={blend} opacity={0.7} />
        </svg>
      );
    case 'energy_sword':
      return (
        <svg
          width="42"
          height="12"
          viewBox="0 0 42 12"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_0_10px_#67e8f9]">
          <rect x="0" y="4" width="10" height="4" rx="1" fill="#64748b" stroke={STROKE} strokeWidth="0.75" />
          <rect x="8" y="3" width="30" height="6" rx="2" fill="#22d3ee" stroke="#0e7490" strokeWidth="1" />
          <rect x="11" y="4.25" width="24" height="3.5" rx="1" fill="#e0f2fe" opacity="0.95" />
        </svg>
      );
    case 'warhammer':
      return (
        <svg
          width="38"
          height="26"
          viewBox="0 0 38 26"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="14" y="8" width="8" height="16" rx="2" fill="#92400e" stroke={STROKE} strokeWidth="1.2" />
          <path d="M4 10 H34 V20 H4 Z" fill="#78716c" stroke={STROKE} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M16 22 H20 V26 H14 Z" fill="#94a3b8" stroke={STROKE} strokeWidth="0.75" />
          <path
            d="M10 13 Q18 13 26 13"
            fill="none"
            stroke="#facc15"
            strokeWidth="2"
          />
        </svg>
      );
    case 'football':
      return (
        <svg
          width="28"
          height="18"
          viewBox="0 0 28 18"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <ellipse cx="14" cy="9" rx="12" ry="7.5" fill="#92400e" stroke={STROKE} strokeWidth="1.2" />
          <path d="M8 9 H20 M14 6 V12" stroke="#fef3c7" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M5 9 Q14 14 23 9" fill="none" stroke="#eab308" strokeWidth="0.85" opacity="0.7" />
        </svg>
      );
    case 'sharpened_log':
      return (
        <svg
          width="44"
          height="14"
          viewBox="0 0 44 14"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <polygon points="40,7 44,9 38,11" fill="#d97706" stroke={STROKE} strokeWidth="0.85" />
          <rect x="4" y="5" width="36" height="4" rx="1" fill="#92400e" stroke={STROKE} strokeWidth="0.85" />
          <circle cx="12" cy="7" r="2" fill="#78350f" opacity="0.6" />
        </svg>
      );
    case 'shovel':
      return (
        <svg
          width="42"
          height="28"
          viewBox="0 0 42 28"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="17" y="8" width="6" height="18" rx="1" fill="#78350f" stroke={STROKE} strokeWidth="1" />
          <path d="M10 28 H24 V26 H26 V24 H22 V26 H14 Z" fill="#cbd5e1" stroke={STROKE} strokeWidth="1" />
          <path d="M6 10 H30 V22 H20 V16 H14 V22 H6 Z" fill="#64748b" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      );
    case 'basic_arrow':
      return (
        <svg
          width="40"
          height="14"
          viewBox="0 0 40 14"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <polygon points="36,7 40,7 38,11" fill="#fde047" stroke={STROKE} strokeWidth="0.85" />
          <rect x="6" y="5" width="30" height="4" rx="1" fill="#fefce8" stroke={STROKE} strokeWidth="0.85" />
          <path d="M6 9 L2 11 L6 11 L10 11 Z" fill="#fb923c" stroke={STROKE} strokeWidth="0.85" />
        </svg>
      );
    case 'baguette':
      return (
        <svg
          width="40"
          height="14"
          viewBox="0 0 40 14"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="3" y="4" width="34" height="6" rx="2" fill="#fcd34d" stroke={STROKE} strokeWidth="0.95" />
          <path d="M8 4 L11 10 M14 4 L17 10 M21 5 L23 11 M26 6 L29 11" stroke="#b45309" strokeWidth="1.1" opacity="0.75" strokeLinecap="round" />
        </svg>
      );
    case 'marshmallow_stick':
      return (
        <svg
          width="42"
          height="16"
          viewBox="0 0 42 16"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <path d="M4 13 L38 13 L37 14 L14 14 L13 13 Z" fill="#92400e" stroke={STROKE} strokeWidth="0.9" strokeLinejoin="round" />
          <rect x="30" y="4" width="10" height="8" rx="2" fill="#fafafa" stroke={STROKE} strokeWidth="0.95" />
        </svg>
      );
    case 'spooky_shovel':
      return (
        <svg
          width="42"
          height="26"
          viewBox="0 0 42 26"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_0_8px_#9333ea]">
          <rect x="17" y="10" width="6" height="14" rx="1" fill="#581c87" stroke={STROKE} strokeWidth="0.95" />
          <path d="M6 24 H34 V26 H26 V24 Z" fill="#581c87" stroke={STROKE} strokeWidth="0.9" />
          <path
            d="M6 8 H34 V22 H26 V14 H22 V22 H14 V14 H12 V22 H6 Z"
            fill="#4c1d95"
            stroke={STROKE}
            strokeWidth="1.05"
          />
          <ellipse cx="20" cy="14" rx="5" ry="4" fill="#f97316" opacity="0.55" />
        </svg>
      );
    case 'kunai':
      return (
        <svg width="28" height="12" viewBox="0 0 28 12" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <circle cx="6" cy="6" r="3" fill="#cbd5e1" stroke={STROKE} strokeWidth="0.85" />
          <rect x="6" y="4.25" width="8" height="3.5" rx="1" fill="#dc2626" stroke={STROKE} strokeWidth="0.75" />
          <polygon points="14,6 26,8 26,4" fill="#e5e7eb" stroke={STROKE} strokeWidth="0.85" />
        </svg>
      );
    case 'molotov':
      return (
        <svg width="20" height="28" viewBox="0 0 20 28" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="10" y="2" width="3" height="6" rx="1" fill="#fef3c7" stroke={STROKE} strokeWidth="0.75" />
          <path d="M4 26 Q10 29 16 26 L15 14 Q10 11 5 14 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1.1" />
          <rect x="6" y="16" width="8" height="5" rx="1" fill="#713f12" opacity="0.55" stroke={STROKE} strokeWidth="0.65" />
        </svg>
      );
    case 'energy_ring':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_0_12px_#38bdf8]">
          <ellipse cx="11" cy="11" rx="9.5" ry="9.5" fill="none" stroke="#0ea5e9" strokeWidth="3.5" />
          <ellipse cx="11" cy="11" rx="5.5" ry="5.5" fill="#e0f2fe" opacity="0.45" />
        </svg>
      );
    case 'short_sword':
      return (
        <svg width="36" height="12" viewBox="0 0 36 12" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="20" y="4" width="14" height="4" rx="1" fill="#e5e7eb" stroke={STROKE} strokeWidth="0.85" />
          <rect x="16" y="3" width="5" height="6" rx="1" fill="#facc15" stroke={STROKE} strokeWidth="0.75" />
          <rect x="10" y="4" width="8" height="4" rx="1" fill="#dc2626" stroke={STROKE} strokeWidth="0.75" />
          <circle cx="9" cy="6" r="3" fill="#facc15" stroke={STROKE} strokeWidth="0.75" />
        </svg>
      );
    case 'baseball_bat':
      return (
        <svg width="44" height="12" viewBox="0 0 44 12" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <path
            d="M4 8 Q12 3 40 6"
            fill="none"
            stroke="#78350f"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M18 5 L24 8 L30 5" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'fancy_arrow':
      return (
        <svg
          width="48"
          height="18"
          viewBox="0 0 48 18"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <path
            d="M38 9 L46 9 L44 13 L41 13 L43 17 L39 17 L37 13 L37 11 Z"
            fill="#fde047"
            stroke={STROKE}
            strokeWidth="0.9"
          />
          <rect x="8" y="7" width="30" height="4" rx="1" fill="#d946ef" stroke={STROKE} strokeWidth="0.9" />
          <path d="M8 11 L4 14 L10 13 Z" fill="#22d3ee" stroke={STROKE} strokeWidth="0.85" />
          <polygon points="10,13 13,13 11,14" fill={blend} opacity="0.9" />
        </svg>
      );
    case 'katana':
      return (
        <svg width="40" height="12" viewBox="0 0 40 12" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="14" y="4" width="24" height="4" rx="1" fill="#e5e7eb" stroke={STROKE} strokeWidth="0.85" />
          <ellipse cx="12" cy="6" rx="3.5" ry="3.5" fill="#facc15" stroke={STROKE} strokeWidth="0.85" />
          <rect x="6" y="4.5" width="8" height="3" rx="1" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="0.6" />
          <circle cx="5" cy="6" r="2" fill="#fcd34d" stroke={STROKE} strokeWidth="0.65" />
        </svg>
      );
    case 'fire_axe':
      return (
        <svg width="32" height="28" viewBox="0 0 32 28" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="13" y="10" width="6" height="16" rx="1" fill="#78350f" stroke={STROKE} strokeWidth="1" />
          <path d="M4 12 H24 V22 H14 V17 H4 Z" fill="#dc2626" stroke={STROKE} strokeWidth="1.1" />
          <path d="M4 22 H14 V18 Z" fill="#e5e7eb" opacity="0.55" stroke={STROKE} strokeWidth="0.75" />
        </svg>
      );
    case 'magic_spear':
      return (
        <svg width="48" height="14" viewBox="0 0 48 14" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_0_8px_#34d399]">
          <polygon points="44,7 48,10 43,13" fill="#fde047" stroke={STROKE} strokeWidth="0.85" />
          <rect x="4" y="5" width="40" height="4" rx="1" fill="#5eead4" stroke="#0f766e" strokeWidth="0.95" />
          <path d="M16 7 H28 M22 7 V14" stroke="#fbbf24" strokeWidth="2" opacity="0.75" strokeLinecap="round" />
        </svg>
      );
    case 'tri_blade':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <circle cx="14" cy="14" r="6" fill="#dc2626" stroke={STROKE} strokeWidth="1" />
          <path d="M14 14 L14 6 L22 17 Z" fill="#f8fafc" stroke={STROKE} strokeWidth="0.95" strokeLinejoin="round" />
          <path d="M14 14 L6 21 L21 21 Z" fill="#f8fafc" stroke={STROKE} strokeWidth="0.95" strokeLinejoin="round" />
          <circle cx="14" cy="14" r="2.5" fill="#ef4444" />
        </svg>
      );
    case 'firework':
      return (
        <svg width="30" height="14" viewBox="0 0 30 14" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <polygon points="28,8 26,13 21,13 24,8" fill="#f97316" stroke={STROKE} strokeWidth="0.85" />
          <rect x="4" y="5" width="20" height="6" rx="2" fill="#ea580c" stroke={STROKE} strokeWidth="0.9" />
          <ellipse cx="4" cy="8" rx="3" ry="4" fill="#fcd34d" stroke={STROKE} strokeWidth="0.75" />
        </svg>
      );
    case 'machete':
      return (
        <svg width="36" height="14" viewBox="0 0 36 14" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="26" y="5" width="8" height="4" rx="1" fill="#18181b" stroke={STROKE} strokeWidth="0.75" />
          <path
            d="M4 11 Q10 7 26 11 V7 Q16 6 10 11 Z"
            fill="#cbd5e1"
            stroke={STROKE}
            strokeWidth="0.9"
          />
          <circle cx="10" cy="8" r="1.2" fill="#334155" />
          <circle cx="13" cy="8" r="1.2" fill="#334155" />
          <circle cx="16" cy="8" r="1.2" fill="#334155" />
          <circle cx="19" cy="8" r="1.2" fill="#334155" />
        </svg>
      );
    case 'chainsaw':
      return (
        <svg width="44" height="18" viewBox="0 0 44 18" className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_2px_0_#0008]">
          <rect x="6" y="6" width="14" height="8" rx="2" fill="#dc2626" stroke={STROKE} strokeWidth="1" />
          <rect x="18" y="7" width="22" height="6" rx="1" fill="#94a3b8" stroke={STROKE} strokeWidth="0.9" />
          <path d="M20 8 H38 M20 10 H38 M20 12 H38" stroke="#475569" strokeWidth="0.65" />
          <rect x="0" y="7" width="8" height="6" rx="1" fill="#18181b" stroke={STROKE} strokeWidth="0.75" />
        </svg>
      );
    case 'launcher_bolt':
      return (
        <svg
          width="52"
          height="20"
          viewBox="0 0 52 20"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_0_12px_#22d3ee]">
          <rect x="4" y="5" width="44" height="10" rx="4" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
          <ellipse cx="8" cy="10" rx="6" ry="8" fill="#16a34a" opacity="0.6" />
          <rect x="0" y="7" width="8" height="6" rx="2" fill="#64748b" stroke={STROKE} strokeWidth="1" />
        </svg>
      );
    default:
      return null;
  }
}
