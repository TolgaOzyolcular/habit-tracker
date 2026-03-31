import { DAY_NAMES, type Habit, type DayName } from './types';
import { formatDate, getDayName, addDays, getWeekSunday } from './dateUtils';

export function isHabitArchived(habit: Habit, today: string): boolean {
  return today > habit.expiryDate;
}

export function isScheduledOnDay(habit: Habit, dateStr: string): boolean {
  // Times-per-week: every day within the active period is a valid check-in day
  if (typeof habit.timesPerWeek === 'number') return true;
  return habit.frequency.includes(getDayName(dateStr));
}

export function isCheckedIn(habit: Habit, dateStr: string): boolean {
  return habit.checkIns.includes(dateStr);
}

/** Can the user toggle a check-in for this day? */
export function canToggle(habit: Habit, dateStr: string, today: string): boolean {
  if (dateStr > today) return false;
  if (dateStr < habit.createdAt) return false;
  if (dateStr > habit.expiryDate) return false;
  return isScheduledOnDay(habit, dateStr);
}

// ── On-track logic ────────────────────────────────────────────────────────────

/**
 * Day-based schedules: off track as soon as any required day in the past has
 * no check-in (grace: today is excluded from the check).
 */
function isOnTrackDayBased(habit: Habit, today: string): boolean {
  // Find the most recent check-in on a required day before today.
  // Anything before that is already "recovered from" — we only care about
  // whether there are any missed required days between that check-in and today.
  const lastRequiredCheckIn = habit.checkIns
    .filter(
      (d) =>
        d < today &&
        d >= habit.createdAt &&
        d <= habit.expiryDate &&
        habit.frequency.includes(getDayName(d))
    )
    .sort()
    .at(-1); // most recent

  const scanStart = lastRequiredCheckIn
    ? addDays(lastRequiredCheckIn, 1)
    : habit.createdAt;

  const current = new Date(scanStart + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const expiryDate = new Date(habit.expiryDate + 'T00:00:00');
  const endDate = todayDate < expiryDate ? todayDate : expiryDate;

  while (current <= endDate) {
    const dateStr = formatDate(current);
    if (
      habit.frequency.includes(DAY_NAMES[current.getDay()]) &&
      dateStr !== today &&
      !habit.checkIns.includes(dateStr)
    ) {
      return false;
    }
    current.setDate(current.getDate() + 1);
  }
  return true;
}

/**
 * Times-per-week: off track when days remaining in the current week (including
 * today) are fewer than the completions still needed to hit the weekly target.
 * Week runs Sunday–Saturday.
 */
function isOnTrackTimesPerWeek(habit: Habit, today: string): boolean {
  const timesPerWeek = habit.timesPerWeek!;
  const dayOfWeek = new Date(today + 'T00:00:00').getDay(); // 0=Sun … 6=Sat

  const weekSunday = getWeekSunday(today);
  const weekSaturday = addDays(weekSunday, 6);

  const effectiveStart = weekSunday > habit.createdAt ? weekSunday : habit.createdAt;
  const effectiveEnd = weekSaturday < habit.expiryDate ? weekSaturday : habit.expiryDate;

  const completionsThisWeek = habit.checkIns.filter(
    (d) => d >= effectiveStart && d <= today && d <= effectiveEnd
  ).length;

  const stillNeeded = Math.max(0, timesPerWeek - completionsThisWeek);
  const daysRemaining = 7 - dayOfWeek; // inclusive of today (Sun=7, Sat=1)

  return daysRemaining >= stillNeeded;
}

export function isOnTrack(habit: Habit, today: string): boolean {
  if (typeof habit.timesPerWeek === 'number') {
    return isOnTrackTimesPerWeek(habit, today);
  }
  return isOnTrackDayBased(habit, today);
}

// ── End-date extension ────────────────────────────────────────────────────────

/**
 * Compute how many days to add to expiryDate based on missed required
 * days/slots since the last time extensions were computed.
 *
 * Scan window: [lastCheckedDate+1 (or createdAt), yesterday (inclusive)]
 *
 * Day-based: count required days in the window that have no check-in.
 * Times-per-week: count unmet slots in each complete Sunday–Saturday week
 *   whose Saturday falls within the window.
 */
export function computeExtensions(
  habit: Habit,
  today: string
): { daysToExtend: number; newLastCheckedDate: string } {
  const yesterday = addDays(today, -1);
  const startScan = habit.lastCheckedDate
    ? addDays(habit.lastCheckedDate, 1)
    : habit.createdAt;

  // Nothing to scan yet
  if (startScan > yesterday) {
    return {
      daysToExtend: 0,
      newLastCheckedDate: habit.lastCheckedDate ?? yesterday,
    };
  }

  if (typeof habit.timesPerWeek === 'number') {
    return computeExtensionsTimesPerWeek(habit, startScan, yesterday);
  }
  return computeExtensionsDayBased(habit, startScan, yesterday);
}

function computeExtensionsDayBased(
  habit: Habit,
  startScan: string,
  yesterday: string
): { daysToExtend: number; newLastCheckedDate: string } {
  let daysToExtend = 0;
  const current = new Date(startScan + 'T00:00:00');
  const end = new Date(yesterday + 'T00:00:00');

  while (current <= end) {
    const dateStr = formatDate(current);
    if (
      dateStr >= habit.createdAt &&
      dateStr <= habit.expiryDate &&
      habit.frequency.includes(getDayName(dateStr)) &&
      !habit.checkIns.includes(dateStr)
    ) {
      daysToExtend++;
    }
    current.setDate(current.getDate() + 1);
  }

  return { daysToExtend, newLastCheckedDate: yesterday };
}

function computeExtensionsTimesPerWeek(
  habit: Habit,
  startScan: string,
  yesterday: string
): { daysToExtend: number; newLastCheckedDate: string } {
  const timesPerWeek = habit.timesPerWeek!;
  let daysToExtend = 0;
  let newLastCheckedDate = habit.lastCheckedDate ?? yesterday;

  let weekSunday = getWeekSunday(startScan);

  while (true) {
    const weekSaturday = addDays(weekSunday, 6);
    // Only process weeks whose Saturday has fully passed
    if (weekSaturday > yesterday) break;

    const effectiveStart =
      weekSunday > habit.createdAt ? weekSunday : habit.createdAt;
    const effectiveEnd =
      weekSaturday < habit.expiryDate ? weekSaturday : habit.expiryDate;

    if (effectiveStart <= effectiveEnd) {
      const completions = habit.checkIns.filter(
        (d) => d >= effectiveStart && d <= effectiveEnd
      ).length;
      daysToExtend += Math.max(0, timesPerWeek - completions);
    }

    newLastCheckedDate = weekSaturday;
    weekSunday = addDays(weekSaturday, 1);
  }

  return { daysToExtend, newLastCheckedDate };
}

/**
 * Apply missed-day extensions to all non-archived habits.
 * Returns the updated habit array and a flag indicating whether anything changed.
 */
export function applyHabitExtensions(
  habits: Habit[],
  today: string
): { habits: Habit[]; changed: boolean } {
  let changed = false;
  const updated = habits.map((habit) => {
    if (isHabitArchived(habit, today)) return habit;
    const { daysToExtend, newLastCheckedDate } = computeExtensions(habit, today);
    const sameDate = newLastCheckedDate === (habit.lastCheckedDate ?? '');
    if (daysToExtend === 0 && sameDate) return habit;
    changed = true;
    return {
      ...habit,
      expiryDate:
        daysToExtend > 0 ? addDays(habit.expiryDate, daysToExtend) : habit.expiryDate,
      lastCheckedDate: newLastCheckedDate,
    };
  });
  return { habits: updated, changed };
}

// ── Display helpers ───────────────────────────────────────────────────────────

export function getFrequencyLabel(habit: Habit): string {
  if (typeof habit.timesPerWeek === 'number') {
    return `${habit.timesPerWeek}× per week`;
  }
  const sorted = [...habit.frequency].sort(
    (a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b)
  );
  const str = JSON.stringify(sorted);
  if (str === JSON.stringify(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']))
    return 'Every day';
  if (str === JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])) return 'Weekdays';
  if (str === JSON.stringify(['Sun', 'Sat'])) return 'Weekends';
  return sorted.join(', ');
}

export function hasScheduledHabitToday(habits: Habit[], today: string): boolean {
  return habits.some(
    (h) => !isHabitArchived(h, today) && isScheduledOnDay(h, today)
  );
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
