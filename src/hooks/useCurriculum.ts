import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../db';
import { ChallengeLog, Phase } from '../types';
import { ATOMIC_HABITS_CURRICULUM } from '../data/curriculum';

export function useCurriculum() {
  const [challengeLogs, setChallengeLogs] = useState<Map<number, ChallengeLog>>(new Map());
  const [activeDay, setActiveDayState] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all challenge logs & activeDay setting
  const refresh = useCallback(async () => {
    try {
      const logs = await db.challengeLogs.toArray();
      const map = new Map<number, ChallengeLog>();
      logs.forEach((log) => map.set(log.day, log));
      setChallengeLogs(map);

      const activeDaySetting = await db.settings.get('activeDay');
      if (activeDaySetting && typeof activeDaySetting.value === 'number') {
        setActiveDayState(activeDaySetting.value);
      } else {
        // Default to the first uncompleted day
        let firstUncompleted = 1;
        for (let d = 1; d <= 30; d++) {
          if (!map.has(d)) {
            firstUncompleted = d;
            break;
          }
        }
        setActiveDayState(firstUncompleted);
        await db.settings.put({ key: 'activeDay', value: firstUncompleted });
      }
    } catch (err) {
      console.error('Failed to load curriculum progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Determine the highest unlocked day: (count of completed days + 1, min 1, max 30)
  const maxUnlockedDay = useMemo(() => {
    let unlocked = 1;
    for (let d = 1; d <= 30; d++) {
      if (challengeLogs.has(d)) {
        unlocked = Math.min(30, d + 1);
      } else {
        break;
      }
    }
    return unlocked;
  }, [challengeLogs]);

  const isDayUnlocked = useCallback(
    (day: number) => {
      return day <= maxUnlockedDay;
    },
    [maxUnlockedDay]
  );

  const setActiveDay = useCallback(
    async (day: number) => {
      if (day >= 1 && day <= 30 && isDayUnlocked(day)) {
        setActiveDayState(day);
        await db.settings.put({ key: 'activeDay', value: day });
      }
    },
    [isDayUnlocked]
  );

  const saveReflection = useCallback(
    async (day: number, reflection: string) => {
      const log: ChallengeLog = {
        day,
        completedAt: new Date().toISOString(),
        reflection,
      };
      await db.challengeLogs.put(log);
      await refresh();
    },
    [refresh]
  );

  const completeAndUnlockNext = useCallback(
    async (day: number, reflection: string): Promise<number> => {
      const log: ChallengeLog = {
        day,
        completedAt: new Date().toISOString(),
        reflection: reflection.trim(),
      };
      await db.challengeLogs.put(log);

      const nextDay = Math.min(30, day + 1);
      await db.settings.put({ key: 'activeDay', value: nextDay });
      setActiveDayState(nextDay);
      await refresh();
      return nextDay;
    },
    [refresh]
  );

  // Statistics
  const completedCount = challengeLogs.size;
  const progressPercent = Math.round((completedCount / 30) * 100);

  const currentChallenge = useMemo(() => {
    return ATOMIC_HABITS_CURRICULUM.find((c) => c.day === activeDay) || ATOMIC_HABITS_CURRICULUM[0];
  }, [activeDay]);

  const currentPhase: Phase = currentChallenge.phase;

  return {
    challengeLogs,
    activeDay,
    currentChallenge,
    currentPhase,
    maxUnlockedDay,
    isLoading,
    completedCount,
    progressPercent,
    isDayUnlocked,
    setActiveDay,
    saveReflection,
    completeAndUnlockNext,
    refresh,
  };
}
