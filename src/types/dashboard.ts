export type SectorId =
  | 'finance'
  | 'selfCare'
  | 'home'
  | 'motorcycle';
export type TricksterSectorId = 'chaos' | 'play' | 'social';
export type SectorTag = SectorId | MysticSectorId | TricksterSectorId;

export type QuadrantKey = 'doNow' | 'schedule' | 'delegate' | 'eliminate';

/** Which “center” lens is active below the Main Quest. */
export type CenterKey = 'sovereign' | 'mystic' | 'trickster';

export interface DashboardIdentity {
  name: string;
  title: string;
  motto: string;
  level: number;
  currentXp: number;
  xpToNext: number;
  totalXp?: number;
}

export interface DashboardTask {
  id: string;
  quadrant: QuadrantKey;
  text: string;
  done: boolean;
  sectorTag?: SectorTag;
  completedAt?: string | null;
}

export interface MainQuestItem {
  id: string;
  sectorTag: SectorTag;
  text: string;
  completedDate: string | null;
}

export interface DashboardUpgrade {
  id: string;
  name: string;
  effort: number; // 1..5
  value: number; // 1..5
  sector: SectorId;
}

/** Single or double tarot slot (text only for now). */
export interface MysticTarotPair {
  cardA: string;
  cardB: string;
}

export type MysticSectorId = 'energySense' | 'grounding' | 'logos' | 'gratitude' | 'focus';

export type EnergyLayer = 'muscle' | 'tendon' | 'pulse' | 'subtle';
export type EnergyRadius = 'self' | 'touch' | 'nearField';
export type GratitudeCategory = 'self' | 'people' | 'nature' | 'work' | 'other';

export interface MysticWeekDay {
  name: string;
  meaning: string;
}

export interface MysticSlice {
  themeOfMonth: MysticTarotPair;
  dangerOfMonth: MysticTarotPair;
  weeksJourney: MysticWeekDay[];
  notesOfTheDay: string;
}

export interface GratitudeItem {
  id: string;
  text: string;
  category: GratitudeCategory;
}

export interface MysticDailyLog {
  date: string; // YYYY-MM-DD

  // Energy sense
  energySense: number; // 0..100
  energyLayer: EnergyLayer;
  energyRadius: EnergyRadius;

  // Grounding
  groundingPhysical: number; // 0..100
  groundingPsychological: number; // 0..100
  weightDropped: boolean;

  // Logos
  logosSet: number;
  logosDone: number;
  logosIntegrity: number; // 0..100

  // Gratitude
  gratitudeItems: GratitudeItem[];

  // Focus
  focusDurationMin: number;
  focusImageScore: number; // 0..100
  focusCountScore: number; // 0..100
  focusContextNote?: string;
}

export interface TricksterSlice {
  absurdMission: string;
  dailyQuirk: string;
  /** Room for whatever else you want to track in this lens. */
  foolsFootnote: string;
}

export type QuestType = 'main' | 'side' | 'sectorSpecialized';
export type XpEventType = 'mainQuest' | 'sideQuest' | 'sectorQuest' | 'sectorVisit' | 'log';

export interface XpLedgerEntry {
  id: string;
  at: number;
  type: XpEventType;
  sectorTag?: SectorTag;
  delta: number;
  note?: string;
}

export interface StreakState {
  current: number;
  best: number;
  lastDate: string | null;
}

export interface SectorVisitState {
  streak: StreakState;
  lastVisitedDate: string | null;
}

export interface XpPolicy {
  mainQuest: number;
  sideQuest: number;
  sectorQuest: number;
  firstSectorVisit: number;
  logReward: number;
  sectorVisitStreakStep: number;
  mainQuestStreakStep: number;
  maxStreakBonus: number;
}

export interface DashboardStateShape {
  identity: DashboardIdentity;
  scores: Record<SectorId, number>; // 0..100 — Sovereign life sectors
  mainQuests: MainQuestItem[];
  tasks: DashboardTask[];
  upgrades: DashboardUpgrade[];
  updatedAt: number; // ms timestamp; drives sync conflict resolution

  activeCenter: CenterKey;
  mysticScores: Record<MysticSectorId, number>;
  tricksterScores: Record<TricksterSectorId, number>;
  mysticDailyLogs: MysticDailyLog[];
  mystic: MysticSlice;
  trickster: TricksterSlice;
  xpLedger: XpLedgerEntry[];
  mainQuestStreak: StreakState;
  sectorVisits: Record<SectorTag, SectorVisitState>;
  lastDailyDecayCheck: string | null;
}
