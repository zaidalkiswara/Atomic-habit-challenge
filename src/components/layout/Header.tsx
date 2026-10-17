import React from 'react';
import { Database, Plus } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface HeaderProps {
  currentTab: 'focus' | 'habits' | 'trends' | 'roadmap';
  onSelectTab: (tab: 'focus' | 'habits' | 'trends' | 'roadmap') => void;
  onOpenNewHabitModal: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewHabitModal,
  onOpenBackupModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in editorial face) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#today"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('focus');
            }}
            className="text-lg font-bold font-editorial text-stone-900 tracking-tight whitespace-nowrap hover:text-amber-900 transition-colors"
          >
            Atomic Habits
          </a>
          <span className="hidden sm:inline text-xs text-stone-500 font-normal">
            · 30-Day System
          </span>
        </div>

        {/* Zone 2: Clean single-line desktop navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onSelectTab('focus')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'focus'
                ? 'border-amber-800 text-stone-950 font-semibold'
                : 'border-transparent hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            Today’s Focus
          </button>
          <button
            onClick={() => onSelectTab('habits')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'habits'
                ? 'border-amber-800 text-stone-950 font-semibold'
                : 'border-transparent hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            Daily Habits
          </button>
          <button
            onClick={() => onSelectTab('trends')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'trends'
                ? 'border-amber-800 text-stone-950 font-semibold'
                : 'border-transparent hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => onSelectTab('roadmap')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'roadmap'
                ? 'border-amber-800 text-stone-950 font-semibold'
                : 'border-transparent hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            30-Day Roadmap
          </button>
        </nav>

        {/* Zone 3: Primary Action + Utility Triggers */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <PWAInstallButton />

          <button
            onClick={onOpenBackupModal}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="Backup & Restore Data (JSON)"
            aria-label="Backup and Restore Data"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewHabitModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-900 text-amber-50 hover:bg-amber-950 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Habit</span>
            <span className="sm:hidden">Habit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
