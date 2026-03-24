'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Habit, type DayName, type HabitsStore } from '@/lib/types';
import { generateId, isHabitArchived } from '@/lib/habitUtils';
import { getTodayStr } from '@/lib/dateUtils';

const STORAGE_KEY = 'habit-tracker';

function loadFromStorage(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw) as HabitsStore;
    return Array.isArray(store.habits) ? store.habits : [];
  } catch {
    return [];
  }
}

function saveToStorage(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  const store: HabitsStore = { habits };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export interface AddHabitInput {
  name: string;
  frequency: DayName[];
  expiryDate: string;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const today = getTodayStr();

  useEffect(() => {
    setHabits(loadFromStorage());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Habit[]) => {
    setHabits(next);
    saveToStorage(next);
  }, []);

  const addHabit = useCallback(
    (input: AddHabitInput) => {
      const newHabit: Habit = {
        id: generateId(),
        name: input.name,
        frequency: input.frequency,
        createdAt: today,
        expiryDate: input.expiryDate,
        checkIns: [],
      };
      persist([...habits, newHabit]);
    },
    [habits, persist, today]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      persist(habits.filter((h) => h.id !== id));
    },
    [habits, persist]
  );

  const toggleCheckIn = useCallback(
    (habitId: string, dateStr: string) => {
      persist(
        habits.map((h) => {
          if (h.id !== habitId) return h;
          const checked = h.checkIns.includes(dateStr);
          return {
            ...h,
            checkIns: checked
              ? h.checkIns.filter((d) => d !== dateStr)
              : [...h.checkIns, dateStr],
          };
        })
      );
    },
    [habits, persist]
  );

  const activeHabits = habits.filter((h) => !isHabitArchived(h, today));
  const archivedHabits = habits.filter((h) => isHabitArchived(h, today));

  return {
    habits,
    activeHabits,
    archivedHabits,
    hydrated,
    addHabit,
    deleteHabit,
    toggleCheckIn,
  };
}
