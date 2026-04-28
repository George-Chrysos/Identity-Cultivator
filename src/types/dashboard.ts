export type SectorId =
  | 'finance'
  | 'selfCare'
  | 'home'
  | 'motorcycle';

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
}

export interface DashboardTask {
  id: string;
  quadrant: QuadrantKey;
  text: string;
  done: boolean;
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

export type MysticSectorId = 'energySense' | 'grounding' | 'alignment' | 'synchronicities';

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

export interface TricksterSlice {
  absurdMission: string;
  dailyQuirk: string;
  /** Room for whatever else you want to track in this lens. */
  foolsFootnote: string;
}

export interface DashboardStateShape {
  identity: DashboardIdentity;
  scores: Record<SectorId, number>; // 0..100 — Sovereign life sectors
  mainQuest: string;
  tasks: DashboardTask[];
  upgrades: DashboardUpgrade[];
  updatedAt: number; // ms timestamp; drives sync conflict resolution

  activeCenter: CenterKey;
  mysticScores: Record<MysticSectorId, number>;
  mystic: MysticSlice;
  trickster: TricksterSlice;
}
