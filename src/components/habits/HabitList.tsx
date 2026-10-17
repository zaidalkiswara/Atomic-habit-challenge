import React, { useState } from 'react';
import { Plus, Sparkles, Filter, RefreshCw, TrendingUp } from 'lucide-react';
import { Habit, HabitLog, HabitStreakInfo } from '../../types';
import { HabitRow } from './HabitRow';
import { getTodayDateString, getRecentDateRange, formatReadableDate } from '../../utils/date';

interface HabitListProps {
  habits: Habit[];
  logsMap: Map<string, HabitLog>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleHabit: (habitId: string, date: string) => void;
  onToggleTwoMinute: (habitId: string, date: string) => void;
  onOpenNewHabitModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  getStreakInfo: (habitId: string) => HabitStreakInfo;
  onViewTrends?: () => void;
  onRestoreStarterHabits?: () => void;
}

const CATEGORIES = [
  'All',
  'Focus & Craft',
  'Health & Energy',
  'Mind & Reflection',
  'Order & Environment',
] as const;

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  logsMap,
  selectedDate,
  onSelectDate,
  onToggleHabit,
  onToggleTwoMinute,
  onOpenNewHabitModal,
  onEditHabit,
  onDeleteHabit,
  getStreakInfo,
  onViewTrends,
  onRestoreStarterHabits,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const today = getTodayDateString();
  const isToday = selectedDate === today;
  const recentDates = getRecentDateRange(7);

  // Filter habits by category
  const filteredHabits = habits.filter(
    (h) => selectedCategory === 'All' || h.category === selectedCategory
  );

  // Compute completed count for selected date
  const completedCount = habits.filter((h) => logsMap.get(`${h.id}_${selectedDate}`)?.completed).length;
  const totalCount = habits.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Date Scroller Bar & Daily Summary Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
        {/* Top Header Row: Title & Action Buttons (Aligned, Equal Height, Centered) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-0.5">
              Daily Checklist
            </div>
            <h2 className="text-base sm:text-lg font-bold font-editorial text-stone-900 leading-tight">
              Identity Habits
            </h2>
          </div>

          {/* Action Buttons (Trends & Add Habit perfectly aligned) */}
          <div className="flex items-center gap-2 shrink-0">
            {onViewTrends && (
              <button
                type="button"
                onClick={onViewTrends}
                className="h-8 sm:h-9 px-3 rounded-xl text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                title="View Long-Term Consistency Graph"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                <span>Trends</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNewHabitModal}
              className="h-8 sm:h-9 px-3.5 rounded-xl text-xs font-semibold bg-amber-900 text-amber-50 hover:bg-amber-950 transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Habit</span>
            </button>
          </div>
        </div>

        {/* Votes Cast Metric Strip - Centered & Balanced */}
        <div className="pt-3 pb-1 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="font-semibold text-stone-900 tabular-nums">
              {completedCount} of {totalCount} completed
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-500 tabular-nums">
              {percentComplete}% Votes Cast
            </span>
          </div>

          <div className="w-24 sm:w-32 h-1.5 bg-stone-100 rounded-full overflow-hidden shrink-0">
            <div
              className="h-full bg-amber-800 rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Horizontal Date Selector (Past 7 Days Carousel) */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {recentDates.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const isCurrentToday = dateStr === today;
            const dayCompleted = habits.filter(
              (h) => logsMap.get(`${h.id}_${dateStr}`)?.completed
            ).length;
            const allDone = totalCount > 0 && dayCompleted === totalCount;

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`flex-1 min-w-[72px] py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'border-amber-800 bg-amber-900 text-white shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                }`}
              >
                <span
                  className={`text-[10px] uppercase tracking-wider ${
                    isSelected ? 'text-amber-200' : 'text-stone-400'
                  }`}
                >
                  {isCurrentToday ? 'Today' : formatReadableDate(dateStr).split(',')[0]}
                </span>
                <span className="text-xs font-bold tabular-nums mt-0.5">
                  {formatReadableDate(dateStr).split(',')[1]}
                </span>
                <span
                  className={`text-[10px] mt-1 tabular-nums ${
                    isSelected
                      ? 'text-amber-200'
                      : allDone
                      ? 'text-emerald-700 font-semibold'
                      : 'text-stone-400'
                  }`}
                >
                  {dayCompleted}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Tabs (Zero-Pill Discipline: Segmented Buttons) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-amber-900 text-amber-50 font-semibold'
                : 'bg-white border border-stone-200/90 text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits List */}
      {filteredHabits.length > 0 ? (
        <div className="space-y-3">
          {filteredHabits.map((habit) => {
            const log = logsMap.get(`${habit.id}_${selectedDate}`);
            const streakInfo = getStreakInfo(habit.id);

            return (
              <HabitRow
                key={habit.id}
                habit={habit}
                log={log}
                streakInfo={streakInfo}
                selectedDate={selectedDate}
                isToday={isToday}
                onToggle={(id) => onToggleHabit(id, selectedDate)}
                onToggleTwoMinute={(id) => onToggleTwoMinute(id, selectedDate)}
                onEdit={onEditHabit}
                onDelete={onDeleteHabit}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-900 mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-amber-800" />
          </div>
          <h3 className="text-base font-bold font-editorial text-stone-900">
            {habits.length === 0 ? 'No Habits in Your System' : 'No Habits Found in This Category'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            {habits.length === 0
              ? 'Start with a single habit tied to the identity you wish to cultivate. Make it obvious, attractive, easy, and satisfying.'
              : 'Try selecting "All" or add a new habit in this category.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={onOpenNewHabitModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-900 text-amber-50 hover:bg-amber-950 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create a New Habit</span>
            </button>
            {onRestoreStarterHabits && habits.length === 0 && (
              <button
                onClick={onRestoreStarterHabits}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                <span>Restore Starter Templates</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
