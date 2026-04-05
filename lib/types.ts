export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayName = (typeof DAY_NAMES)[number];

export interface Habit {
  id: string;
  name: string;
  frequency: DayName[];       // specific days; empty when timesPerWeek or cycle is set
  timesPerWeek?: number;      // 1–6: flexible X-times-per-week schedule
  cycleOn?: number;           // N days on in a repeating cycle (requires cycleOff)
  cycleOff?: number;          // M days off in a repeating cycle (min 1)
  createdAt: string;          // YYYY-MM-DD
  expiryDate: string;         // YYYY-MM-DD — extended automatically on misses
  lastCheckedDate?: string;   // YYYY-MM-DD — last date extensions were computed through
  checkIns: string[];         // YYYY-MM-DD[]
}

export interface HabitsStore {
  habits: Habit[];
}
