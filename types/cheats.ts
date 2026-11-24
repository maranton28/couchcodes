export type DPadDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type CheatCategory =
  | 'PLAYER'
  | 'COMBAT'
  | 'VEHICLES'
  | 'ENVIRONMENT'
  | 'FILTERS';

export type VerificationStatus = 'VERIFIED' | 'UNCONFIRMED';

export interface UnlockRequirement {
  type: 'STORY_COMPLETE' | 'CHALLENGE_COUNT' | 'DISCOVER_ITEM' | 'ALL_CHALLENGES';
  summary: string;
  targetCount?: number;
  menuLocation?: string;
}

export interface CheatEntry {
  id: string;
  title: string;
  description: string;
  category: CheatCategory;
  status: VerificationStatus;
  sequence: DPadDirection[];
  unlockRequirement: UnlockRequirement;
  isFreeTier: boolean;
  updatedAt: string;
}

export interface CheatCatalogManifest {
  schemaVersion: number;
  dataRevision: number;
  publishedAt: string;
  gameTitle: 'GTA VI';
  activationInstructions: {
    ps5: string;
    xbox: string;
  };
  totalExpectedCheats: number;
  cheats: CheatEntry[];
}

export interface UserCheatState {
  unlockedCheatIds: string[];
  favoriteCheatIds: string[];
  selectedConsole: 'PS5' | 'XBOX';
  speechRate: number;
  isPro: boolean;
  hasSeenBriefing: boolean;
}