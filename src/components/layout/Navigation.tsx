import React from 'react';
import { Target, CheckSquare, Calendar, Award, TrendingUp } from 'lucide-react';

interface NavigationProps {
  currentTab: 'focus' | 'habits' | 'trends' | 'roadmap';
  onSelectTab: (tab: 'focus' | 'habits' | 'trends' | 'roadmap') => void;
  activeDay: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
}

export const MobileTabBar: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeDay,
  completedHabitsCount,
  totalHabitsCount,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-stone-200/80 pb-safe shadow-lg"
    >
      <div className="grid grid-cols-4 h-16 items-center">
        {/* Tab 1: Today's Focus */}
        <button
          onClick={() => onSelectTab('focus')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'focus' ? 'text-amber-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Target className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 text-[10px] tabular-nums font-bold text-amber-900 bg-amber-100 rounded-full px-1">
              D{activeDay}
            </span>
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Today</span>
        </button>

        {/* Tab 2: Daily Habits */}
        <button
          onClick={() => onSelectTab('habits')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'habits' ? 'text-amber-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {totalHabitsCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[10px] tabular-nums font-bold text-amber-900 bg-amber-100 rounded-full px-1">
                {completedHabitsCount}/{totalHabitsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Habits</span>
        </button>

        {/* Tab 3: Consistency Trends */}
        <button
          onClick={() => onSelectTab('trends')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'trends' ? 'text-amber-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Trends</span>
        </button>

        {/* Tab 4: 30-Day Roadmap */}
        <button
          onClick={() => onSelectTab('roadmap')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'roadmap' ? 'text-amber-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Roadmap</span>
        </button>
      </div>
    </nav>
  );
};
