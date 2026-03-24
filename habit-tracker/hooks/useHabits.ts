'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Habit, type DayName, type HabitsStore } from '@/lib/types';
import { generateId, isHabitArchived } from '@/lib/habitUtils';
import { getTodayStr } from '@/lib/dateUtils';

const STORAGE_KEY = 'habit-tracker';
const SYNC_CODE_KEY = 'habit-tracker-sync-code';

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadLocal(): Habit[] {
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

function saveLocal(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits }));
}

function getOrCreateSyncCode(): string {
  let code = localStorage.getItem(SYNC_CODE_KEY);
  if (!code) {
    code = generateId();
    localStorage.setItem(SYNC_CODE_KEY, code);
  }
  return code;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiFetch(code: string): Promise<Habit[] | null> {
  try {
    const res = await fetch(`/api/habits?code=${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as HabitsStore;
    return Array.isArray(data.habits) ? data.habits : null;
  } catch {
    return null;
  }
}

async function apiSave(code: string, habits: Habit[]): Promise<void> {
  try {
    await fetch(`/api/habits?code=${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habits }),
    });
  } catch {
    // silent — localStorage is the source of truth when offline
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface AddHabitInput {
  name: string;
  frequency: DayName[];
  expiryDate: string;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [syncing, setSyncing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = getTodayStr();

  // On mount: get/create sync code → try API → fall back to localStorage
  useEffect(() => {
    const code = getOrCreateSyncCode();
    setSyncCode(code);

    void apiFetch(code).then((apiHabits) => {
      if (apiHabits !== null && apiHabits.length > 0) {
        setHabits(apiHabits);
        saveLocal(apiHabits);
      } else {
        const local = loadLocal();
        setHabits(local);
        if (local.length > 0) void apiSave(code, local);
      }
      setHydrated(true);
    });
  }, []);

  // Save to localStorage immediately; debounce the API write by 600ms
  const persist = useCallback(
    (next: Habit[]) => {
      setHabits(next);
      saveLocal(next);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void apiSave(syncCode, next), 600);
    },
    [syncCode]
  );

  // Switch to a different sync code — pulls that code's data from the API
  const changeSyncCode = useCallback(async (newCode: string) => {
    setSyncing(true);
    const trimmed = newCode.trim();
    localStorage.setItem(SYNC_CODE_KEY, trimmed);
    setSyncCode(trimmed);
    const remote = await apiFetch(trimmed);
    const next = remote ?? [];
    setHabits(next);
    saveLocal(next);
    setSyncing(false);
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
    (id: string) => persist(habits.filter((h) => h.id !== id)),
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

  return {
    activeHabits: habits.filter((h) => !isHabitArchived(h, today)),
    archivedHabits: habits.filter((h) => isHabitArchived(h, today)),
    hydrated,
    syncCode,
    syncing,
    addHabit,
    deleteHabit,
    toggleCheckIn,
    changeSyncCode,
  };
}
