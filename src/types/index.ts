/**
 * Core domain types for the Atomic Habits 30-Day Curriculum & Identity Tracker
 */

export type Phase =
  | 'Foundations & Identity'
  | '1st Law: Make It Obvious'
  | '2nd Law: Make It Attractive'
  | '3rd Law: Make It Easy'
  | '4th Law: Make It Satisfying'
  | 'Advanced Mastery & Review';

export interface Challenge {
  day: number;
  phase: Phase;
  title: string;
  bookChapterRef: string;
  concept: string;          // Core principle or quote from Atomic Habits
  actionItem: string;       // Tangible physical/mental task to perform today
  reflectionPrompt: string; // Journal question to prompt deliberate introspection
}

export interface ChallengeLog {
  day: number;              // 1 to 30 (primary key)
  completedAt: string;      // ISO 8601 string
  reflection: string;       // User's journal entry (supports markdown)
}

export interface Habit {
  id: string;               // UUID
  identity: string;         // "I am the type of person who..." e.g. "I am a disciplined writer"
  title: string;            // e.g. "Write 500 words"
  cue: string;              // Implementation intention: "After I make coffee, I will sit at my desk"
  twoMinuteVersion: string; // The gateway habit: "Open document and write 1 sentence"
  category: 'Focus & Craft' | 'Health & Energy' | 'Mind & Reflection' | 'Order & Environment';
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  id: string;               // Composite key: `${habitId}_${date}`
  habitId: string;
  date: string;             // YYYY-MM-DD (client local date)
  completed: boolean;
  usedTwoMinuteVersion?: boolean;
  notes?: string;
  updatedAt: string;
}

export interface HabitStreakInfo {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completedYesterday: boolean;
  isRecoveryDay: boolean;   // "Never Miss Twice" warning: completed 2 days ago, missed yesterday!
  totalCompletions: number;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  habits: Habit[];
  habitLogs: HabitLog[];
  challengeLogs: ChallengeLog[];
  activeDay: number;
}
