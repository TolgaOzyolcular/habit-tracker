'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DAY_NAMES, type DayName, type Habit } from '@/lib/types';

interface EditHabitSheetProps {
  habit: Habit;
  onSave: (changes: { name: string; frequency: DayName[] }) => void;
  onClose: () => void;
}

const PRESETS: { label: string; days: DayName[] }[] = [
  { label: 'Every day', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { label: 'Weekdays', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { label: 'Weekends', days: ['Sat', 'Sun'] },
];

export function EditHabitSheet({ habit, onSave, onClose }: EditHabitSheetProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(habit.name);
  const [selectedDays, setSelectedDays] = useState<Set<DayName>>(new Set(habit.frequency));
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
    if (days.length !== selectedDays.size) return false;
    return days.every((d) => selectedDays.has(d));
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a habit name.');
      return;
    }
    onSave({ name: trimmed, frequency: Array.from(selectedDays) });
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
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
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
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 min-h-[48px] rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Frequency</label>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSelectedDays(new Set<DayName>(preset.days))}
                  className={`px-3 min-h-[44px] rounded-xl text-sm font-medium border transition-colors ${
                    matchesPreset(preset.days)
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom day selector */}
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
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
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
