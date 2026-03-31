'use client';

import { useState } from 'react';
import { Trash2, Check, Pencil } from 'lucide-react';
import { type Habit, type DayName } from '@/lib/types';
import { DAY_NAMES } from '@/lib/types';
import {
  isOnTrack,
  isScheduledOnDay,
  isCheckedIn,
  canToggle,
  getFrequencyLabel,
} from '@/lib/habitUtils';
import { getWeekDays } from '@/lib/dateUtils';
import { DeleteDialog } from './DeleteDialog';
import { EditHabitSheet } from './EditHabitSheet';

interface HabitCardProps {
  habit: Habit;
  weekOffset: number;
  today: string;
  onToggle: (habitId: string, dateStr: string) => void;
  onDelete: (habitId: string) => void;
  onUpdate: (habitId: string, changes: { name: string; frequency: DayName[]; timesPerWeek?: number; createdAt: string; expiryDate: string }) => void;
  isArchived?: boolean;
}

type ChipState = 'checked' | 'unchecked' | 'future' | 'inactive';

function getChipState(
  habit: Habit,
  dateStr: string,
  today: string
): ChipState {
  // Before habit started or not in frequency or after expiry → inactive
  if (dateStr < habit.createdAt) return 'inactive';
  if (dateStr > habit.expiryDate) return 'inactive';
  if (!isScheduledOnDay(habit, dateStr)) return 'inactive';
  if (dateStr > today) return 'future';
  return isCheckedIn(habit, dateStr) ? 'checked' : 'unchecked';
}

export function HabitCard({
  habit,
  weekOffset,
  today,
  onToggle,
  onDelete,
  onUpdate,
  isArchived = false,
}: HabitCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const weekDays = getWeekDays(weekOffset);
  const onTrack = !isArchived && isOnTrack(habit, today);

  const handleDayTap = (dateStr: string) => {
    if (isArchived) return;
    if (!canToggle(habit, dateStr, today)) return;
    onToggle(habit.id, dateStr);
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl border shadow-sm p-4 ${
          isArchived ? 'border-gray-100 opacity-75' : 'border-gray-100'
        }`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">{habit.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{getFrequencyLabel(habit)}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isArchived ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                Archived
              </span>
            ) : (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  onTrack
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {onTrack ? 'On Track' : 'Off Track'}
              </span>
            )}
            {!isArchived && (
              <button
                onClick={() => setShowEdit(true)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-300 hover:text-indigo-400 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                aria-label={`Edit ${habit.name}`}
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={() => setShowDelete(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors"
              aria-label={`Delete ${habit.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Day chips */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((dateStr, idx) => {
            const dayLetter = DAY_NAMES[idx][0];
            const isToday = dateStr === today;
            const state = getChipState(habit, dateStr, today);
            const tappable = !isArchived && state !== 'inactive' && state !== 'future';

            return (
              <button
                key={dateStr}
                onClick={() => handleDayTap(dateStr)}
                disabled={!tappable}
                aria-label={`${DAY_NAMES[idx]} ${dateStr}${state === 'checked' ? ' checked' : ''}`}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl min-h-[52px] transition-all duration-150 ${
                  tappable ? 'active:scale-95 cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Day letter */}
                <span
                  className={`text-[10px] font-semibold leading-none ${
                    isToday && state !== 'inactive'
                      ? 'text-indigo-600'
                      : state === 'inactive'
                      ? 'text-gray-300'
                      : 'text-gray-500'
                  }`}
                >
                  {dayLetter}
                </span>

                {/* State circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    state === 'checked'
                      ? 'bg-indigo-500 scale-105'
                      : state === 'unchecked'
                      ? isToday
                        ? 'border-2 border-indigo-300'
                        : 'border-2 border-gray-200'
                      : state === 'future'
                      ? 'border-2 border-gray-100'
                      : '' // inactive
                  }`}
                >
                  {state === 'checked' && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                  {state === 'inactive' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  )}
                  {state === 'future' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Expiry info for archived */}
        {isArchived && (
          <p className="text-xs text-gray-400 mt-3">
            Ended {habit.expiryDate}
          </p>
        )}
      </div>

      {showDelete && (
        <DeleteDialog
          habitName={habit.name}
          onConfirm={() => {
            onDelete(habit.id);
            setShowDelete(false);
          }}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {showEdit && (
        <EditHabitSheet
          habit={habit}
          onSave={(changes) => onUpdate(habit.id, changes)}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
