import { DAY_NAMES, type Habit, type DayName } from './types';
import { formatDate, getDayName } from './dateUtils';

export function isHabitArchived(habit: Habit, today: string): boolean {
  // Expiry date is inclusive: archived only when today is strictly after expiryDate
  return today > habit.expiryDate;
}

export function isScheduledOnDay(habit: Habit, dateStr: string): boolean {
  return habit.frequency.includes(getDayName(dateStr));
}

export function isCheckedIn(habit: Habit, dateStr: string): boolean {
  return habit.checkIns.includes(dateStr);
}

/** Can the user toggle a check-in for this day? */
export function canToggle(habit: Habit, dateStr: string, today: string): boolean {
  if (dateStr > today) return false; // no future check-ins
  if (dateStr < habit.createdAt) return false; // before habit started
  if (dateStr > habit.expiryDate) return false; // after expiry
  return isScheduledOnDay(habit, dateStr);
}

/**
 * A habit is on track if every scheduled day from createdAt up to (but NOT
 * including) today has been checked in.
 * Grace rule: today is excluded from the check — being unchecked today is fine.
 */
export function isOnTrack(habit: Habit, today: string): boolean {
  const current = new Date(habit.createdAt + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const expiryDate = new Date(habit.expiryDate + 'T00:00:00');
  // Only look at days up to today (and not past expiry)
  const endDate = todayDate < expiryDate ? todayDate : expiryDate;

  while (current <= endDate) {
    const dateStr = formatDate(current);
    const dayName = DAY_NAMES[current.getDay()];

    if (habit.frequency.includes(dayName)) {
      // Grace rule: skip today
      if (dateStr !== today && !habit.checkIns.includes(dateStr)) {
        return false;
      }
    }
    current.setDate(current.getDate() + 1);
  }
  return true;
}

export function getFrequencyLabel(frequency: DayName[]): string {
  const sorted = [...frequency].sort(
    (a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b)
  );
  const str = JSON.stringify(sorted);
  if (str === JSON.stringify(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']))
    return 'Every day';
  if (str === JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])) return 'Weekdays';
  // Sun (index 0) sorts before Sat (index 6)
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
