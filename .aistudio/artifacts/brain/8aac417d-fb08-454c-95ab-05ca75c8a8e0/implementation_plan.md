# Atomic Habits: 30-Day Curriculum & Identity Habit Tracker

A local-first, distraction-free Progressive Web App that translates James Clear's *Atomic Habits* into daily execution through a structured 30-day curriculum paired with an identity-first daily habit checklist.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed with the user during Phase 1:
> - **Visual Direction**: Warm editorial paper palette with dark amber accents, rich charcoal typography, and tactile hairline dividers (no neon, no AI slop, no generic pill badge sandwiches).
> - **Curriculum Progression**: Self-paced progression—submitting a genuine reflection for Day $N$ immediately unlocks Day $N+1$, while maintaining a navigable 30-day visual timeline of past reflections and future milestones.
> - **Starter Kit**: Pre-populated with 3 foundational Atomic Habits based on book examples (Reading, Hydration/Vitality, Deep Work) so the user experiences the identity affirmation and the 2-minute rule immediately upon launch.
> - **Architecture**: 100% client-side local-first persistence via Dexie.js (IndexedDB), zero external auth or remote database friction, with comprehensive JSON backup export/import and full offline PWA capabilities.

---

## 1. Overview & Core Concept

- **What It Does**: 
  - **30-Day Atomic Curriculum**: Guides the user through the 6 fundamental phases of behavioral change (Foundations & Identity $\rightarrow$ 1st Law: Make It Obvious $\rightarrow$ 2nd Law: Make It Attractive $\rightarrow$ 3rd Law: Make It Easy $\rightarrow$ 4th Law: Make It Satisfying $\rightarrow$ Advanced Mastery & Review). Each day delivers a concise core concept, a tangible behavioral action item, and a Markdown-capable reflection journal that logs progress upon completion.
  - **Identity-First Habit Tracker**: Daily checklist anchoring each habit to a declared identity statement (*"I am the type of person who..."*), accompanied by an explicit implementation cue (*"After [current habit], I will [new habit]"*), a 2-minute starter version (*"To make it easy, start with..."*), and a **Never Miss Twice** streak protection algorithm.
  - **Local Sovereignty & Offline Resilience**: Operates entirely in the browser using IndexedDB. Complete data portability via one-click JSON backup export and restore.
- **Target Persona**: Readers, professionals, and habit-builders seeking a distraction-free, privacy-preserving companion tool that bridges the gap between reading *Atomic Habits* and executing its system daily without notification fatigue or social media noise.
- **Key Value**: Replaces passive habit counting with identity reinforcement, environmental design cues, and daily reflective friction.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Run Experience**:
   - The user opens the app to find Day 1: *"The Power of 1% Compounding & Identity-Based Habits"* immediately ready.
   - Pre-loaded starter habits demonstrate the 4 laws with clear identity statements, implementation cues, and 2-minute starter triggers.
2. **Daily Execution Flow**:
   - The user reviews today's active challenge concept and action item.
   - They complete the physical action, enter their daily journal entry in the reflection prompt, and click *"Complete Day & Unlock Next"*.
   - A quiet celebratory toast appears, updating the 30-day curriculum roadmap progress ring.
3. **Daily Habit Check-in & Streak Protection**:
   - The user taps habits completed today. 
   - If a habit was missed yesterday, an amber badge reminds them: *"Recovery Day: Missing once is an accident. Missing twice is the start of a new habit."*
   - Users can toggle between the 2-minute entry version and the full habit routine.
4. **Curriculum Timeline & Archive**:
   - A dedicated 30-day roadmap tab shows completed days with read-only viewable reflections, today's active challenge, and locked future days with preview summaries.
5. **Data Backup & Settings**:
   - A clean modal to export all habits, logs, and challenge journal entries into a dated `.json` file, or restore from a previous backup.
6. **PWA Installation**:
   - A discrete install button in the header (or iOS instructions drawer) allowing one-tap installation to home screen as a standalone app.

### Visual Identity & Theme

- **Aesthetic Direction**: Warm Editorial & Paper Journaling. Calming, focused, book-like tactile atmosphere reminiscent of high-end stationery and thoughtful non-fiction publishing.
- **Color Palette (60-30-10 Rule)**:
  - **Canvas (60%)**: `#FAF8F5` (warm cream paper) in light mode, `#181614` (warm charcoal ink) in dark mode.
  - **Surfaces & Borders (30%)**: `#FFFFFF` cards in light mode with `#E7E1D8` hairline borders (`border border-amber-950/10`), `#221F1C` cards with `#36312B` hairline borders in dark mode.
  - **Accent Budget (10%)**: Warm deep amber `#92400E` (amber-800) for primary interactive highlights, `#D97706` (amber-600) for active indicators, and `#B45309` for focal buttons.
- **Typography & Scale**:
  - Primary Display / Headings: `Plus Jakarta Sans` or warm serif styling with tight tracking and balanced headlines (`text-wrap: balance`).
  - Body Prose: Clean, comfortable measure (65–72ch), $15\text{px}$–$16\text{px}$ with generous line height ($1.6$).
  - Tabular & Dates: Tabular figures (`tabular-nums`) for streak counts, day numbers, and timestamps.
- **Zero-Pill Discipline**: Metadata (phase labels, day numbers, dates, cues) rendered as unboxed typography separated by quiet mid-dots (`·`), avoiding cluttered capsule badges.
- **Touch & Desktop Ergonomics**:
  - Mobile: Natural bottom navigation bar, 44px+ touch targets, sticky bottom action sheet where appropriate.
  - Desktop: Expands cleanly into a 2-column split view (Today's Challenge + Daily Habit Checklist side-by-side) within a balanced `max-w-6xl` container.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side IndexedDB (Dexie.js) vs. Cloud Database / Auth**
  - *Chosen Approach*: Pure client-side IndexedDB with Dexie.js and JSON export/import.
  - *Why*: Instant $<50\text{ms}$ cold load, zero account friction, 100% offline functionality, and complete privacy for personal journal reflections.
  - *Alternatives Considered*: Firebase / Supabase rejected to maintain privacy, zero external dependencies, and eliminate authentication dropout.
- **Decision 2: 30-Day Curriculum Structure & Unlock Rule**
  - *Chosen Approach*: Self-paced sequential progression. Day 1 is unlocked initially; submitting Day $N$'s reflection unlocks Day $N+1$ immediately. Past days remain permanently readable and editable.
  - *Why*: Allows ambitious learners to progress without artificial calendar friction while enforcing the reflective friction necessary for habit adoption.
  - *Alternatives Considered*: Strict 24-hour lockout rejected as frustrating for users who miss midnight cutoff or review multiple insights over a focused weekend retreat.
- **Decision 3: "Never Miss Twice" Logic**
  - *Chosen Approach*: If a habit was completed on day $T-2$ but missed on $T-1$, day $T$ shows a high-priority "Recovery Day" cue. Streaks reset only if 2 consecutive days are missed.
  - *Why*: This strictly implements James Clear's rule that one mistake is just an outlier, but two consecutive misses trigger a compounding downward spiral.

---

## 4. Technical Architecture & Data Strategy

### System Component & Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Progressive Web App                            │
│           (Service Worker precaching via vite-plugin-pwa)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           Root App Shell                                │
│       [Top Bar: Brand | PWA Install Button | Backup Modal Trigger]      │
│       [Navigation Tabs: Today's Focus | 30-Day Roadmap | Habits View]   │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
     ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
     │ Today's Challenge│ │ 30-Day Roadmap   │ │ Daily Habits     │
     │ - Concept & Quote│ │ - Phase Accordion│ │ - Identity Header│
     │ - Action Item    │ │ - Status Tracker │ │ - 2-Min Version  │
     │ - Markdown Entry │ │ - Past Reflection│ │ - Streak Tracker │
     │ - Complete CTA   │ │   Inspection     │ │ - "Never Miss 2" │
     └─────────┬────────┘ └─────────┬────────┘ └─────────┬────────┘
               │                    │                    │
               └────────────────────┼────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        State & Data Layer                              │
│   • useCurriculum() -> activeDay, completedLogs, unlockNext()          │
│   • useHabits()     -> habits, logsByDate, toggleHabit(), streaks      │
│   • useBackup()     -> exportJSON(), importJSON(), resetAll()          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Dexie.js (IndexedDB Persistence)                      │
│   • challenge_logs [day, completedAt, reflection]                      │
│   • habits         [id, identity, title, cue, twoMinuteVersion, etc.]  │
│   • habit_logs     [id: habitId_date, habitId, date, completed]        │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models & Schema

```typescript
// Challenge Definition (Static 30-Day Curriculum)
export type Phase = 
  | "Foundations & Identity" 
  | "1st Law: Make It Obvious" 
  | "2nd Law: Make It Attractive" 
  | "3rd Law: Make It Easy" 
  | "4th Law: Make It Satisfying" 
  | "Advanced Mastery & Review";

export interface Challenge {
  day: number;
  phase: Phase;
  title: string;
  concept: string;          // Direct takeaway or quote
  actionItem: string;       // Precise behavioural instruction
  reflectionPrompt: string; // Journal question
}

// Persisted Challenge Journal Entry
export interface ChallengeLog {
  day: number;              // Primary key
  completedAt: string;      // ISO string
  reflection: string;       // Markdown journal entry
}

// Persisted Identity Habit
export interface Habit {
  id: string;               // UUID
  identity: string;         // e.g. "I am a reader who values wisdom"
  title: string;            // e.g. "Read 10 pages of non-fiction"
  cue: string;              // e.g. "After I pour my morning coffee"
  twoMinuteVersion: string; // e.g. "Read 1 paragraph"
  createdAt: string;
  archived: boolean;
}

// Daily Habit Completion Record
export interface HabitLog {
  id: string;               // composite: `${habitId}_${YYYY-MM-DD}`
  habitId: string;
  date: string;             // YYYY-MM-DD in client local time
  completed: boolean;
  notes?: string;
}
```

### Interactive Components & Working Handlers

1. **`TodayChallenge`**:
   - Manages reflection state with a live Markdown preview toggle.
   - Validation ensures reflections are thoughtful (non-empty) before submitting.
   - On submit, saves to `challenge_logs` in Dexie and sets active day to `day + 1`.
2. **`CurriculumTimeline`**:
   - Groups 30 days by the 6 core phases.
   - Shows status for each day: Completed (with green check and clickable reflection drawer), Current (highlighted in warm amber with direct link to focus view), and Locked (showing upcoming title and phase).
3. **`HabitList` & `HabitRow`**:
   - Displays identity affirmation above habits.
   - Toggle button with optimistic state update + Dexie write.
   - Expandable disclosure showing the **Implementation Cue** and the **2-Minute Rule Version**.
   - Streak badge computing consecutive days and highlighting "Never Miss Twice" warning flag if missed yesterday.
4. **`HabitModal`**:
   - Structured form guiding the user through James Clear's 4-part habit formula:
     1. Desired Identity (*"Who do you want to become?"*)
     2. Specific Habit (*"What is the habit?"*)
     3. Habit Stacking Cue (*"After [Current Habit], I will..."*)
     4. 2-Minute Gateway (*"How to start in under 2 minutes?"*)
5. **`BackupModal`**:
   - Export: Generates structured JSON download `atomic-habits-backup-YYYY-MM-DD.json`.
   - Import: Validates schema before overwriting or merging IndexedDB data.
   - Reset: Safe 2-step confirmation to clear data or restore default starter habits.
6. **`PWAInstallButton` & Service Worker**:
   - Listens to `beforeinstallprompt`, manages install prompt execution, detects standalone mode, and offers step-by-step iOS Safari instructions.

---

## 5. Verification Plan

- **Compilation & Linting**: Run `compile_applet` and `lint_applet` after creating all files to ensure 100% clean TypeScript builds.
- **Database CRUD & Offline Test**:
  - Test seeding starter habits on empty DB.
  - Test toggling habit logs across dates.
  - Test submitting Day 1 challenge reflection and verifying immediate Day 2 unlock.
- **Export & Import Validation**:
  - Test generating a full JSON backup, modifying state, importing the backup, and verifying restoration.
- **PWA & Responsive Audit**:
  - Verify manifest configuration and service worker precaching.
  - Check layout across mobile (375px) and desktop (1440px) breakpoints.
