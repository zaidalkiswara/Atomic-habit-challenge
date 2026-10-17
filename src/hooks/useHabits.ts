import { useState, useEffect, useCallback, useMemo } from 'react';
import { db, STARTER_HABITS } from '../db';
import { Habit, HabitLog, HabitStreakInfo } from '../types';
import { getTodayDateString, getDateOffset } from '../utils/date';

export function useHabits(selectedDate: string = getTodayDateString()) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const allHabits = await db.habits.toArray();
      setHabits(allHabits.filter((h) => !h.archived));

      const allLogs = await db.habitLogs.toArray();
      setLogs(allLogs);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Map of `${habitId}_${date}` -> HabitLog
  const logsMap = useMemo(() => {
    const map = new Map<string, HabitLog>();
    logs.forEach((log) => {
      map.set(`${log.habitId}_${log.date}`, log);
    });
    return map;
  }, [logs]);

  // Toggle habit completion for a specific date
  const toggleHabit = useCallback(
    async (habitId: string, date: string = selectedDate, usedTwoMinuteVersion = false) => {
      const id = `${habitId}_${date}`;
      const existing = logsMap.get(id);

      const isCompleted = existing ? !existing.completed : true;

      const newLog: HabitLog = {
        id,
        habitId,
        date,
        completed: isCompleted,
        usedTwoMinuteVersion: isCompleted ? usedTwoMinuteVersion : false,
        updatedAt: new Date().toISOString(),
      };

      await db.habitLogs.put(newLog);
      await refresh();
    },
    [logsMap, selectedDate, refresh]
  );

  // Toggle specifically the 2-minute version flag
  const toggleTwoMinuteMode = useCallback(
    async (habitId: string, date: string = selectedDate) => {
      const id = `${habitId}_${date}`;
      const existing = logsMap.get(id);

      if (existing && existing.completed) {
        const updated: HabitLog = {
          ...existing,
          usedTwoMinuteVersion: !existing.usedTwoMinuteVersion,
          updatedAt: new Date().toISOString(),
        };
        await db.habitLogs.put(updated);
        await refresh();
      } else {
        // Mark as completed using 2-minute mode
        const newLog: HabitLog = {
          id,
          habitId,
          date,
          completed: true,
          usedTwoMinuteVersion: true,
          updatedAt: new Date().toISOString(),
        };
        await db.habitLogs.put(newLog);
        await refresh();
      }
    },
    [logsMap, selectedDate, refresh]
  );

  // Add a new habit
  const addHabit = useCallback(
    async (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        archived: false,
      };

      await db.habits.add(newHabit);
      await refresh();
      return newHabit;
    },
    [refresh]
  );

  // Update existing habit
  const updateHabit = useCallback(
    async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
      await db.habits.update(id, updates);
      await refresh();
    },
    [refresh]
  );

  // Archive / delete habit
  const deleteHabit = useCallback(
    async (id: string) => {
      // Hard delete from database and clean up associated logs
      await db.habits.delete(id);
      await db.habitLogs.where('habitId').equals(id).delete();
      await refresh();
    },
    [refresh]
  );

  // Compute streak details and "Never Miss Twice" detection for a habit
  const getStreakInfo = useCallback(
    (habitId: string): HabitStreakInfo => {
      const today = getTodayDateString();
      const yesterday = getDateOffset(today, -1);
      const twoDaysAgo = getDateOffset(today, -2);

      const completedToday = logsMap.get(`${habitId}_${today}`)?.completed || false;
      const completedYesterday = logsMap.get(`${habitId}_${yesterday}`)?.completed || false;
      const completedTwoDaysAgo = logsMap.get(`${habitId}_${twoDaysAgo}`)?.completed || false;

      // "Never Miss Twice" alert:
      // If completed 2 days ago, missed yesterday, and haven't completed today yet -> RECOVERY DAY!
      const isRecoveryDay = !completedToday && !completedYesterday && completedTwoDaysAgo;

      // Calculate current streak
      let currentStreak = 0;
      let checkDate = completedToday ? today : yesterday;

      // If neither today nor yesterday was completed, current streak is 0
      if (!completedToday && !completedYesterday) {
        currentStreak = 0;
      } else {
        while (true) {
          const log = logsMap.get(`${habitId}_${checkDate}`);
          if (log && log.completed) {
            currentStreak++;
            checkDate = getDateOffset(checkDate, -1);
          } else {
            break;
          }
        }
      }

      // Calculate longest streak & total completions
      const habitCompletions = logs.filter((l) => l.habitId === habitId && l.completed);
      const totalCompletions = habitCompletions.length;

      // Calculate longest streak from sorted dates
      const sortedDates = habitCompletions
        .map((l) => l.date)
        .sort();

      let longestStreak = 0;
      let tempStreak = 0;
      let prevDate = '';

      for (const d of sortedDates) {
        if (!prevDate) {
          tempStreak = 1;
        } else {
          const expectedNext = getDateOffset(prevDate, 1);
          if (d === expectedNext) {
            tempStreak++;
          } else if (d !== prevDate) {
            tempStreak = 1;
          }
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        prevDate = d;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      return {
        currentStreak,
        longestStreak,
        completedToday,
        completedYesterday,
        isRecoveryDay,
        totalCompletions,
      };
    },
    [logs, logsMap]
  );

  // Daily statistics for selected date
  const selectedDateStats = useMemo(() => {
    const total = habits.length;
    const completed = habits.filter((h) => logsMap.get(`${h.id}_${selectedDate}`)?.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      completed,
      percentage,
    };
  }, [habits, logsMap, selectedDate]);

  return {
    habits,
    logs,
    logsMap,
    isLoading,
    toggleHabit,
    toggleTwoMinuteMode,
    addHabit,
    updateHabit,
    deleteHabit,
    getStreakInfo,
    selectedDateStats,
    refresh,
  };
}
