/**
 * Default keyboard layout for local 2P (single keyboard).
 * Remapping UI can map these to `code` values later for non-QWERTY layouts.
 */
export const LOCAL2P_DEFAULT_KEYS = {
  p1: {
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    jump: 'KeyW',
    charge: 'Space'
  },
  p2: {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    jump: 'ArrowUp',
    charge: 'Enter'
  }
} as const;
