import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  msUntilLocalMidnight,
  todayLocalYmd,
  yesterdayLocalYmd
} from '../game/dateUtils';
import { setAudioLevels } from '../game/gameAudio';
import { syncGameMusic } from '../game/gameMusic';
import {
  coerceHitBowDifficulty,
  type HitBowDifficulty
} from '../game/difficulty';
import type { MatchRewardResult, MatchResult } from '../game/matchResult';
import { SHOP_CATALOG } from '../game/shopCatalog';
import { STORAGE } from '../game/storageKeys';
import type { CharacterId } from '../game/charactersCatalog';
import {
  DEFAULT_ENEMY_CHARACTER_ID,
  DEFAULT_PLAYER_CHARACTER_ID,
  CHARACTER_IDS
} from '../game/charactersCatalog';
import {
  DEFAULT_WEAPON_ID,
  PLAYABLE_WEAPON_PRESETS
} from '../game/weaponsCatalog';

export type HitBowSettings = {
  masterVolume: number;
  sfxVolume: number;
  reduceMotion: boolean;
  defaultAimSensitivity: number;
  musicEnabled: boolean;
  musicVolume: number;
  /** Standard match AI tuning (wind spread, aim error, enemy weapon). */
  difficulty: HitBowDifficulty;
};

const DEFAULT_SETTINGS: HitBowSettings = {
  masterVolume: 1,
  sfxVolume: 1,
  reduceMotion: false,
  defaultAimSensitivity: 1,
  musicEnabled: false,
  musicVolume: 0.35,
  difficulty: 'standard'
};

const PLAYABLE_WEAPON_IDS = new Set(
  PLAYABLE_WEAPON_PRESETS.map((w) => w.id)
);

const INITIAL_COINS = 12450;
const DEFAULT_PLAYER_NAME = 'GUEST_7734';
const XP_PER_RANK = 600;

function rankFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_RANK) + 1);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isCharacterId(id: string): id is CharacterId {
  return (CHARACTER_IDS as readonly string[]).includes(id);
}

function readCharacter(storageKey: string, fallback: CharacterId): CharacterId {
  const v = readJson<string | null>(storageKey, null);
  if (v && isCharacterId(v)) return v;
  return fallback;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function clampAimSensitivity(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.defaultAimSensitivity;
  return Math.min(1.6, Math.max(0.6, n));
}

function sanitizeSettings(partial: Partial<HitBowSettings>): HitBowSettings {
  return {
    masterVolume: clamp01(
      partial.masterVolume ?? DEFAULT_SETTINGS.masterVolume
    ),
    sfxVolume: clamp01(partial.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
    reduceMotion:
      typeof partial.reduceMotion === 'boolean'
        ? partial.reduceMotion
        : DEFAULT_SETTINGS.reduceMotion,
    defaultAimSensitivity: clampAimSensitivity(
      partial.defaultAimSensitivity ??
        DEFAULT_SETTINGS.defaultAimSensitivity
    ),
    musicEnabled:
      typeof partial.musicEnabled === 'boolean'
        ? partial.musicEnabled
        : DEFAULT_SETTINGS.musicEnabled,
    musicVolume: clamp01(
      partial.musicVolume ?? DEFAULT_SETTINGS.musicVolume
    ),
    difficulty: coerceHitBowDifficulty(
      partial.difficulty ?? DEFAULT_SETTINGS.difficulty
    )
  };
}

function readFiniteInt(
  key: string,
  fallback: number,
  min: number,
  max: number
): number {
  const v = readJson<unknown>(key, null);
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string'
        ? Number(v)
        : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function sanitizePlayerName(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_PLAYER_NAME;
  const t = raw.trim().slice(0, 24);
  return t || DEFAULT_PLAYER_NAME;
}

function sanitizeEquippedWeaponId(id: unknown): string {
  return typeof id === 'string' && PLAYABLE_WEAPON_IDS.has(id)
    ? id
    : DEFAULT_WEAPON_ID;
}

type HitBowProgressValue = {
  playerName: string;
  playerXp: number;
  playerRank: number;
  coins: number;
  ownedShopItemIds: string[];
  equippedSkinId: string | null;
  /** Sticker fighters (concept sheet roster). */
  equippedCharacterId: CharacterId;
  equippedEnemyCharacterId: CharacterId;
  equippedWeaponId: string;
  playerAccentHex: string;
  settings: HitBowSettings;
  lastClaimDate: string | null;
  streak: number;
  canClaimDaily: boolean;
  msToNextDaily: number;
  purchaseItem: (id: string) => boolean;
  equipItem: (id: string) => void;
  setEquippedCharacterId: (id: CharacterId) => void;
  setEquippedEnemyCharacterId: (id: CharacterId) => void;
  setEquippedWeaponId: (id: string) => void;
  claimDailyReward: () => { coins: number; streak: number } | null;
  applyMatchRewards: (result: MatchResult) => MatchRewardResult;
  updateSettings: (partial: Partial<HitBowSettings>) => void;
  updatePlayerName: (name: string) => void;
  resetProgress: () => void;
};

const HitBowProgressContext = createContext<HitBowProgressValue | null>(null);

export function HitBowProgressProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [playerName, setPlayerName] = useState(DEFAULT_PLAYER_NAME);
  const [playerXp, setPlayerXp] = useState(0);
  const [coins, setCoins] = useState(INITIAL_COINS);
  const [ownedShopItemIds, setOwnedShopItemIds] = useState<string[]>([]);
  const [equippedSkinId, setEquippedSkinId] = useState<string | null>(null);
  const [equippedCharacterId, setEquippedCharacterId] =
    useState<CharacterId>(DEFAULT_PLAYER_CHARACTER_ID);
  const [equippedEnemyCharacterId, setEquippedEnemyCharacterId] =
    useState<CharacterId>(DEFAULT_ENEMY_CHARACTER_ID);
  const [equippedWeaponId, setEquippedWeaponIdState] =
    useState<string>(DEFAULT_WEAPON_ID);
  const [settings, setSettings] = useState<HitBowSettings>(DEFAULT_SETTINGS);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPlayerName(sanitizePlayerName(readJson(STORAGE.playerName, null)));
    setPlayerXp(readFiniteInt(STORAGE.playerXp, 0, 0, 9_999_999));
    setCoins(readFiniteInt(STORAGE.coins, INITIAL_COINS, 0, 99_999_999));
    setOwnedShopItemIds(readJson<string[]>(STORAGE.ownedShop, []));
    setEquippedSkinId(readJson<string | null>(STORAGE.equippedSkin, null));
    setEquippedCharacterId(
      readCharacter(STORAGE.equippedCharacter, DEFAULT_PLAYER_CHARACTER_ID)
    );
    setEquippedEnemyCharacterId(
      readCharacter(STORAGE.equippedEnemyCharacter, DEFAULT_ENEMY_CHARACTER_ID)
    );
    setEquippedWeaponIdState(
      sanitizeEquippedWeaponId(readJson(STORAGE.equippedWeapon, null))
    );
    const merged = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      ...readJson<Partial<HitBowSettings>>(STORAGE.settings, {})
    });
    setSettings(merged);
    setAudioLevels({
      master: merged.masterVolume,
      sfx: merged.sfxVolume
    });
    syncGameMusic({
      enabled: merged.musicEnabled,
      musicVolume: merged.musicVolume,
      masterVolume: merged.masterVolume
    });
    setLastClaimDate(readJson<string | null>(STORAGE.dailyLast, null));
    setStreak(readJson<number>(STORAGE.dailyStreak, 0));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.playerName, JSON.stringify(playerName));
  }, [playerName, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.playerXp, JSON.stringify(playerXp));
  }, [playerXp, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.coins, JSON.stringify(coins));
  }, [coins, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.ownedShop, JSON.stringify(ownedShopItemIds));
  }, [ownedShopItemIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.equippedSkin, JSON.stringify(equippedSkinId));
  }, [equippedSkinId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE.equippedCharacter,
      JSON.stringify(equippedCharacterId)
    );
  }, [equippedCharacterId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE.equippedEnemyCharacter,
      JSON.stringify(equippedEnemyCharacterId)
    );
  }, [equippedEnemyCharacterId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.equippedWeapon, JSON.stringify(equippedWeaponId));
  }, [equippedWeaponId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.settings, JSON.stringify(settings));
    setAudioLevels({
      master: settings.masterVolume,
      sfx: settings.sfxVolume
    });
    syncGameMusic({
      enabled: settings.musicEnabled,
      musicVolume: settings.musicVolume,
      masterVolume: settings.masterVolume
    });
  }, [settings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.dailyLast, JSON.stringify(lastClaimDate));
  }, [lastClaimDate, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE.dailyStreak, JSON.stringify(streak));
  }, [streak, hydrated]);

  const playerAccentHex = useMemo(() => {
    if (!equippedSkinId) return SHOP_CATALOG[0]?.accentHex ?? '#00f0ff';
    const item = SHOP_CATALOG.find((x) => x.id === equippedSkinId);
    return item?.accentHex ?? SHOP_CATALOG[0]?.accentHex ?? '#00f0ff';
  }, [equippedSkinId]);

  const today = todayLocalYmd();
  const canClaimDaily = lastClaimDate !== today;
  const playerRank = rankFromXp(playerXp);

  const purchaseItem = useCallback(
    (id: string): boolean => {
      const item = SHOP_CATALOG.find((x) => x.id === id);
      if (!item || ownedShopItemIds.includes(id)) return false;
      if (coins < item.price) return false;
      setCoins((c) => c - item.price);
      setOwnedShopItemIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
      setEquippedSkinId(id);
      return true;
    },
    [coins, ownedShopItemIds]
  );

  const equipItem = useCallback((id: string) => {
    if (!ownedShopItemIds.includes(id)) return;
    setEquippedSkinId(id);
  }, [ownedShopItemIds]);

  const setEquippedCharacterIdPersist = useCallback((id: CharacterId) => {
    setEquippedCharacterId(id);
  }, []);

  const setEquippedEnemyCharacterIdPersist = useCallback((id: CharacterId) => {
    setEquippedEnemyCharacterId(id);
  }, []);

  const setEquippedWeaponIdPersist = useCallback((id: string) => {
    setEquippedWeaponIdState(id);
  }, []);

  const claimDailyReward = useCallback((): {
    coins: number;
    streak: number;
  } | null => {
    const t = todayLocalYmd();
    if (lastClaimDate === t) return null;

    let nextStreak = 1;
    if (lastClaimDate === yesterdayLocalYmd()) {
      nextStreak = streak + 1;
    } else if (lastClaimDate) {
      nextStreak = 1;
    }

    const base = 150;
    const bonus = Math.min(nextStreak, 14) * 25;
    const grant = base + bonus;

    setCoins((c) => c + grant);
    setLastClaimDate(t);
    setStreak(nextStreak);
    return { coins: grant, streak: nextStreak };
  }, [lastClaimDate, streak]);

  const applyMatchRewards = useCallback(
    (result: MatchResult): MatchRewardResult => {
      const win = result.winner === 'player';
      const accuracyBonus = Math.round(result.player.accuracy * 0.5);
      const coinsAwarded =
        (result.mode === 'practice'
          ? win
            ? 40
            : 20
          : win
            ? 180
            : 70) + accuracyBonus;
      const xpAwarded =
        (result.mode === 'practice'
          ? win
            ? 70
            : 35
          : win
            ? 220
            : 110) + Math.round(result.player.damage * 0.08);
      const previousPlayerXp = playerXp;
      const nextXp = previousPlayerXp + xpAwarded;
      setCoins((c) => c + coinsAwarded);
      setPlayerXp(nextXp);
      return {
        coinsAwarded,
        xpAwarded,
        newRank: rankFromXp(nextXp),
        newPlayerXp: nextXp,
        previousPlayerXp
      };
    },
    [playerXp]
  );

  const updateSettings = useCallback((partial: Partial<HitBowSettings>) => {
    setSettings((s) => sanitizeSettings({ ...s, ...partial }));
  }, []);

  const updatePlayerName = useCallback((name: string) => {
    const t = name.trim();
    if (!t) return;
    setPlayerName(t.slice(0, 24));
  }, []);

  const resetProgress = useCallback(() => {
    Object.values(STORAGE).forEach((k) => localStorage.removeItem(k));
    setPlayerName(DEFAULT_PLAYER_NAME);
    setPlayerXp(0);
    setCoins(INITIAL_COINS);
    setOwnedShopItemIds([]);
    setEquippedSkinId(null);
    setEquippedCharacterId(DEFAULT_PLAYER_CHARACTER_ID);
    setEquippedEnemyCharacterId(DEFAULT_ENEMY_CHARACTER_ID);
    setEquippedWeaponIdState(DEFAULT_WEAPON_ID);
    setSettings(DEFAULT_SETTINGS);
    setLastClaimDate(null);
    setStreak(0);
    setAudioLevels({ master: 1, sfx: 1 });
    syncGameMusic({
      enabled: DEFAULT_SETTINGS.musicEnabled,
      musicVolume: DEFAULT_SETTINGS.musicVolume,
      masterVolume: DEFAULT_SETTINGS.masterVolume
    });
  }, []);

  const value = useMemo(
    (): HitBowProgressValue => ({
      playerName,
      playerXp,
      playerRank,
      coins,
      ownedShopItemIds,
      equippedSkinId,
      equippedCharacterId,
      equippedEnemyCharacterId,
      equippedWeaponId,
      playerAccentHex,
      settings,
      lastClaimDate,
      streak,
      canClaimDaily,
      msToNextDaily: canClaimDaily ? 0 : msUntilLocalMidnight(),
      purchaseItem,
      equipItem,
      setEquippedCharacterId: setEquippedCharacterIdPersist,
      setEquippedEnemyCharacterId: setEquippedEnemyCharacterIdPersist,
      setEquippedWeaponId: setEquippedWeaponIdPersist,
      claimDailyReward,
      applyMatchRewards,
      updateSettings,
      updatePlayerName,
      resetProgress
    }),
    [
      playerName,
      playerXp,
      playerRank,
      coins,
      ownedShopItemIds,
      equippedSkinId,
      equippedCharacterId,
      equippedEnemyCharacterId,
      equippedWeaponId,
      playerAccentHex,
      settings,
      lastClaimDate,
      streak,
      canClaimDaily,
      purchaseItem,
      equipItem,
      setEquippedCharacterIdPersist,
      setEquippedEnemyCharacterIdPersist,
      setEquippedWeaponIdPersist,
      claimDailyReward,
      applyMatchRewards,
      updateSettings,
      updatePlayerName,
      resetProgress
    ]
  );

  return (
    <HitBowProgressContext.Provider value={value}>
      {children}
    </HitBowProgressContext.Provider>
  );
}

// Hook is intentionally co-located with the provider for this small app.
// eslint-disable-next-line react-refresh/only-export-components -- allow hook export
export function useHitBowProgress(): HitBowProgressValue {
  const ctx = useContext(HitBowProgressContext);
  if (!ctx) {
    throw new Error(
      'useHitBowProgress must be used within HitBowProgressProvider'
    );
  }
  return ctx;
}
