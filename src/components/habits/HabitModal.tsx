import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Zap, Target } from 'lucide-react';
import { Habit } from '../../types';

interface HabitModalProps {
  isOpen: boolean;
  initialHabit?: Habit | null;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => Promise<void>;
}

const CATEGORIES: Habit['category'][] = [
  'Focus & Craft',
  'Health & Energy',
  'Mind & Reflection',
  'Order & Environment',
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  initialHabit,
  onClose,
  onSave,
}) => {
  const [identity, setIdentity] = useState('');
  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');
  const [twoMinuteVersion, setTwoMinuteVersion] = useState('');
  const [category, setCategory] = useState<Habit['category']>('Focus & Craft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialHabit) {
      setIdentity(initialHabit.identity);
      setTitle(initialHabit.title);
      setCue(initialHabit.cue);
      setTwoMinuteVersion(initialHabit.twoMinuteVersion);
      setCategory(initialHabit.category);
    } else {
      setIdentity('');
      setTitle('');
      setCue('');
      setTwoMinuteVersion('');
      setCategory('Focus & Craft');
    }
    setError(null);
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Habit action title is required.');
      return;
    }
    if (!identity.trim()) {
      setError('Identity statement is required. (e.g. "I am the type of person who...")');
      return;
    }
    if (!cue.trim()) {
      setError('Implementation cue is required. (e.g. "After I pour my morning coffee...")');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        identity: identity.trim(),
        title: title.trim(),
        cue: cue.trim(),
        twoMinuteVersion: twoMinuteVersion.trim() || 'Start for 2 minutes only',
        category,
      });
      onClose();
    } catch (err) {
      setError('Failed to save habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-stone-200 p-6 sm:p-7 shadow-xl max-h-[92vh] overflow-y-auto text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Atomic Formula
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-editorial text-stone-900">
              {initialHabit ? 'Edit Identity Habit' : 'Design an Identity Habit'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 1. Identity Declaration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-800" />
              <span>1. Desired Identity ("Who do you want to become?")</span>
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Start with "I am the type of person who..."
            </p>
            <input
              type="text"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="e.g. I am a dedicated reader who values deep wisdom"
              className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 font-editorial"
            />
          </div>

          {/* 2. Habit Action */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>2. The Routine ("What is the specific habit?")</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 10 pages of non-fiction"
              className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>

          {/* 3. Implementation Intention / Habit Stacking Cue */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-800" />
              <span>3. Habit Stacking Cue ("Make it Obvious")</span>
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Formula: "After [Current Habit], I will [New Habit]"
            </p>
            <input
              type="text"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="e.g. After I pour my morning coffee"
              className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>

          {/* 4. The 2-Minute Rule Version */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>4. The 2-Minute Gateway ("Make it Easy")</span>
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Standardize before you optimize. What version takes under 120 seconds?
            </p>
            <input
              type="text"
              value={twoMinuteVersion}
              onChange={(e) => setTwoMinuteVersion(e.target.value)}
              placeholder="e.g. Read exactly 1 paragraph or open the book"
              className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-1">
              Category Area
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                    category === cat
                      ? 'border-amber-800 bg-amber-50 text-amber-950 font-semibold'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-900 text-amber-50 hover:bg-amber-950 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {initialHabit ? 'Save Changes' : 'Activate Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
