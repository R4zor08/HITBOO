import React from 'react';
import type { CharacterInnerProps } from './shared';
import { FootShadow, FaceDeadXs } from './shared';

/** Arcade C01: Barbarian - Muscular with spiked club */
export function SpriteArcadeC01Barbarian({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* Massive legs */}
      <path d="M28 118 L72 118 L78 150 L22 150 Z" fill="#d2691e" stroke={stroke} strokeWidth="3" />
      {/* Huge muscular body */}
      <ellipse cx="50" cy="100" rx="28" ry="35" fill="#8b4513" stroke={stroke} strokeWidth="3" />
      {/* Giant arms */}
      <ellipse cx="18" cy="90" rx="14" ry="40" fill="#a0522d" stroke={stroke} strokeWidth="3" />
      <ellipse cx="82" cy="90" rx="14" ry="40" fill="#a0522d" stroke={stroke} strokeWidth="3" />
      {/* Spiked shoulders */}
      <circle cx="20" cy="70" r="8" fill="#666" stroke={stroke} strokeWidth="2.5" />
      <circle cx="80" cy="70" r="8" fill="#666" stroke={stroke} strokeWidth="2.5" />
      {/* Large head */}
      <circle cx="50" cy="42" r="34" fill="#cd853f" stroke={stroke} strokeWidth="4" />
      {/* Wild hair */}
      <path d="M32 20 Q30 5 40 10 Q45 8 50 5 Q55 8 60 10 Q70 5 68 20" fill="#000" stroke={stroke} strokeWidth="2" />
      {/* Beard */}
      <path d="M38 62 Q50 70 62 62" fill="#3d2817" stroke={stroke} strokeWidth="2.5" />
      {!isDead ? (
        <>
          <circle cx="40" cy="38" r="4" fill="#000" />
          <circle cx="60" cy="38" r="4" fill="#000" />
          <path d="M44 52 Q50 58 56 52" fill="none" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

/** Arcade C02: Assassin - Sleek ninja with shuriken */
export function SpriteArcadeC02Assassin({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* Sleek legs */}
      <path d="M35 118 L65 118 L70 150 L30 150 Z" fill="#1a1a1a" stroke={stroke} strokeWidth="3" />
      {/* Lean body */}
      <path d="M40 118 Q50 135 60 118 L58 92 L42 92 Z" fill="#2d2d2d" stroke={stroke} strokeWidth="3" />
      {/* Narrow arms */}
      <line x1="18" y1="95" x2="8" y2="115" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" />
      <line x1="82" y1="95" x2="92" y2="115" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" />
      {/* Head mask */}
      <circle cx="50" cy="50" r="28" fill="#1a1a1a" stroke={stroke} strokeWidth="3" />
      {/* Mask eyeholes */}
      <ellipse cx="42" cy="48" rx="5" ry="7" fill="#4a4a4a" stroke={stroke} strokeWidth="1.5" />
      <ellipse cx="58" cy="48" rx="5" ry="7" fill="#4a4a4a" stroke={stroke} strokeWidth="1.5" />
      {/* Ninja hood top */}
      <path d="M32 32 Q50 20 68 32" fill="#0d0d0d" stroke={stroke} strokeWidth="2" />
      {!isDead ? (
        <>
          <circle cx="42" cy="48" r="2.5" fill="#ff0000" />
          <circle cx="58" cy="48" r="2.5" fill="#ff0000" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
      {/* Shuriken/star accent */}
      <path d="M78 68 L82 72 L78 76 L74 72 Z" fill={accentHex} stroke={stroke} strokeWidth="2" />
    </>
  );
}

/** Arcade C03: Banana Warrior - Silly banana character */
export function SpriteArcadeC03BananaWarrior({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* Banana body - curved */}
      <path d="M30 120 Q45 100 60 115 Q65 125 55 140 Q40 145 30 130 Z" fill="#ffd700" stroke={stroke} strokeWidth="3.5" />
      {/* Head - banana bulb */}
      <ellipse cx="50" cy="45" rx="32" ry="40" fill="#ffd700" stroke={stroke} strokeWidth="4" />
      {/* Brown peel top */}
      <path d="M30 25 Q50 10 70 25" fill="#a0826d" stroke={stroke} strokeWidth="2.5" />
      {/* Stubby arms */}
      <circle cx="16" cy="85" r="10" fill="#ffd700" stroke={stroke} strokeWidth="2.5" />
      <circle cx="84" cy="85" r="10" fill="#ffd700" stroke={stroke} strokeWidth="2.5" />
      {/* Stubby feet */}
      <ellipse cx="38" cy="138" rx="8" ry="12" fill="#8b7355" stroke={stroke} strokeWidth="2" />
      <ellipse cx="62" cy="138" rx="8" ry="12" fill="#8b7355" stroke={stroke} strokeWidth="2" />
      {!isDead ? (
        <>
          <circle cx="40" cy="40" r="5" fill="#000" />
          <circle cx="60" cy="40" r="5" fill="#000" />
          <path d="M44 58 Q50 64 56 58" fill="none" stroke="#a0826d" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

/** Arcade C04: Pirate - Swashbuckling pirate with hook */
export function SpriteArcadeC04Pirate({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* Pirate boots */}
      <path d="M28 118 L72 118 L76 150 L24 150 Z" fill="#000" stroke={stroke} strokeWidth="3" />
      {/* Striped body */}
      <path d="M35 118 Q50 140 65 118 L62 92 L38 92 Z" fill="#d70000" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <line x1="42" y1="92" x2="48" y2="130" stroke="#fff" strokeWidth="2" opacity="0.7" />
      <line x1="52" y1="92" x2="58" y2="130" stroke="#fff" strokeWidth="2" opacity="0.7" />
      {/* Pirate coat arms */}
      <path d="M15 100 L8 120 L20 118 Z" fill="#8b0000" stroke={stroke} strokeWidth="2.5" />
      <path d="M85 100 L92 120 L80 118 Z" fill="#8b0000" stroke={stroke} strokeWidth="2.5" />
      {/* Hook hand */}
      <path d="M92 120 Q100 115 104 125" fill="none" stroke="#ffd700" strokeWidth="4" strokeLinecap="round" />
      {/* Head */}
      <circle cx="50" cy="48" r="30" fill="#f4a460" stroke={stroke} strokeWidth="3.5" />
      {/* Pirate hat */}
      <path d="M28 32 L72 32 L70 22 L30 22 Z" fill="#000" stroke={stroke} strokeWidth="2.5" />
      <circle cx="50" cy="20" r="5" fill="#ffd700" stroke={stroke} strokeWidth="2" />
      {/* Eye patch */}
      <circle cx="42" cy="46" r="6" fill="#000" stroke={stroke} strokeWidth="2" />
      {!isDead ? (
        <>
          <circle cx="58" cy="46" r="5" fill="#000" />
          <path d="M44 58 Q50 64 56 58" fill="none" stroke="#8b0000" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

/** Arcade C05: Cowboy - Wild west shooter */
export function SpriteArcadeC05Cowboy({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* Cowboy boots */}
      <path d="M30 122 L70 122 L74 150 L26 150 Z" fill="#8b4513" stroke={stroke} strokeWidth="3" />
      {/* Tan body */}
      <path d="M36 120 Q50 138 64 120 L60 92 L40 92 Z" fill="#d4a574" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      {/* Arms */}
      <ellipse cx="18" cy="95" rx="10" ry="30" fill="#daa520" stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="82" cy="95" rx="10" ry="30" fill="#daa520" stroke={stroke} strokeWidth="2.5" />
      {/* Head */}
      <circle cx="50" cy="48" r="30" fill="#d2b48c" stroke={stroke} strokeWidth="3.5" />
      {/* Cowboy hat - huge brim */}
      <ellipse cx="50" cy="18" rx="44" ry="12" fill="#8b0000" stroke={stroke} strokeWidth="2.5" />
      <path d="M35 20 L50 12 L65 20" fill="#b8860b" stroke={stroke} strokeWidth="2" />
      {/* Hat band */}
      <rect x="38" y="24" width="24" height="4" fill="#ffd700" stroke={stroke} strokeWidth="1.5" />
      {!isDead ? (
        <>
          <circle cx="40" cy="46" r="4" fill="#000" />
          <circle cx="60" cy="46" r="4" fill="#000" />
          <path d="M44 58 Q50 64 56 58" fill="none" stroke="#8b4513" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

/** Arcade C06: Alien - Green extraterrestrial */
export function SpriteArcadeC06Alien({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* Thin legs */}
      <line x1="42" y1="115" x2="40" y2="150" stroke="#00ff00" strokeWidth="5" strokeLinecap="round" />
      <line x1="58" y1="115" x2="60" y2="150" stroke="#00ff00" strokeWidth="5" strokeLinecap="round" />
      {/* Bulbous body */}
      <ellipse cx="50" cy="110" rx="25" ry="30" fill="#00ff00" stroke={stroke} strokeWidth="3" />
      {/* Long arms */}
      <path d="M20 95 L10 125" stroke="#00ff00" strokeWidth="6" strokeLinecap="round" />
      <path d="M80 95 L90 125" stroke="#00ff00" strokeWidth="6" strokeLinecap="round" />
      {/* Hands */}
      <circle cx="10" cy="125" r="6" fill="#00ff00" stroke={stroke} strokeWidth="2" />
      <circle cx="90" cy="125" r="6" fill="#00ff00" stroke={stroke} strokeWidth="2" />
      {/* Huge head */}
      <circle cx="50" cy="55" r="36" fill="#00ff00" stroke={stroke} strokeWidth="4" />
      {/* Antennae */}
      <line x1="35" y1="18" x2="30" y2="5" stroke="#00ff00" strokeWidth="3" strokeLinecap="round" />
      <line x1="65" y1="18" x2="70" y2="5" stroke="#00ff00" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="5" r="3" fill="#ff00ff" />
      <circle cx="70" cy="5" r="3" fill="#ff00ff" />
      {!isDead ? (
        <>
          <circle cx="40" cy="50" r="6" fill="#000" />
          <circle cx="60" cy="50" r="6" fill="#000" />
          <path d="M45 70 Q50 76 55 70" fill="none" stroke="#00ff00" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

/** Arcade C07: Construction Worker - Hard hat and tools */
export function SpriteArcadeC07ConstructionWorker({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* Work boots */}
      <path d="M32 118 L68 118 L72 150 L28 150 Z" fill="#000" stroke={stroke} strokeWidth="3" />
      {/* Orange vest */}
      <path d="M36 118 Q50 138 64 118 L62 92 L38 92 Z" fill="#ff8c00" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      {/* Reflective stripes */}
      <line x1="50" y1="92" x2="52" y2="130" stroke="#ffff00" strokeWidth="3" opacity="0.8" />
      {/* Work arms */}
      <ellipse cx="18" cy="100" rx="10" ry="28" fill="#cd853f" stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="82" cy="100" rx="10" ry="28" fill="#cd853f" stroke={stroke} strokeWidth="2.5" />
      {/* Head */}
      <circle cx="50" cy="50" r="28" fill="#f4a460" stroke={stroke} strokeWidth="3" />
      {/* Hard hat */}
      <path d="M30 32 L70 32 Q75 28 75 24 Q50 16 25 24 Q25 28 30 32 Z" fill="#ffa500" stroke={stroke} strokeWidth="3" />
      {/* Chin strap */}
      <line x1="35" y1="32" x2="40" y2="62" stroke="#000" strokeWidth="1.5" opacity="0.6" />
      <line x1="65" y1="32" x2="60" y2="62" stroke="#000" strokeWidth="1.5" opacity="0.6" />
      {!isDead ? (
        <>
          <circle cx="40" cy="48" r="4" fill="#000" />
          <circle cx="60" cy="48" r="4" fill="#000" />
          <path d="M44 60 Q50 66 56 60" fill="none" stroke="#ff8c00" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
      {/* Wrench tool */}
      <path d="M85 85 L98 98 M96 97 Q102 103 100 108" stroke="#888" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

/** Arcade C08: Student - Young scholar with backpack */
export function SpriteArcadeC08Student({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      {/* School shoes */}
      <ellipse cx="40" cy="148" rx="8" ry="10" fill="#000" stroke={stroke} strokeWidth="2" />
      <ellipse cx="60" cy="148" rx="8" ry="10" fill="#000" stroke={stroke} strokeWidth="2" />
      {/* Pants */}
      <path d="M38 120 L42 148 L58 148 L62 120" fill="#1e3a8a" stroke={stroke} strokeWidth="3" />
      {/* Red shirt/sweater */}
      <path d="M36 120 Q50 140 64 120 L62 92 L38 92 Z" fill="#dc2626" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      {/* Arms */}
      <ellipse cx="18" cy="100" rx="10" ry="25" fill="#fdbf4f" stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="82" cy="100" rx="10" ry="25" fill="#fdbf4f" stroke={stroke} strokeWidth="2.5" />
      {/* Head */}
      <circle cx="50" cy="50" r="28" fill="#fdbf4f" stroke={stroke} strokeWidth="3.5" />
      {/* Hair */}
      <path d="M28 40 Q50 20 72 40" fill="#3d2817" stroke={stroke} strokeWidth="2.5" />
      {/* Backpack */}
      <rect x="56" y="95" width="18" height="28" rx="2" fill="#6b21a8" stroke={stroke} strokeWidth="2.5" />
      <line x1="58" y1="105" x2="72" y2="105" stroke="#a78bfa" strokeWidth="2" />
      <line x1="58" y1="115" x2="72" y2="115" stroke="#a78bfa" strokeWidth="2" />
      {!isDead ? (
        <>
          <circle cx="40" cy="48" r="4" fill="#000" />
          <circle cx="60" cy="48" r="4" fill="#000" />
          <path d="M44 60 Q50 66 56 60" fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}
