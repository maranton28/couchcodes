import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { CheatCatalogManifest, UserCheatState } from '../types/cheats';
import bundledCatalog from '../assets/data/cheats_gta6.json';
import { getInitialCatalog, syncCatalogInBackground } from '../services/otaSync';

const USER_STATE_KEY = '@couchcodes:user_state_v1';

const DEFAULT_USER_STATE: UserCheatState = {
  unlockedCheatIds: ['gta6_money_250k', 'gta6_body_armor', 'gta6_cycle_weather'],
  favoriteCheatIds: ['gta6_money_250k'],
  selectedConsole: 'PS5',
  speechRate: 0.85,
  isPro: false,
  hasSeenBriefing: false,
};

interface AppContextValue {
  catalog: CheatCatalogManifest;
  userState: UserCheatState;
  proModalReason: string | null;
  openProModal: (reason: string) => void;
  closeProModal: () => void;
  toggleUnlocked: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setConsole: (platform: 'PS5' | 'XBOX') => void;
  setSpeechRate: (rate: number) => void;
  unlockPro: () => void;
  dismissBriefing: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<CheatCatalogManifest>(
    bundledCatalog as CheatCatalogManifest
  );
  const [userState, setUserState] = useState<UserCheatState>(DEFAULT_USER_STATE);
  const [proModalReason, setProModalReason] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const savedUserRaw = await AsyncStorage.getItem(USER_STATE_KEY);
      if (savedUserRaw) {
        setUserState({ ...DEFAULT_USER_STATE, ...JSON.parse(savedUserRaw) });
      }
      const localCatalog = await getInitialCatalog();
      setCatalog(localCatalog);

      const updatedCatalog = await syncCatalogInBackground(localCatalog.dataRevision);
      if (updatedCatalog) {
        setCatalog(updatedCatalog);
      }
    })();
  }, []);

  const persistUser = (next: UserCheatState) => {
    setUserState(next);
    AsyncStorage.setItem(USER_STATE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleUnlocked = (id: string) => {
    Haptics.selectionAsync();
    const exists = userState.unlockedCheatIds.includes(id);
    const unlockedCheatIds = exists
      ? userState.unlockedCheatIds.filter((item) => item !== id)
      : [...userState.unlockedCheatIds, id];
    persistUser({ ...userState, unlockedCheatIds });
  };

  const toggleFavorite = (id: string) => {
    const exists = userState.favoriteCheatIds.includes(id);
    if (!exists && !userState.isPro && userState.favoriteCheatIds.length >= 2) {
      setProModalReason('Pin up to 6 favorites to your Chaos Bar with Pro.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const favoriteCheatIds = exists
      ? userState.favoriteCheatIds.filter((item) => item !== id)
      : [...userState.favoriteCheatIds, id];
    persistUser({ ...userState, favoriteCheatIds });
  };

  const setConsole = (selectedConsole: 'PS5' | 'XBOX') => {
    Haptics.selectionAsync();
    persistUser({ ...userState, selectedConsole });
  };

  const setSpeechRate = (speechRate: number) => {
    persistUser({ ...userState, speechRate });
  };

  const unlockPro = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    persistUser({ ...userState, isPro: true });
    setProModalReason(null);
  };

  const dismissBriefing = () => {
    persistUser({ ...userState, hasSeenBriefing: true });
  };

  return (
    <AppContext.Provider
      value={{
        catalog,
        userState,
        proModalReason,
        openProModal: setProModalReason,
        closeProModal: () => setProModalReason(null),
        toggleUnlocked,
        toggleFavorite,
        setConsole,
        setSpeechRate,
        unlockPro,
        dismissBriefing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};