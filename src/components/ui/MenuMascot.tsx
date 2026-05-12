import { motion } from 'framer-motion';
import { useHitBowProgress } from '../../context/HitBowProgressContext';

/** Cartoon archer mascot for the main menu (inline SVG). */
export function MenuMascot({ className = '' }: { className?: string }) {
  const { settings } = useHitBowProgress();
  const reduce = settings.reduceMotion;

  const svg = (
    <svg
      viewBox="0 0 120 140"
      className="w-28 h-32 md:w-36 md:h-40 drop-shadow-[0_8px_0_rgba(0,0,0,0.35)]"
      aria-hidden>
      <ellipse cx="60" cy="128" rx="40" ry="8" fill="rgba(0,0,0,0.25)" />
      <path
        d="M40 95 Q60 115 80 95 L75 70 L45 70 Z"
        fill="#5c6bc0"
        stroke="#1a237e"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle
        cx="60"
        cy="48"
        r="32"
        fill="#ffe0b2"
        stroke="#1a237e"
        strokeWidth="3"
      />
      <ellipse cx="52" cy="52" rx="4" ry="5" fill="#1a237e" />
      <ellipse cx="72" cy="52" rx="4" ry="5" fill="#1a237e" />
      <path
        d="M48 62 Q60 70 72 62"
        fill="none"
        stroke="#c62828"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="45" cy="45" r="5" fill="#ff8a80" opacity="0.7" />
      <circle cx="78" cy="45" r="5" fill="#ff8a80" opacity="0.7" />
      <path
        d="M38 38 Q60 28 82 38"
        fill="none"
        stroke="#1a237e"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="22"
        y="58"
        width="8"
        height="36"
        rx="3"
        fill="#8d6e63"
        stroke="#1a237e"
        strokeWidth="2"
        transform="rotate(-25 26 76)"
      />
      <path
        d="M28 72 L95 40"
        fill="none"
        stroke="#bdbdbd"
        strokeWidth="2"
      />
      <path
        d="M95 40 L102 35 M95 40 L102 45"
        fill="none"
        stroke="#00f0ff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="60" cy="22" rx="14" ry="8" fill="#00f0ff" opacity="0.9" />
    </svg>
  );

  if (reduce) {
    return <div className={className}>{svg}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -6, 0], rotate: [0, -2, 2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      {svg}
    </motion.div>
  );
}
