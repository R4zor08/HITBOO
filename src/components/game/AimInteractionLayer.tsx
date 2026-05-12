import React from 'react';

export type AimInteractionLayerProps = {
  /** When false, the layer is not mounted (HUD and menus stay clickable above). */
  active: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
};

/**
 * Full-screen pointer target for slingshot aim (below HUD z-index).
 * Uses the same client rect as the game root for percent mapping.
 */
export function AimInteractionLayer({
  active,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel
}: AimInteractionLayerProps) {
  if (!active) return null;
  return (
    <div
      className="absolute inset-0 z-[11] cursor-crosshair touch-none"
      role="application"
      aria-label="Drag from your fighter to aim, release to fire"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    />
  );
}
