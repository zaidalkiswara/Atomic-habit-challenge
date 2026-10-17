import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Calendar,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ATOMIC_HABITS_CURRICULUM } from '../../data/curriculum';
import { Challenge, ChallengeLog, Phase } from '../../types';

interface CurriculumTimelineProps {
  activeDay: number;
  maxUnlockedDay: number;
  challengeLogs: Map<number, ChallengeLog>;
  onSelectDay: (day: number) => void;
}

const PHASES: Phase[] = [
  'Foundations & Identity',
  '1st Law: Make It Obvious',
  '2nd Law: Make It Attractive',
  '3rd Law: Make It Easy',
  '4th Law: Make It Satisfying',
  'Advanced Mastery & Review',
];

export const CurriculumTimeline: React.FC<CurriculumTimelineProps> = ({
  activeDay,
  maxUnlockedDay,
  challengeLogs,
  onSelectDay,
}) => {
  const [inspectingDay, setInspectingDay] = useState<number | null>(null);

  const completedCount = challengeLogs.size;
  const progressPercentage = Math.round((completedCount / 30) * 100);

  const inspectingChallenge = inspectingDay
    ? ATOMIC_HABITS_CURRICULUM.find((c) => c.day === inspectingDay)
    : null;
  const inspectingLog = inspectingDay ? challengeLogs.get(inspectingDay) : null;

  return (
    <div className="space-y-8">
      {/* Overview Progress Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-1">
              Curriculum Roadmap
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-editorial text-stone-900">
              30 Days of Compounding System Mastery
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-xl">
              Progressive execution directly mapped to James Clear’s 4 Laws of Behavior Change.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-2xl font-bold font-editorial tabular-nums text-stone-900">
                {completedCount}<span className="text-stone-400 font-normal text-base">/30</span>
              </div>
              <div className="text-xs text-stone-500 font-medium">{progressPercentage}% Complete</div>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-800 transition-all duration-500 ease-out"
                  strokeDasharray={`${progressPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold font-sans-ui text-stone-800">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped by Phase */}
      <div className="space-y-6">
        {PHASES.map((phase, phaseIdx) => {
          const phaseChallenges = ATOMIC_HABITS_CURRICULUM.filter((c) => c.phase === phase);
          const phaseCompleted = phaseChallenges.filter((c) => challengeLogs.has(c.day)).length;
          const isPhaseFinished = phaseCompleted === phaseChallenges.length;

          return (
            <section
              key={phase}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs"
            >
              {/* Phase Header */}
              <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-100">
                <div>
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Phase {phaseIdx + 1}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-editorial text-stone-900">
                    {phase}
                  </h3>
                </div>
                <div className="text-xs text-stone-500 font-medium">
                  {phaseCompleted}/{phaseChallenges.length} Days Done
                </div>
              </div>

              {/* Grid of Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {phaseChallenges.map((challenge) => {
                  const isDone = challengeLogs.has(challenge.day);
                  const isCurrent = challenge.day === activeDay;
                  const isUnlocked = challenge.day <= maxUnlockedDay;

                  return (
                    <div
                      key={challenge.day}
                      onClick={() => {
                        if (isUnlocked) {
                          onSelectDay(challenge.day);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all text-left relative ${
                        isCurrent
                          ? 'border-amber-800/80 bg-amber-50/40 ring-1 ring-amber-800/30'
                          : isDone
                          ? 'border-stone-200/90 bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] cursor-pointer'
                          : isUnlocked
                          ? 'border-stone-200 bg-white hover:border-amber-300 cursor-pointer'
                          : 'border-stone-100 bg-stone-50/60 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold tabular-nums text-amber-950/80">
                          Day {challenge.day}
                        </span>

                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Done
                          </span>
                        ) : isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            Active
                          </span>
                        ) : !isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-sm font-semibold font-editorial text-stone-900 leading-snug line-clamp-2">
                        {challenge.title}
                      </h4>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                        <span className="text-stone-400 text-[11px] truncate max-w-[160px]">
                          {challenge.bookChapterRef.split(':')[0]}
                        </span>

                        {isDone ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingDay(challenge.day);
                            }}
                            className="text-amber-900 hover:text-amber-950 font-medium text-[11px] hover:underline cursor-pointer"
                          >
                            Read Reflection
                          </button>
                        ) : isUnlocked ? (
                          <span className="text-amber-800 font-medium text-[11px] flex items-center gap-0.5">
                            Focus <ArrowRight className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Next up</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Reflection Inspection Modal */}
      {inspectingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-stone-200 p-6 shadow-xl max-h-[90vh] overflow-y-auto text-stone-900">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs text-amber-900 font-semibold">
                  Day {inspectingChallenge.day} · {inspectingChallenge.phase}
                </span>
                <h3 className="text-lg font-bold font-editorial text-stone-900">
                  {inspectingChallenge.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingDay(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Guiding Prompt
                </div>
                <p className="text-xs sm:text-sm italic text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                  “{inspectingChallenge.reflectionPrompt}”
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                    Your Journal Entry
                  </div>
                  {inspectingLog && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(inspectingLog.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-amber-950/10 text-sm text-stone-800 whitespace-pre-wrap leading-relaxed font-sans-ui">
                  {inspectingLog?.reflection || 'No reflection recorded.'}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  onSelectDay(inspectingChallenge.day);
                  setInspectingDay(null);
                }}
                className="text-xs font-medium text-amber-900 hover:underline cursor-pointer"
              >
                Jump to this day in Today’s Focus
              </button>
              <button
                onClick={() => setInspectingDay(null)}
                className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
