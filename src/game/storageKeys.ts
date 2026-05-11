export const STORAGE = {
  coins: 'hitbow_coins',
  playerName: 'hitbow_player_name',
  playerXp: 'hitbow_player_xp',
  /** User dismissed the in-match how-to panel (local only). */
  matchOnboardingDismissed: 'hitbow_match_onboarding_dismissed',
  ownedShop: 'hitbow_owned_shop',
  equippedSkin: 'hitbow_equipped_skin',
  equippedCharacter: 'hitbow_equipped_character',
  equippedEnemyCharacter: 'hitbow_equipped_enemy_character',
  equippedWeapon: 'hitbow_equipped_weapon',
  dailyLast: 'hitbow_daily_last',
  dailyStreak: 'hitbow_daily_streak',
  settings: 'hitbow_settings',
  /** Last N match summaries for local Stats screen. */
  matchHistory: 'hitbow_match_history'
} as const;
