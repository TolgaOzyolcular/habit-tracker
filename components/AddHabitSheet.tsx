'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { DAY_NAMES, type DayName } from '@/lib/types';
import { type AddHabitInput } from '@/hooks/useHabits';
import { getTodayStr, getTomorrowStr } from '@/lib/dateUtils';

interface AddHabitSheetProps {
  onAdd: (input: AddHabitInput) => void;
  onClose: () => void;
}

type ScheduleMode = 'days' | 'times';

const DAY_PRESETS: { label: string; days: DayName[] }[] = [
  { label: 'Every day', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { label: 'Weekdays', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { label: 'Weekends', days: ['Sat', 'Sun'] },
];

export function AddHabitSheet({ onAdd, onClose }: AddHabitSheetProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('days');
  const [selectedDays, setSelectedDays] = useState<Set<DayName>>(
    new Set<DayName>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  );
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const toggleDay = (day: DayName) => {
    const next = new Set(selectedDays);
    if (next.has(day)) {
      if (next.size > 1) next.delete(day);
    } else {
      next.add(day);
    }
    setSelectedDays(next);
  };

  const matchesPreset = (days: DayName[]) => {
    if (scheduleMode !== 'days') return false;
    if (days.length !== selectedDays.size) return false;
    return days.every((d) => selectedDays.has(d));
  };

  const selectDayPreset = (days: DayName[]) => {
    setScheduleMode('days');
    setSelectedDays(new Set<DayName>(days));
    setError('');
  };

  const selectTimesPreset = () => {
    setScheduleMode('times');
    setTimesPerWeek(3);
    setError('');
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter a habit name.'); return; }
    if (!expiryDate) { setError('Please set an expiry date.'); return; }
    if (expiryDate <= getTodayStr()) { setError('Expiry date must be after today.'); return; }

    if (scheduleMode === 'times') {
      onAdd({ name: trimmed, frequency: [], timesPerWeek, expiryDate });
    } else {
      onAdd({ name: trimmed, frequency: Array.from(selectedDays), expiryDate });
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-280 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`relative bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto transition-transform duration-280 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-semibold text-gray-900">New Habit</h2>
          <button
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-10 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Morning run"
              className="w-full px-4 min-h-[48px] rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300"
              autoFocus
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Frequency</label>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {DAY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => selectDayPreset(preset.days)}
                  className={`px-3 min-h-[44px] rounded-xl text-sm font-medium border transition-colors ${
                    matchesPreset(preset.days)
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={selectTimesPreset}
                className={`px-3 min-h-[44px] rounded-xl text-sm font-medium border transition-colors ${
                  scheduleMode === 'times'
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                X / week
              </button>
            </div>

            {/* Day grid (day mode only) */}
            {scheduleMode === 'days' && (
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      selectedDays.has(day)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {day[0]}
                  </button>
                ))}
              </div>
            )}

            {/* Times-per-week stepper */}
            {scheduleMode === 'times' && (
              <div className="flex items-center gap-3 py-1">
                <button
                  onClick={() => setTimesPerWeek((v) => Math.max(1, v - 1))}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  aria-label="Decrease"
                >
                  <Minus size={16} />
                </button>
                <span className="text-2xl font-bold text-gray-900 w-8 text-center tabular-nums">
                  {timesPerWeek}
                </span>
                <button
                  onClick={() => setTimesPerWeek((v) => Math.min(6, v + 1))}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </button>
                <span className="text-sm text-gray-500">times per week</span>
              </div>
            )}
          </div>

          {/* Expiry date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              min={getTomorrowStr()}
              onChange={(e) => { setExpiryDate(e.target.value); setError(''); }}
              className="w-full px-4 min-h-[48px] rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full min-h-[52px] bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold rounded-xl text-base transition-colors"
          >
            Add Habit
          </button>
        </div>
      </div>
    </div>
  );
}
