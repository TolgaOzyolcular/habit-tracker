export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayName = (typeof DAY_NAMES)[number];

export interface Habit {
  id: string;
  name: string;
  frequency: DayName[];
  createdAt: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  checkIns: string[]; // YYYY-MM-DD[]
}

export interface HabitsStore {
  habits: Habit[];
}
