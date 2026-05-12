export type CharacterInnerProps = {
  accentHex: string;
  isDead: boolean;
  stroke: string;
};

/** Standard floor shadow sticker characters sit on */
export function FootShadow({ stroke }: { stroke: string }) {
  return <ellipse cx="50" cy="158" rx="24" ry="6" fill="rgba(0,0,0,0.35)" stroke={stroke} strokeWidth={0} />;
}

export function FaceDots({
  cx1,
  cx2,
  cy,
  stroke
}: {
  cx1: number;
  cx2: number;
  cy: number;
  stroke: string;
}) {
  return (
    <>
      <circle cx={cx1} cy={cy} r={5} fill={stroke} />
      <circle cx={cx2} cy={cy} r={5} fill={stroke} />
    </>
  );
}

export function FaceDeadXs({ stroke }: { stroke: string }) {
  return (
    <>
      <path d="M36 42 L42 48 M42 42 L36 48" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
      <path d="M58 42 L64 48 M64 42 L58 48" stroke={stroke} strokeWidth={4} strokeLinecap="round" />
    </>
  );
}

export function DMouthAlive({ stroke }: { stroke: string }) {
  return (
    <ellipse cx="50" cy="60" rx="12" ry="8" fill="white" opacity={0.9} stroke={stroke} strokeWidth={2}>
      <title>smile</title>
    </ellipse>
  );
}
