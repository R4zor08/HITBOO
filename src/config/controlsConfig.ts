/**
 * Default keyboard layout for local 2P (single keyboard).
 * Remapping UI can map these to `code` values later for non-QWERTY layouts.
 */
export const LOCAL2P_DEFAULT_KEYS = {
  p1: {
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    jump: 'KeyW',
    charge: 'KeyF'
  },
  p2: {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    jump: 'ArrowUp',
    charge: 'KeyL'
  }
} as const;

/**
 * Standard Gamepad layout (https://w3c.github.io/gamepad/#remapping).
 * Player 1 uses `navigator.getGamepads()[0]`, player 2 uses index 1.
 */
export const LOCAL2P_GAMEPAD = {
  /** Left stick X (move). */
  axisLeftX: 0,
  /** Left stick Y (unused for walk; horizontal move only). */
  axisLeftY: 1,
  /** Right stick X / Y (Bowmasters-style aim via synthetic pointer). */
  axisRightX: 2,
  axisRightY: 3,
  /** Face button bottom — jump. */
  buttonJump: 0,
  /** Left shoulder — cycle weapon earlier in list. */
  buttonWeaponPrev: 4,
  /** Right shoulder — cycle weapon later in list. */
  buttonWeaponNext: 5,
  /** Right trigger — hold to arm, release to fire (when aim power is enough). */
  buttonFire: 7,
  /** Analog RT above this counts as pulled (see readAnalogTriggerNorm). */
  triggerPullAbove: 0.2,
  /** Release edge when RT norm is below this (hysteresis vs triggerPullAbove). */
  triggerReleaseBelow: 0.12,
  /** Linear dead zone on move stick (0–1). */
  moveDeadZone: 0.22,
  /** Circular dead zone on right stick (0–1). */
  aimDeadZone: 0.12,
  /** Max arena % deflection at full stick (same base as solo slingshot max drag). */
  aimStickMaxDeflectPct: 28
} as const;
