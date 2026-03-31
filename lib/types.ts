export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayName = (typeof DAY_NAMES)[number];

export interface Habit {
  id: string;
  name: string;
  frequency: DayName[];       // specific days; empty when timesPerWeek is set
  timesPerWeek?: number;      // 1–6: flexible X-times-per-week schedule
  createdAt: string;          // YYYY-MM-DD
  expiryDate: string;         // YYYY-MM-DD — extended automatically on misses
  lastCheckedDate?: string;   // YYYY-MM-DD — last date extensions were computed through
  checkIns: string[];         // YYYY-MM-DD[]
}

export interface HabitsStore {
  habits: Habit[];
}
