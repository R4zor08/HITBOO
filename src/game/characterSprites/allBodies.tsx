import React from 'react';
import type { CharacterInnerProps } from './shared';
import { DMouthAlive, FaceDeadXs, FaceDots, FootShadow } from './shared';

/** Cupid-class archer (sheet row 1 col 9) */
export function SpriteR1C09Cupid({ accentHex, isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      <path
        d="M18 92 Q8 76 22 72 Q28 80 26 94 Z"
        fill="#7dd3fc"
        stroke={stroke}
        strokeWidth="2.5"
      />
      <path
        d="M82 92 Q92 76 78 72 Q72 80 74 94 Z"
        fill="#7dd3fc"
        stroke={stroke}
        strokeWidth="2.5"
      />
      <path
        d="M34 118 Q50 138 66 118 L60 92 L40 92 Z"
        fill="#e0f2fe"
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M42 112 L58 112 L54 126 L46 126 Z" fill={accentHex} stroke={stroke} strokeWidth="2" />
      <path d="M42 126 Q50 134 58 126" fill="#fff" stroke={stroke} strokeWidth="2.5" />
      <circle cx="50" cy="48" r="32" fill="#fde7c8" stroke={stroke} strokeWidth="4" />
      <path d="M34 26 Q42 14 50 22 Q58 14 68 26" fill="#fff59d" stroke={stroke} strokeWidth="3" />
      {!isDead ? (
        <>
          <FaceDots cx1={40} cx2={60} cy={46} stroke={stroke} />
          <ellipse cx="50" cy="58" rx="10" ry="6" fill="white" opacity="0.35" stroke={stroke} strokeWidth="2" />
          <path
            d="M42 64 Q50 70 58 64"
            fill="none"
            stroke="#e11d48"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="36" cy="54" r="4" fill="#fda4af" />
          <circle cx="64" cy="54" r="4" fill="#fda4af" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
      <path
        d="M76 118 Q88 100 94 118 Q88 136 76 118"
        fill="none"
        stroke="#8d5a37"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path d="M20 112 L94 118" stroke={stroke} strokeWidth="2" />
      <line x1="88" y1="98" x2="88" y2="138" stroke={accentHex} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

/** Devil + pirate mashup default rival */
export function SpriteR2MashRaider({ isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      <path d="M32 118 L68 118 L72 146 L28 146 Z" fill="#4c1d95" stroke={stroke} strokeWidth="3" />
      <path d="M30 118 Q50 132 70 118" fill="#991b1b" stroke={stroke} strokeWidth="3" />
      <path d="M32 118 L52 126 L76 126 L68 92 L36 92 Z" fill="#b45309" stroke={stroke} strokeWidth="3" />
      <path
        d="M38 94 L62 94 L72 74 L62 74 L50 82 L38 74 L28 74 Z"
        fill="#18181b"
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="40" y="88" width="20" height="8" rx="2" fill="#dc2626" stroke={stroke} strokeWidth="2" />
      <path d="M38 92 L34 74 L42 82 Z" fill="#fcd34d" stroke={stroke} strokeWidth="2" />
      <path d="M62 92 L66 74 L58 82 Z" fill="#fcd34d" stroke={stroke} strokeWidth="2" />
      <circle cx="50" cy="48" r="32" fill="#fca5a5" stroke={stroke} strokeWidth="4" />
      <path d="M36 72 Q50 88 64 72" fill="#fecdd3" stroke={stroke} strokeWidth="3" />
      {!isDead ? (
        <>
          <FaceDots cx1={40} cx2={60} cy={44} stroke={stroke} />
          <path
            d="M42 62 Q50 56 58 62"
            fill="none"
            stroke="#7f1d1d"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M78 118 L94 124" stroke="#9ca3af" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="96" cy="124" rx="4" ry="6" fill="#d1d5db" stroke={stroke} strokeWidth="2" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

function simpleHead(cx: number, cy: number, r: number, fill: string, stroke: string) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="3.5" />;
}

function standardBody(fill: string, stroke: string) {
  return (
    <path
      d="M34 118 Q50 138 66 118 L60 92 L40 92 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  );
}

export function SpriteR2C01Devil({ isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      <path d="M28 118 L72 118 L76 150 L24 150 Z" fill="#581c87" stroke={stroke} strokeWidth="3" />
      {standardBody('#dc2626', stroke)}
      <path d="M36 90 L34 68 L44 78 Z" fill="#1e1b4b" stroke={stroke} strokeWidth="2.5" />
      <path d="M64 90 L66 68 L56 78 Z" fill="#1e1b4b" stroke={stroke} strokeWidth="2.5" />
      {simpleHead(50, 48, 30, '#f87171', stroke)}
      {!isDead ? (
        <>
          <FaceDots cx1={40} cx2={60} cy={46} stroke={stroke} />
          <path d="M44 60 Q50 66 56 60" fill="none" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR2C09Pirate({ isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      <path d="M32 122 L68 122 L72 146 L28 146 Z" fill="#6b21a8" stroke={stroke} strokeWidth="3" />
      <path d="M34 120 L54 132 L74 132 L66 94 L42 94 Z" fill="#22d3ee" stroke={stroke} strokeWidth="3" />
      <path d="M40 134 L72 146 L74 154 L38 154 Z" fill="#7e22ce" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 96 H68 L74 74 H26 Z" fill="#18181b" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <rect x="34" y="78" width="32" height="10" rx="2" fill="#ca8a04" stroke={stroke} strokeWidth="2" />
      <circle cx="38" cy="82" r="3" fill="#fef08a" />
      <path d="M36 92 H64" stroke="#18181b" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      {simpleHead(50, 46, 30, '#fdba74', stroke)}
      <path d="M34 70 Q50 92 66 70" fill="#ea580c" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
      {!isDead ? (
        <>
          <FaceDots cx1={41} cx2={59} cy={44} stroke={stroke} />
          <ellipse cx="50" cy="54" rx="11" ry="9" fill="white" opacity="0.9" stroke={stroke} strokeWidth="2" />
          <path d="M78 118 L94 124" stroke="#9ca3af" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="96" cy="124" rx="4" ry="6" fill="#d1d5db" stroke={stroke} strokeWidth="2" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

function templateHuman(
  props: CharacterInnerProps & {
    skin: string;
    bodyFill: string;
    extra?: React.ReactNode;
    hat?: React.ReactNode;
  }
) {
  const { isDead, stroke, skin, bodyFill, extra, hat } = props;
  return (
    <>
      <FootShadow stroke={stroke} />
      {standardBody(bodyFill, stroke)}
      {hat}
      {simpleHead(50, 48, 31, skin, stroke)}
      {!isDead ? (
        <>
          <FaceDots cx1={40} cx2={60} cy={46} stroke={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
      {extra}
    </>
  );
}

export function SpriteR1C01Witch(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#86efac',
    bodyFill: '#581c87',
    hat: (
      <>
        <path d="M30 28 L70 28 L50 8 Z" fill="#18181b" stroke={p.stroke} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="42" y="28" width="16" height="6" rx="1" fill="#18181b" stroke={p.stroke} strokeWidth="2" />
      </>
    )
  });
}

export function SpriteR1C02Chef(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fcd9b8',
    bodyFill: '#e2e8f0',
    hat: (
      <path
        d="M32 40 L34 12 H66 L68 40 Z"
        fill="#f8fafc"
        stroke={p.stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    ),
    extra: (
      <path d="M42 58 Q50 62 58 58" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
    )
  });
}

export function SpriteR1C03Jester(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#facc15',
    hat: (
      <>
        <path d="M36 24 L50 8 L64 24" fill="#ef4444" stroke={p.stroke} strokeWidth="2.5" />
        <circle cx="42" cy="20" r="4" fill="#facc15" stroke={p.stroke} strokeWidth="1.5" />
        <circle cx="58" cy="20" r="4" fill="#facc15" stroke={p.stroke} strokeWidth="1.5" />
      </>
    ),
    extra: <path d="M40 66 L60 66" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
  });
}

export function SpriteR1C04Rapper(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#92400e',
    bodyFill: '#1e293b',
    hat: (
      <>
        <ellipse cx="38" cy="24" rx="6" ry="8" fill="#18181b" stroke={p.stroke} strokeWidth="2" />
        <ellipse cx="50" cy="22" rx="6" ry="8" fill="#18181b" stroke={p.stroke} strokeWidth="2" />
        <ellipse cx="62" cy="24" rx="6" ry="8" fill="#18181b" stroke={p.stroke} strokeWidth="2" />
      </>
    ),
    extra: (
      <ellipse
        cx="50"
        cy="110"
        rx="18"
        ry="8"
        fill="none"
        stroke="#fcd34d"
        strokeWidth="4"
        opacity="0.9"
      />
    )
  });
}

export function SpriteR1C05Clown(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fff1f2',
    bodyFill: '#3b82f6',
    hat: (
      <path d="M38 30 Q50 12 62 30 Z" fill="#a855f7" stroke={p.stroke} strokeWidth="2.5" />
    ),
    extra: <circle cx="50" cy="52" r="6" fill="#ef4444" stroke={p.stroke} strokeWidth="2" />
  });
}

export function SpriteR1C06Hipster(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#334155',
    extra: (
      <>
        <rect x="36" y="40" width="28" height="10" rx="2" fill="#0f172a" stroke={p.stroke} strokeWidth="2" />
        <circle cx="42" cy="45" r="3" fill="#e2e8f0" />
        <circle cx="58" cy="45" r="3" fill="#e2e8f0" />
        <path d="M40 70 Q50 78 60 70" fill="#78350f" stroke={p.stroke} strokeWidth="2.5" opacity="0.9" />
      </>
    )
  });
}

export function SpriteR1C07Zombie(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#bbf7d0',
    bodyFill: '#7e22ce',
    extra: (
      <path d="M42 40 H58 M44 36 H56" stroke={p.stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    )
  });
}

export function SpriteR1C08Ballerina(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#fecdd3',
    hat: (
      <path d="M42 18 L50 8 L58 18 Z" fill="#facc15" stroke={p.stroke} strokeWidth="2" strokeLinejoin="round" />
    ),
    extra: (
      <ellipse cx="50" cy="134" rx="28" ry="10" fill="#fda4af" stroke={p.stroke} strokeWidth="2.5" />
    )
  });
}

export function SpriteR1C10Cheerleader(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#c026d3',
    extra: (
      <>
        <circle cx="26" cy="102" r="8" fill="#a855f7" stroke={p.stroke} strokeWidth="2" />
        <circle cx="74" cy="102" r="8" fill="#a855f7" stroke={p.stroke} strokeWidth="2" />
      </>
    )
  });
}

export function SpriteR2C02Caveman(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fdba74',
    bodyFill: '#f59e0b',
    extra: (
      <path
        d="M32 98 L68 98 L64 110 L36 110 Z"
        fill="#d97706"
        stroke={p.stroke}
        strokeWidth="2.5"
        opacity="0.9"
      />
    )
  });
}

export function SpriteR2C03Elf(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#16a34a',
    hat: (
      <>
        <path d="M42 18 L50 6 L58 18 Z" fill="#22c55e" stroke={p.stroke} strokeWidth="2" />
        <circle cx="50" cy="20" r="4" fill="#ef4444" stroke={p.stroke} strokeWidth="1.5" />
      </>
    )
  });
}

export function SpriteR2C04Santa(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fcd9b8',
    bodyFill: '#dc2626',
    hat: (
      <>
        <path d="M38 25 Q50 10 70 30 L36 36 Z" fill="#ef4444" stroke={p.stroke} strokeWidth="2.5" />
        <circle cx="68" cy="32" r="5" fill="#f8fafc" stroke={p.stroke} strokeWidth="1.5" />
      </>
    ),
    extra: <path d="M40 70 Q50 88 60 70" fill="#f8fafc" stroke={p.stroke} strokeWidth="2.5" />
  });
}

export function SpriteR2C05Trucker(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#b91c1c',
    hat: <rect x="32" y="18" width="36" height="18" rx="3" fill="#dc2626" stroke={p.stroke} strokeWidth="2.5" />
  });
}

export function SpriteR2C06Biker(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fdba74',
    bodyFill: '#18181b',
    hat: (
      <path d="M38 40 L40 24 L60 24 L62 40 Z" fill="#1e293b" stroke={p.stroke} strokeWidth="2.5" />
    ),
    extra: <path d="M36 110 H64" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
  });
}

export function SpriteR2C07Prisoner(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#7c3aed',
    extra: (
      <>
        <path d="M38 100 H62 M38 108 H62 M38 116 H62" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
      </>
    )
  });
}

export function SpriteR2C08Swimsuit(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fdba74',
    bodyFill: '#ec4899',
    extra: (
      <ellipse cx="50" cy="128" rx="24" ry="8" fill="#22c55e" stroke={p.stroke} strokeWidth="2.5" opacity="0.75" />
    )
  });
}

export function SpriteR3C01Frankenstein(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#86efac',
    bodyFill: '#6b21a8',
    extra: (
      <>
        <path d="M28 38 H72" stroke="#18181b" strokeWidth="2" />
        <circle cx="42" cy="32" r="3" fill="#18181b" />
        <circle cx="58" cy="32" r="3" fill="#18181b" />
      </>
    )
  });
}

export function SpriteR3C02Police(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#1d4ed8',
    hat: <path d="M36 22 H64 V36 H36 Z" fill="#1e3a8a" stroke={p.stroke} strokeWidth="2.5" />,
    extra: <rect x="38" y="44" width="24" height="8" rx="2" fill="#0f172a" stroke={p.stroke} strokeWidth="1.5" />
  });
}

export function SpriteR3C03Lumberjack(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fcd9b8',
    bodyFill: '#b45309',
    hat: <ellipse cx="50" cy="26" rx="22" ry="14" fill="#dc2626" stroke={p.stroke} strokeWidth="2.5" />,
    extra: (
      <>
        <path d="M36 98 H64" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
      </>
    )
  });
}

export function SpriteR3C04Leather(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#18181b',
    extra: <rect x="42" y="104" width="16" height="8" rx="2" fill="#3f3f46" stroke={p.stroke} strokeWidth="2" />
  });
}

export function SpriteR3C05Vampire({ isDead, stroke }: CharacterInnerProps) {
  return (
    <>
      <FootShadow stroke={stroke} />
      <path d="M22 118 L78 118 L84 154 L16 154 Z" fill="#4c1d95" stroke={stroke} strokeWidth="3.5" />
      <path d="M32 118 L36 94 L64 94 L68 118 Z" fill="#5b21b6" stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="48" r="30" fill="#ede9fe" stroke={stroke} strokeWidth="3.5" />
      {!isDead ? (
        <>
          <path d="M44 62 L50 52 L56 62" fill="#18181b" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="40" cy="44" r="4" fill={stroke} />
          <circle cx="60" cy="44" r="4" fill={stroke} />
          <path d="M42 76 Q50 84 58 76" fill="white" opacity="0.9" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR3C06Cowboy(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fcd9b8',
    bodyFill: '#0d9488',
    hat: <ellipse cx="50" cy="26" rx="24" ry="12" fill="#78350f" stroke={p.stroke} strokeWidth="2.5" />
  });
}

export function SpriteR3C07Knight(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#e0f2fe',
    bodyFill: '#7dd3fc',
    hat: (
      <path
        d="M36 40 L50 12 L64 40 Z"
        fill="#94a3b8"
        stroke={p.stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    )
  });
}

export function SpriteR3C08Sailor(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fde7c8',
    bodyFill: '#f8fafc',
    extra: (
      <path d="M36 100 H64 M40 108 H60" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
    )
  });
}

export function SpriteR3C09Viking(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fcd9b8',
    bodyFill: '#64748b',
    hat: (
      <>
        <path d="M32 35 H68 L64 18 L36 18 Z" fill="#94a3b8" stroke={p.stroke} strokeWidth="2.5" />
        <path d="M36 18 L34 8 M50 16 L50 4 M64 18 L66 8" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
      </>
    )
  });
}

export function SpriteR3C10Cavewoman(p: CharacterInnerProps) {
  return templateHuman({
    ...p,
    skin: '#fdba74',
    bodyFill: '#f472b6',
    extra: (
      <path d="M34 100 L66 100 L62 112 L38 112 Z" fill="#d97706" stroke={p.stroke} strokeWidth="2" />
    )
  });
}

export function SpriteR4C01Monkey(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="120" rx="22" ry="18" fill="#7c3aed" stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="54" r="30" fill="#a855f7" stroke={stroke} strokeWidth="3.5" />
      <ellipse cx="36" cy="50" rx="8" ry="10" fill="#a855f7" stroke={stroke} strokeWidth="2" />
      <ellipse cx="64" cy="50" rx="8" ry="10" fill="#a855f7" stroke={stroke} strokeWidth="2" />
      {!isDead ? (
        <>
          <circle cx="43" cy="52" r="4" fill={stroke} />
          <circle cx="57" cy="52" r="4" fill={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR4C02Cow(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="122" rx="24" ry="16" fill="#fda4af" stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="54" r="28" fill="#fecdd3" stroke={stroke} strokeWidth="3" />
      {!isDead ? (
        <>
          <FaceDots cx1={42} cx2={58} cy={50} stroke={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
      <ellipse cx="28" cy="60" rx="6" ry="8" fill="#db2777" stroke={stroke} strokeWidth="2" />
    </>
  );
}

export function SpriteR4C03Moose(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="118" rx="24" ry="18" fill="#b91c1c" stroke={stroke} strokeWidth="3" />
      <ellipse cx="50" cy="54" rx="26" ry="24" fill="#ef4444" stroke={stroke} strokeWidth="3" />
      <path d="M30 40 L24 16 L36 32 M70 40 L76 16 L64 32" fill="#fde68a" stroke={stroke} strokeWidth="2.5" />
      {!isDead ? (
        <>
          <circle cx="43" cy="50" r="4" fill={stroke} />
          <circle cx="57" cy="50" r="4" fill={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR4C04Bunny(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <rect x="38" y="100" width="24" height="24" rx="4" fill="#1e293b" stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="50" cy="52" rx="24" ry="22" fill="#fdf2f8" stroke={stroke} strokeWidth="3" />
      <ellipse cx="40" cy="22" rx="6" ry="18" fill="#fdf2f8" stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="60" cy="22" rx="6" ry="18" fill="#fdf2f8" stroke={stroke} strokeWidth="2.5" />
      {!isDead ? (
        <>
          <FaceDots cx1={43} cx2={57} cy={52} stroke={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR4C05Kangaroo(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="124" rx="20" ry="14" fill="#ea580c" stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="54" r="27" fill="#fb923c" stroke={stroke} strokeWidth="3" />
      <ellipse cx="74" cy="110" rx="10" ry="16" fill="#fb923c" stroke={stroke} strokeWidth="2.5" />
      {!isDead ? (
        <>
          <FaceDots cx1={42} cx2={58} cy={50} stroke={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR4C06Unicorn(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="120" rx="22" ry="16" fill="#e0f2fe" stroke={stroke} strokeWidth="3" />
      <circle cx="48" cy="52" r="26" fill="#f8fafc" stroke={stroke} strokeWidth="3" />
      <path d="M52 22 L58 6 L64 24 Z" fill="#a855f7" stroke={stroke} strokeWidth="2" />
      {!isDead ? (
        <>
          <FaceDots cx1={40} cx2={56} cy={48} stroke={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR4C07Dino(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="120" rx="24" ry="16" fill="#16a34a" stroke={stroke} strokeWidth="3" />
      <ellipse cx="50" cy="52" rx="30" ry="26" fill="#4ade80" stroke={stroke} strokeWidth="3" />
      <path d="M78 54 L92 50 L86 60 Z" fill="#4ade80" stroke={stroke} strokeWidth="2" />
      {!isDead ? (
        <>
          <circle cx="42" cy="48" r="5" fill={stroke} />
          <circle cx="58" cy="48" r="5" fill={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR4C08Bear(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="118" rx="26" ry="18" fill="#78350f" stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="52" r="30" fill="#92400e" stroke={stroke} strokeWidth="3.5" />
      <circle cx="26" cy="40" r="10" fill="#92400e" stroke={stroke} strokeWidth="2.5" />
      <circle cx="74" cy="40" r="10" fill="#92400e" stroke={stroke} strokeWidth="2.5" />
      {!isDead ? (
        <>
          <circle cx="43" cy="50" r="4" fill="#18181b" />
          <circle cx="57" cy="50" r="4" fill="#18181b" />
          <ellipse cx="50" cy="60" rx="10" ry="6" fill="#451a03" stroke={stroke} strokeWidth="2" />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR4C09Yeti(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      <ellipse cx="50" cy="118" rx="24" ry="16" fill="#bae6fd" stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="54" r="32" fill="#e0f2fe" stroke={stroke} strokeWidth="3.5" />
      {!isDead ? (
        <>
          <FaceDots cx1={40} cx2={60} cy={52} stroke="#0ea5e9" />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}

export function SpriteR5C01Swimmer(p: CharacterInnerProps) {
  const { isDead, stroke } = p;
  return (
    <>
      <FootShadow stroke={stroke} />
      {standardBody('#2563eb', stroke)}
      <ellipse cx="50" cy="128" rx="28" ry="10" fill="#22c55e" stroke={stroke} strokeWidth="2.5" />
      {simpleHead(50, 48, 26, '#fcd9b8', stroke)}
      <rect x="40" y="22" width="20" height="12" rx="3" fill="#ef4444" stroke={stroke} strokeWidth="2" />
      <rect x="36" y="40" width="28" height="9" rx="2" fill="#18181b" stroke={stroke} strokeWidth="2" />
      <circle cx="45" cy="44" r="3" fill="#38bdf8" />
      <circle cx="55" cy="44" r="3" fill="#38bdf8" />
      {!isDead ? (
        <>
          <FaceDots cx1={42} cx2={58} cy={50} stroke={stroke} />
          <DMouthAlive stroke={stroke} />
        </>
      ) : (
        <FaceDeadXs stroke={stroke} />
      )}
    </>
  );
}
