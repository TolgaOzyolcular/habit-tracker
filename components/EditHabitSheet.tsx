'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { DAY_NAMES, type DayName, type Habit } from '@/lib/types';

interface EditHabitSheetProps {
  habit: Habit;
  onSave: (changes: {
    name: string;
    frequency: DayName[];
    timesPerWeek?: number;
    createdAt: string;
    expiryDate: string;
  }) => void;
  onClose: () => void;
}

type ScheduleMode = 'days' | 'times';

const DAY_PRESETS: { label: string; days: DayName[] }[] = [
  { label: 'Every day', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { label: 'Weekdays', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { label: 'Weekends', days: ['Sat', 'Sun'] },
];

export function EditHabitSheet({ habit, onSave, onClose }: EditHabitSheetProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(habit.name);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(
    typeof habit.timesPerWeek === 'number' ? 'times' : 'days'
  );
  const [selectedDays, setSelectedDays] = useState<Set<DayName>>(
    new Set(habit.frequency.length > 0 ? habit.frequency : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  );
  const [timesPerWeek, setTimesPerWeek] = useState(habit.timesPerWeek ?? 3);
  const [startDate, setStartDate] = useState(habit.createdAt);
  const [expiryDate, setExpiryDate] = useState(habit.expiryDate);
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
    setTimesPerWeek(typeof habit.timesPerWeek === 'number' ? habit.timesPerWeek : 3);
    setError('');
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter a habit name.'); return; }
    if (!startDate) { setError('Please set a start date.'); return; }
    if (!expiryDate) { setError('Please set an end date.'); return; }
    if (expiryDate <= startDate) { setError('End date must be after the start date.'); return; }

    if (scheduleMode === 'times') {
      onSave({ name: trimmed, frequency: [], timesPerWeek, createdAt: startDate, expiryDate });
    } else {
      onSave({ name: trimmed, frequency: Array.from(selectedDays), createdAt: startDate, expiryDate });
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
          <h2 className="text-lg font-semibold text-gray-900">Edit Habit</h2>
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
              className="w-full px-4 min-h-[48px] rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setError(''); }}
                className="w-full px-4 min-h-[48px] rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => { setExpiryDate(e.target.value); setError(''); }}
                className="w-full px-4 min-h-[48px] rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full min-h-[52px] bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold rounded-xl text-base transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
