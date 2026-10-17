import Dexie, { Table } from 'dexie';
import { ChallengeLog, Habit, HabitLog, BackupData } from '../types';

export class AtomicHabitsDatabase extends Dexie {
  challengeLogs!: Table<ChallengeLog, number>;
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('AtomicHabitsDB');
    this.version(1).stores({
      challengeLogs: 'day, completedAt',
      habits: 'id, identity, title, category, createdAt, archived',
      habitLogs: 'id, habitId, date, completed',
      settings: 'key',
    });
  }
}

export const db = new AtomicHabitsDatabase();

export const STARTER_HABITS: Habit[] = [
  {
    id: 'habit-starter-reading',
    identity: 'I am a dedicated learner who cultivates deep wisdom',
    title: 'Read 10 pages of non-fiction',
    cue: 'After I pour my morning coffee or tea',
    twoMinuteVersion: 'Read exactly 1 paragraph or 1 page',
    category: 'Mind & Reflection',
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'habit-starter-vitality',
    identity: 'I am an energized athlete who values daily physical vitality',
    title: 'Hydrate with 500ml water and complete 10 min movement',
    cue: 'After I wake up and get out of bed',
    twoMinuteVersion: 'Drink 1 full glass of water and stretch arms',
    category: 'Health & Energy',
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'habit-starter-focus',
    identity: 'I am a focused creator who ships intentional work',
    title: 'Complete 60 minutes of uninterrupted deep focus',
    cue: 'After I sit at my desk and silence my phone',
    twoMinuteVersion: 'Open work document and write the first single line',
    category: 'Focus & Craft',
    createdAt: new Date().toISOString(),
    archived: false,
  },
];

/**
 * Generates realistic starter habit history across recent days
 */
export function generateStarterHabitLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const now = new Date();
  
  // Seed for past 30 days
  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Reading habit: ~85% consistency, some 2-min rule uses
    const readCompleted = (offset % 7 !== 2); // Misses day 2, 9, 16, 23 (single miss never twice)
    const readTwoMin = readCompleted && (offset % 5 === 0);
    logs.push({
      id: `habit-starter-reading_${dateStr}`,
      habitId: 'habit-starter-reading',
      date: dateStr,
      completed: readCompleted,
      usedTwoMinuteVersion: readTwoMin,
      updatedAt: d.toISOString(),
    });

    // Vitality habit: ~80% consistency
    const vitCompleted = (offset % 6 !== 4);
    const vitTwoMin = vitCompleted && (offset % 4 === 1);
    logs.push({
      id: `habit-starter-vitality_${dateStr}`,
      habitId: 'habit-starter-vitality',
      date: dateStr,
      completed: vitCompleted,
      usedTwoMinuteVersion: vitTwoMin,
      updatedAt: d.toISOString(),
    });

    // Focus habit: ~75% consistency
    const focusCompleted = (offset % 5 !== 3);
    const focusTwoMin = focusCompleted && (offset % 3 === 0);
    logs.push({
      id: `habit-starter-focus_${dateStr}`,
      habitId: 'habit-starter-focus',
      date: dateStr,
      completed: focusCompleted,
      usedTwoMinuteVersion: focusTwoMin,
      updatedAt: d.toISOString(),
    });
  }
  return logs;
}

/**
 * Initializes default database state if tables are empty
 */
export async function initializeDatabase(): Promise<void> {
  const seeded = await db.settings.get('starterHabitsSeeded');
  if (!seeded) {
    const habitsCount = await db.habits.count();
    if (habitsCount === 0) {
      await db.habits.bulkAdd(STARTER_HABITS);
    }

    const logsCount = await db.habitLogs.count();
    if (logsCount === 0) {
      const starterLogs = generateStarterHabitLogs();
      await db.habitLogs.bulkAdd(starterLogs);
    }
    await db.settings.put({ key: 'starterHabitsSeeded', value: true });
  }

  const activeDaySetting = await db.settings.get('activeDay');
  if (!activeDaySetting) {
    await db.settings.put({ key: 'activeDay', value: 1 });
  }
}

/**
 * Full JSON export of user's personal habit system
 */
export async function exportDatabaseBackup(): Promise<string> {
  const habits = await db.habits.toArray();
  const habitLogs = await db.habitLogs.toArray();
  const challengeLogs = await db.challengeLogs.toArray();
  const activeDaySetting = await db.settings.get('activeDay');
  const activeDay = (activeDaySetting?.value as number) || 1;

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    habitLogs,
    challengeLogs,
    activeDay,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Full JSON import to restore or migrate data
 */
export async function importDatabaseBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString) as BackupData;
    if (!data || !Array.isArray(data.habits) || !Array.isArray(data.challengeLogs)) {
      return { success: false, message: 'Invalid backup format. Missing habits or challenge data.' };
    }

    await db.transaction('rw', [db.habits, db.habitLogs, db.challengeLogs, db.settings], async () => {
      await db.habits.clear();
      await db.habitLogs.clear();
      await db.challengeLogs.clear();

      if (data.habits.length > 0) {
        await db.habits.bulkAdd(data.habits);
      }
      if (Array.isArray(data.habitLogs) && data.habitLogs.length > 0) {
        await db.habitLogs.bulkAdd(data.habitLogs);
      }
      if (data.challengeLogs.length > 0) {
        await db.challengeLogs.bulkAdd(data.challengeLogs);
      }

      const activeDay = typeof data.activeDay === 'number' ? data.activeDay : 1;
      await db.settings.put({ key: 'activeDay', value: activeDay });
    });

    return { success: true, message: 'Database restored successfully!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Import failed: ${errorMsg}` };
  }
}

/**
 * Reset database to starter state with confirmation
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  await db.transaction('rw', [db.habits, db.habitLogs, db.challengeLogs, db.settings], async () => {
    await db.habits.clear();
    await db.habitLogs.clear();
    await db.challengeLogs.clear();
    await db.habits.bulkAdd(STARTER_HABITS);
    await db.settings.put({ key: 'activeDay', value: 1 });
  });
}
