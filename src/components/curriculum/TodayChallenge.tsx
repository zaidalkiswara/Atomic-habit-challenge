import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Edit3,
  Eye,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Challenge, ChallengeLog } from '../../types';

interface TodayChallengeProps {
  challenge: Challenge;
  activeDay: number;
  maxUnlockedDay: number;
  challengeLog?: ChallengeLog;
  onSaveReflection: (day: number, reflection: string) => Promise<void>;
  onCompleteAndUnlockNext: (day: number, reflection: string) => Promise<number>;
  onSelectDay: (day: number) => void;
  onViewAllRoadmap: () => void;
}

export const TodayChallenge: React.FC<TodayChallengeProps> = ({
  challenge,
  activeDay,
  maxUnlockedDay,
  challengeLog,
  onSaveReflection,
  onCompleteAndUnlockNext,
  onSelectDay,
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (challengeLog) {
      setReflectionText(challengeLog.reflection);
    } else {
      setReflectionText('');
    }
    setIsPreviewMode(false);
    setSavedNotice(false);
  }, [challenge.day, challengeLog]);

  const isCompleted = !!challengeLog;
  const canGoPrevious = activeDay > 1;
  const canGoNext = activeDay < maxUnlockedDay;

  const handleSaveDraft = async () => {
    if (!reflectionText.trim()) return;
    await onSaveReflection(challenge.day, reflectionText);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCompleteChallenge = async () => {
    if (!reflectionText.trim()) {
      alert('Please write your reflection before marking today’s challenge complete.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCompleteAndUnlockNext(challenge.day, reflectionText);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#92400e', '#d97706', '#f59e0b', '#78350f'],
        });
      } catch {
        // Fallback silently if confetti unsupported
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="bg-[#FAF8F5] rounded-2xl border border-amber-900/15 p-5 sm:p-7 shadow-xs transition-shadow">
      {/* Top Header: Phase, Day Stepper */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <span className="text-amber-900 font-bold tracking-wide">
            Day {challenge.day} of 30
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="truncate max-w-[200px] sm:max-w-none">{challenge.phase}</span>
        </div>

        {/* Steppers */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectDay(activeDay - 1)}
            disabled={!canGoPrevious}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              canGoPrevious
                ? 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                : 'border-transparent text-stone-300 cursor-not-allowed'
            }`}
            title="Previous Unlocked Day"
            aria-label="Previous Unlocked Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectDay(activeDay + 1)}
            disabled={!canGoNext}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              canGoNext
                ? 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                : 'border-transparent text-stone-300 cursor-not-allowed'
            }`}
            title="Next Unlocked Day"
            aria-label="Next Unlocked Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Chapter Reference */}
      <div className="mt-4">
        <h3 className="text-lg sm:text-xl font-bold font-editorial text-stone-900 leading-snug">
          {challenge.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
          <BookOpen className="w-3.5 h-3.5 text-stone-400" />
          <span>{challenge.bookChapterRef}</span>
        </div>
      </div>

      {/* Core Principle Quote (Lean & Elegant) */}
      <blockquote className="mt-4 p-4 rounded-xl bg-white border border-stone-200/80 text-stone-800">
        <p className="text-sm font-editorial italic leading-relaxed text-stone-800">
          {challenge.concept}
        </p>
      </blockquote>

      {/* Action Item */}
      <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-stone-900 text-xs sm:text-sm leading-relaxed">
        <div className="font-semibold text-amber-950 flex items-center gap-1.5 mb-1 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Today's Action</span>
        </div>
        <p className="text-stone-800">{challenge.actionItem}</p>
      </div>

      {/* Daily Reflection Journal Area */}
      <div className="mt-6 pt-5 border-t border-stone-200/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label
            htmlFor="reflection-input"
            className="text-xs font-semibold text-stone-800 uppercase tracking-wider"
          >
            Daily Reflection
          </label>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            {savedNotice && (
              <span className="text-amber-800 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              {isPreviewMode ? (
                <>
                  <Edit3 className="w-3 h-3" /> Edit
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" /> Preview
                </>
              )}
            </button>
          </div>
        </div>

        {/* Guiding Question */}
        <p className="text-xs text-stone-600 mb-2.5 italic">
          “{challenge.reflectionPrompt}”
        </p>

        {/* Input */}
        {isPreviewMode ? (
          <div className="min-h-[110px] p-3.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
            {reflectionText.trim() ? (
              reflectionText
            ) : (
              <span className="text-stone-400 italic">No reflection written yet.</span>
            )}
          </div>
        ) : (
          <textarea
            id="reflection-input"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            onBlur={handleSaveDraft}
            rows={4}
            placeholder="Write your reflection here..."
            className="w-full p-3.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 leading-relaxed placeholder:text-stone-400 resize-y"
          />
        )}

        {/* Action Button & Status */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {isCompleted && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed ({new Date(challengeLog.completedAt).toLocaleDateString()})</span>
              </div>
            )}
          </div>

          <div>
            {isCompleted ? (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Update Entry
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !reflectionText.trim()}
                onClick={handleCompleteChallenge}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  reflectionText.trim()
                    ? 'bg-amber-900 hover:bg-amber-950 text-amber-50 hover:shadow'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Day & Unlock Next</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
