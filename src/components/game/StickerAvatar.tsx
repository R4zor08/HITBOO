import type { CharacterId } from '../../game/charactersCatalog';
import { DEFAULT_PLAYER_CHARACTER_ID, DEFAULT_ENEMY_CHARACTER_ID } from '../../game/charactersCatalog';
import { CHARACTER_SPRITE_BODIES } from '../../game/characterSprites/registry';

const SPRITE_STROKE = '#140820';

type StickerAvatarProps = {
  characterId: CharacterId | null | undefined;
  side?: 'player' | 'enemy';
  className?: string;
  accentHex?: string;
};

export function StickerAvatar({
  characterId,
  side = 'player',
  className = '',
  accentHex = '#00f0ff'
}: StickerAvatarProps) {
  const id =
    characterId ??
    (side === 'player' ? DEFAULT_PLAYER_CHARACTER_ID : DEFAULT_ENEMY_CHARACTER_ID);
  const Body =
    CHARACTER_SPRITE_BODIES[id] ??
    CHARACTER_SPRITE_BODIES[
      side === 'player' ? DEFAULT_PLAYER_CHARACTER_ID : DEFAULT_ENEMY_CHARACTER_ID
    ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 168" className="h-full w-full overflow-visible select-none">
        <Body accentHex={accentHex} isDead={false} stroke={SPRITE_STROKE} />
      </svg>
    </div>
  );
}
