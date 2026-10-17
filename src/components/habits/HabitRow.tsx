import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  Flame,
  AlertTriangle,
  ChevronDown,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Zap,
  Target,
  X,
} from 'lucide-react';
import { Habit, HabitLog, HabitStreakInfo } from '../../types';

interface HabitRowProps {
  habit: Habit;
  log?: HabitLog;
  streakInfo: HabitStreakInfo;
  selectedDate: string;
  isToday: boolean;
  onToggle: (habitId: string) => void;
  onToggleTwoMinute: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export const HabitRow: React.FC<HabitRowProps> = ({
  habit,
  log,
  streakInfo,
  selectedDate,
  isToday,
  onToggle,
  onToggleTwoMinute,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isCompleted = log?.completed || false;
  const isTwoMinuteUsed = log?.usedTwoMinuteVersion || false;

  // View follows along the movement of expansion
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-expand]')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    setShowMenu(false);
    onDelete(habit.id);
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
          isExpanded
            ? 'bg-[#FAF8F5] border-amber-900/30 shadow-xs ring-1 ring-amber-900/15'
            : isCompleted
            ? 'bg-[#FAF8F5]/80 border-amber-900/15'
            : streakInfo.isRecoveryDay && isToday
            ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300'
            : 'bg-white border-stone-200/90 hover:border-stone-300'
        }`}
      >
        {/* Recovery Day "Never Miss Twice" Banner */}
        {streakInfo.isRecoveryDay && isToday && !isCompleted && (
          <div className="bg-amber-100/90 text-amber-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-amber-200">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>Recovery Day: Missing once is an accident. Never miss twice!</span>
            </div>
            <span className="text-[11px] font-normal text-amber-800 hidden sm:inline">
              Keep streak alive with 2-min rule
            </span>
          </div>
        )}

        {/* Main interactive row (Clicking anywhere expands/collapses) */}
        <div
          onClick={handleRowClick}
          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer group select-none"
        >
          {/* Checkbox Hitbox & Habit Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Custom Touch Hitbox Checkbox (>= 44x44px target) */}
            <button
              type="button"
              data-no-expand="true"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(habit.id);
              }}
              aria-label={`Toggle habit: ${habit.title}`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer border ${
                isCompleted
                  ? 'bg-amber-900 border-amber-950 text-white shadow-xs'
                  : 'bg-white border-stone-300 hover:border-amber-700 text-transparent hover:text-stone-300'
              }`}
            >
              <Check className={`w-5 h-5 stroke-[2.5] ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
            </button>

            {/* Habit Information (Lean & Scannable) */}
            <div className="min-w-0 flex-1">
              {/* Identity line: clearly visible without harsh truncation */}
              <div className="text-xs font-semibold text-amber-900 font-editorial tracking-tight group-hover:text-amber-950 transition-colors leading-snug line-clamp-2">
                {habit.identity}
              </div>

              {/* Habit title */}
              <h4
                className={`text-sm font-medium leading-snug mt-0.5 transition-colors ${
                  isCompleted ? 'text-stone-400 line-through' : 'text-stone-800'
                }`}
              >
                {habit.title}
              </h4>
            </div>
          </div>

          {/* Right: Streak & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Streak counter */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold tabular-nums ${
                streakInfo.currentStreak > 0
                  ? 'bg-amber-100/80 text-amber-950'
                  : 'bg-stone-100 text-stone-500'
              }`}
              title={`Streak: ${streakInfo.currentStreak}d (Best: ${streakInfo.longestStreak}d)`}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  streakInfo.currentStreak > 0 ? 'text-amber-700 fill-amber-700' : 'text-stone-400'
                }`}
              />
              <span>{streakInfo.currentStreak}d</span>
            </div>

            {/* Expand disclosure arrow (smooth rotation) */}
            <div
              className={`p-1.5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-amber-900' : 'text-stone-400 group-hover:text-stone-700'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>

            {/* Menu Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                data-no-expand="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                title="Options"
                aria-label="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-stone-200 py-1 shadow-lg z-30 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(habit);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Smooth CSS Grid Accordion Expansion (Zero parent jumping, clean roll down/up) */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 bg-stone-50/70 border-t border-stone-200/60 text-xs text-stone-700 space-y-3">
              {/* Full Identity Card */}
              <div className="p-3.5 rounded-xl bg-white border border-amber-900/15 shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-800" />
                  <span>Declared Identity</span>
                </div>
                <p className="text-sm font-editorial italic text-stone-900 font-medium leading-relaxed">
                  “{habit.identity}”
                </p>
              </div>

              {/* 2 Micro Cards: Stacking Cue & 2-Minute Gateway */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-800" />
                    <span>Stacking Cue</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed font-sans-ui">{habit.cue}</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>2-Min Rule</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleTwoMinute(habit.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        isTwoMinuteUsed
                          ? 'bg-amber-100 text-amber-950 font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {isTwoMinuteUsed ? 'Done (2-Min)' : 'Log 2-Min Only'}
                    </button>
                  </div>
                  <p className="text-stone-600 leading-relaxed font-sans-ui">
                    {habit.twoMinuteVersion || 'Start with just 120 seconds.'}
                  </p>
                </div>
              </div>

              {/* Bottom Bar: Category, Total reps, Edit & Delete */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <span>{habit.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{streakInfo.totalCompletions} total reps</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(habit)}
                    className="px-2.5 py-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-2.5 py-1 rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-stone-200 p-5 shadow-xl text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Delete Habit</span>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              <p className="text-sm text-stone-700">
                Delete <strong>“{habit.title}”</strong>?
              </p>
              <p className="text-xs text-stone-500">
                This removes the habit and its records from your local tracker.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
