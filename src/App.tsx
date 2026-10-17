/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { MobileTabBar } from './components/layout/Navigation';
import { TodayChallenge } from './components/curriculum/TodayChallenge';
import { CurriculumTimeline } from './components/curriculum/CurriculumTimeline';
import { HabitList } from './components/habits/HabitList';
import { HabitModal } from './components/habits/HabitModal';
import { BackupModal } from './components/settings/BackupModal';
import { OfflineBanner } from './components/common/OfflineBanner';
import { MonthlyCompletionChart } from './components/analytics/MonthlyCompletionChart';
import { useCurriculum } from './hooks/useCurriculum';
import { useHabits } from './hooks/useHabits';
import { initializeDatabase, db, STARTER_HABITS } from './db';
import { Habit } from './types';
import { getTodayDateString } from './utils/date';
import { Target, CheckSquare, Calendar, BookOpen, Quote } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'focus' | 'habits' | 'trends' | 'roadmap'>('focus');
  const [focusViewMode, setFocusViewMode] = useState<'split' | 'challenge' | 'habits'>('split');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Initialize DB
  useEffect(() => {
    initializeDatabase().catch((err) => {
      console.error('Initialization error:', err);
    });
  }, []);

  // Curriculum and Habits State
  const curriculum = useCurriculum();
  const habitsHook = useHabits(selectedDate);

  const handleDataChanged = () => {
    curriculum.refresh();
    habitsHook.refresh();
  };

  const handleOpenEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
    if (editingHabit) {
      await habitsHook.updateHabit(editingHabit.id, habitData);
    } else {
      await habitsHook.addHabit(habitData);
    }
    setEditingHabit(null);
  };

  const handleRestoreStarterHabits = async () => {
    await db.habits.bulkAdd(STARTER_HABITS);
    habitsHook.refresh();
  };

  const activeChallengeLog = curriculum.challengeLogs.get(curriculum.activeDay);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans-ui selection:bg-amber-200 selection:text-amber-950">
      {/* Top Bar Contract compliant Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewHabitModal={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* Loading state indicator */}
        {curriculum.isLoading && (
          <div className="py-20 text-center text-xs font-medium text-stone-400">
            Loading your local habit journal...
          </div>
        )}

        {!curriculum.isLoading && (
          <>
            {/* VIEW 1: Today's Focus (Distinct Part 1 & Part 2 Demarcation) */}
            {currentTab === 'focus' && (
              <div className="space-y-6">
                {/* Clean View Mode Segmented Controls for Desktop */}
                <div className="flex items-center justify-between gap-4 pb-2">
                  <div className="text-xs text-stone-500 font-medium">
                    Daily Execution Workspace
                  </div>

                  <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl text-xs font-medium">
                    <button
                      onClick={() => setFocusViewMode('split')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        focusViewMode === 'split'
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Split View
                    </button>
                    <button
                      onClick={() => setFocusViewMode('challenge')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        focusViewMode === 'challenge'
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Challenge Only
                    </button>
                    <button
                      onClick={() => setFocusViewMode('habits')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        focusViewMode === 'habits'
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Habits Only
                    </button>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-1 ${
                    focusViewMode === 'split'
                      ? 'lg:grid-cols-12 gap-8 lg:divide-x lg:divide-stone-200/90 items-start'
                      : 'max-w-4xl mx-auto'
                  }`}
                >
                  {/* Left Column: Part 1 - 30-Day Curriculum Challenge */}
                  {(focusViewMode === 'split' || focusViewMode === 'challenge') && (
                    <div
                      className={`${
                        focusViewMode === 'split' ? 'lg:col-span-7' : 'w-full'
                      } space-y-3`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-amber-900/20">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-800" />
                          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-sans-ui">
                            Part 1: Curriculum Challenge
                          </h2>
                        </div>
                        <span className="text-xs font-medium text-stone-500 tabular-nums">
                          Day {curriculum.activeDay} of 30
                        </span>
                      </div>

                      <TodayChallenge
                        challenge={curriculum.currentChallenge}
                        activeDay={curriculum.activeDay}
                        maxUnlockedDay={curriculum.maxUnlockedDay}
                        challengeLog={activeChallengeLog}
                        onSaveReflection={curriculum.saveReflection}
                        onCompleteAndUnlockNext={curriculum.completeAndUnlockNext}
                        onSelectDay={curriculum.setActiveDay}
                        onViewAllRoadmap={() => setCurrentTab('roadmap')}
                      />
                    </div>
                  )}

                  {/* Right Column: Part 2 - Daily Identity Habits Checklist */}
                  {(focusViewMode === 'split' || focusViewMode === 'habits') && (
                    <div
                      className={`${
                        focusViewMode === 'split' ? 'lg:col-span-5 lg:pl-8' : 'w-full'
                      } space-y-3`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-300">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-stone-700" />
                          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-sans-ui">
                            Part 2: Habit Checklist
                          </h2>
                        </div>
                        <span className="text-xs font-medium text-stone-500 tabular-nums">
                          {habitsHook.selectedDateStats.completed}/{habitsHook.selectedDateStats.total} Done
                        </span>
                      </div>

                      <HabitList
                        habits={habitsHook.habits}
                        logsMap={habitsHook.logsMap}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        onToggleHabit={habitsHook.toggleHabit}
                        onToggleTwoMinute={habitsHook.toggleTwoMinuteMode}
                        onOpenNewHabitModal={() => {
                          setEditingHabit(null);
                          setIsHabitModalOpen(true);
                        }}
                        onEditHabit={handleOpenEditHabit}
                        onDeleteHabit={habitsHook.deleteHabit}
                        getStreakInfo={habitsHook.getStreakInfo}
                        onViewTrends={() => setCurrentTab('trends')}
                        onRestoreStarterHabits={handleRestoreStarterHabits}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: Daily Habits Dedicated Workspace */}
            {currentTab === 'habits' && (
              <div className="max-w-4xl mx-auto">
                <HabitList
                  habits={habitsHook.habits}
                  logsMap={habitsHook.logsMap}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onToggleHabit={habitsHook.toggleHabit}
                  onToggleTwoMinute={habitsHook.toggleTwoMinuteMode}
                  onOpenNewHabitModal={() => {
                    setEditingHabit(null);
                    setIsHabitModalOpen(true);
                  }}
                  onEditHabit={handleOpenEditHabit}
                  onDeleteHabit={habitsHook.deleteHabit}
                  getStreakInfo={habitsHook.getStreakInfo}
                  onViewTrends={() => setCurrentTab('trends')}
                  onRestoreStarterHabits={handleRestoreStarterHabits}
                />
              </div>
            )}

            {/* VIEW 3: Long-term Consistency Analytics & Monthly Trends */}
            {currentTab === 'trends' && (
              <div className="max-w-4xl mx-auto">
                <MonthlyCompletionChart
                  habits={habitsHook.habits}
                  logs={habitsHook.logs}
                />
              </div>
            )}

            {/* VIEW 4: 30-Day Curriculum Roadmap */}
            {currentTab === 'roadmap' && (
              <CurriculumTimeline
                activeDay={curriculum.activeDay}
                maxUnlockedDay={curriculum.maxUnlockedDay}
                challengeLogs={curriculum.challengeLogs}
                onSelectDay={(day) => {
                  curriculum.setActiveDay(day);
                  setCurrentTab('focus');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Thumb Bar (Within 15% sticky height cap) */}
      <MobileTabBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeDay={curriculum.activeDay}
        completedHabitsCount={habitsHook.selectedDateStats.completed}
        totalHabitsCount={habitsHook.selectedDateStats.total}
      />

      {/* Offline Status Toast */}
      <OfflineBanner />

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        initialHabit={editingHabit}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
      />

      {/* Backup & Portability Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={handleDataChanged}
      />
    </div>
  );
}
