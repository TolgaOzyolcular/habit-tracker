'use client';

import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { SummaryBanner } from './SummaryBanner';
import { HabitCard } from './HabitCard';
import { AddHabitSheet } from './AddHabitSheet';
import { SyncPanel } from './SyncPanel';
import { isOnTrack, hasScheduledHabitToday } from '@/lib/habitUtils';
import { getTodayStr, getWeekLabel } from '@/lib/dateUtils';

export function HabitTrackerApp() {
  const {
    activeHabits,
    archivedHabits,
    hydrated,
    syncCode,
    syncing,
    addHabit,
    deleteHabit,
    toggleCheckIn,
    changeSyncCode,
  } = useHabits();
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const today = getTodayStr();
  const onTrackCount = activeHabits.filter((h) => isOnTrack(h, today)).length;
  const isRestDay = activeHabits.length > 0 && !hasScheduledHabitToday(activeHabits, today);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-28">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Habits</h1>

        {/* Summary banner */}
        <SummaryBanner
          total={activeHabits.length}
          onTrack={onTrackCount}
          isRestDay={isRestDay}
        />

        {/* Week navigation */}
        <div className="flex items-center justify-between py-3 mb-1">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-medium text-gray-700 select-none">
            {getWeekLabel(weekOffset)}
          </span>

          {weekOffset < 0 ? (
            <button
              onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight size={20} />
            </button>
          ) : (
            <div className="min-w-[44px]" aria-hidden="true" />
          )}
        </div>

        {/* Active habits */}
        {activeHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <Plus size={28} className="text-indigo-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg mb-1">No habits yet</p>
            <p className="text-gray-400 text-sm">Tap the + button to add your first habit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                weekOffset={weekOffset}
                today={today}
                onToggle={toggleCheckIn}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}

        {/* Sync panel */}
        <SyncPanel
          syncCode={syncCode}
          syncing={syncing}
          onChangeSyncCode={changeSyncCode}
        />

        {/* Archived section */}
        {archivedHabits.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowArchived((s) => !s)}
              className="flex items-center gap-2 w-full min-h-[44px] py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${showArchived ? 'rotate-180' : ''}`}
              />
              Archived ({archivedHabits.length})
            </button>

            {showArchived && (
              <div className="space-y-3 mt-2">
                {archivedHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    weekOffset={weekOffset}
                    today={today}
                    onToggle={toggleCheckIn}
                    onDelete={deleteHabit}
                    isArchived
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition-all active:scale-95 z-30"
        aria-label="Add new habit"
      >
        <Plus size={24} />
      </button>

      {/* Add habit bottom sheet */}
      {showAddSheet && (
        <AddHabitSheet
          onAdd={(input) => {
            addHabit(input);
          }}
          onClose={() => setShowAddSheet(false)}
        />
      )}
    </div>
  );
}
