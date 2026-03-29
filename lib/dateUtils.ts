import { DAY_NAMES, type DayName } from './types';

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayStr(): string {
  return formatDate(new Date());
}

/** Returns an array of 7 YYYY-MM-DD strings for Sun–Sat of the week
 *  offset by weekOffset (0 = current week, -1 = last week, etc.) */
export function getWeekDays(weekOffset: number): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return formatDate(d);
  });
}

export function getDayName(dateStr: string): DayName {
  const date = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[date.getDay()];
}

export function getWeekLabel(weekOffset: number): string {
  if (weekOffset === 0) return 'This Week';
  if (weekOffset === -1) return 'Last Week';
  const days = getWeekDays(weekOffset);
  const start = new Date(days[0] + 'T00:00:00');
  const end = new Date(days[6] + 'T00:00:00');
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

/** Returns YYYY-MM-DD for tomorrow in local time */
export function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return formatDate(d);
}
