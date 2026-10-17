import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { Habit, HabitLog } from '../../types';
import { getDateOffset, getTodayDateString } from '../../utils/date';

interface MonthlyCompletionChartProps {
  habits: Habit[];
  logs: HabitLog[];
}

interface MonthlyDataPoint {
  monthKey: string;     // YYYY-MM
  label: string;        // e.g. "May 2026"
  shortLabel: string;   // e.g. "May"
  completionRate: number; // 0 - 100%
  twoMinuteRate: number;  // 0 - 100%
  totalPossible: number;
  totalCompleted: number;
  recoveredMisses: number;
}

interface DailyDataPoint {
  date: string;         // YYYY-MM-DD
  dayLabel: string;     // e.g. "Oct 12"
  completionRate: number; // 0 - 100%
  movingAvg: number;    // 7-day rolling average
  twoMinuteCount: number;
  totalHabits: number;
}

export const MonthlyCompletionChart: React.FC<MonthlyCompletionChartProps> = ({
  habits,
  logs,
}) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');

  // Filter logs if a specific habit is selected
  const activeHabits = useMemo(() => {
    if (selectedHabitId === 'all') return habits;
    return habits.filter((h) => h.id === selectedHabitId);
  }, [habits, selectedHabitId]);

  const activeHabitIds = useMemo(() => new Set(activeHabits.map((h) => h.id)), [activeHabits]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => activeHabitIds.has(l.habitId));
  }, [logs, activeHabitIds]);

  // Aggregate by Month for the past 6 months
  const monthlyData: MonthlyDataPoint[] = useMemo(() => {
    const today = new Date();
    const months: MonthlyDataPoint[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const monthKey = `${year}-${String(monthNum).padStart(2, '0')}`;
      const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const shortLabel = d.toLocaleDateString(undefined, { month: 'short' });

      // Determine days in this month up to today
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === monthNum;
      const daysToCount = isCurrentMonth ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

      // Filter logs belonging to this month
      const monthLogs = filteredLogs.filter((l) => l.date.startsWith(monthKey));

      const totalCompleted = monthLogs.filter((l) => l.completed).length;
      const twoMinuteCount = monthLogs.filter((l) => l.completed && l.usedTwoMinuteVersion).length;

      // Expected total completions = active habits count * days evaluated
      const totalPossible = Math.max(1, activeHabits.length * daysToCount);
      const completionRate =
        activeHabits.length > 0
          ? Math.min(100, Math.round((totalCompleted / totalPossible) * 100))
          : 0;
      const twoMinuteRate = totalCompleted > 0 ? Math.round((twoMinuteCount / totalCompleted) * 100) : 0;

      months.push({
        monthKey,
        label,
        shortLabel,
        completionRate,
        twoMinuteRate,
        totalPossible,
        totalCompleted,
        recoveredMisses: 0,
      });
    }

    return months;
  }, [filteredLogs, activeHabits]);

  // Daily 30-Day Compounding Trajectory
  const dailyData: DailyDataPoint[] = useMemo(() => {
    const todayStr = getTodayDateString();
    const points: DailyDataPoint[] = [];

    // Pre-index logs by `${date}`
    const logsByDate = new Map<string, HabitLog[]>();
    filteredLogs.forEach((l) => {
      const arr = logsByDate.get(l.date) || [];
      arr.push(l);
      logsByDate.set(l.date, arr);
    });

    const totalHabitsCount = Math.max(1, activeHabits.length);

    for (let i = 29; i >= 0; i--) {
      const dateStr = getDateOffset(todayStr, -i);
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dayLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const dayLogs = logsByDate.get(dateStr) || [];
      const completedCount = dayLogs.filter((l) => l.completed).length;
      const twoMinuteCount = dayLogs.filter((l) => l.completed && l.usedTwoMinuteVersion).length;
      const rate =
        activeHabits.length > 0
          ? Math.min(100, Math.round((completedCount / totalHabitsCount) * 100))
          : 0;

      points.push({
        date: dateStr,
        dayLabel,
        completionRate: rate,
        movingAvg: rate, // will compute rolling window below
        twoMinuteCount,
        totalHabits: totalHabitsCount,
      });
    }

    // Compute 7-day rolling moving average
    for (let i = 0; i < points.length; i++) {
      const windowStart = Math.max(0, i - 6);
      const slice = points.slice(windowStart, i + 1);
      const sum = slice.reduce((acc, p) => acc + p.completionRate, 0);
      points[i].movingAvg = Math.round(sum / slice.length);
    }

    return points;
  }, [filteredLogs, activeHabits]);

  // High-level consistency statistics
  const currentMonthRate = monthlyData[monthlyData.length - 1]?.completionRate || 0;
  const bestMonthRate = useMemo(() => {
    return Math.max(...monthlyData.map((m) => m.completionRate), 0);
  }, [monthlyData]);

  // "Never Miss Twice" compliance rate calculation
  const neverMissTwiceStats = useMemo(() => {
    const logsMap = new Map<string, boolean>();
    filteredLogs.forEach((l) => {
      logsMap.set(`${l.habitId}_${l.date}`, l.completed);
    });

    const todayStr = getTodayDateString();
    let missedSingleDays = 0;
    let recoveredNextDay = 0;

    activeHabits.forEach((habit) => {
      for (let offset = 28; offset >= 1; offset--) {
        const dMinus1 = getDateOffset(todayStr, -(offset + 1));
        const dCurrent = getDateOffset(todayStr, -offset);
        const dPlus1 = getDateOffset(todayStr, -(offset - 1));

        const compBefore = logsMap.get(`${habit.id}_${dMinus1}`) ?? true;
        const compDay = logsMap.get(`${habit.id}_${dCurrent}`) ?? false;
        const compAfter = logsMap.get(`${habit.id}_${dPlus1}`) ?? false;

        // If had a streak and missed one day
        if (compBefore && !compDay) {
          missedSingleDays++;
          if (compAfter) {
            recoveredNextDay++;
          }
        }
      }
    });

    const recoveryRate =
      missedSingleDays > 0 ? Math.round((recoveredNextDay / missedSingleDays) * 100) : 100;

    return {
      missedSingleDays,
      recoveredNextDay,
      recoveryRate,
    };
  }, [filteredLogs, activeHabits]);

  // Total 2-minute rule utilization
  const totalCompletedLogs = filteredLogs.filter((l) => l.completed).length;
  const totalTwoMinuteLogs = filteredLogs.filter((l) => l.completed && l.usedTwoMinuteVersion).length;
  const twoMinutePercentage =
    totalCompletedLogs > 0 ? Math.round((totalTwoMinuteLogs / totalCompletedLogs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & View Controls */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-1">
              Consistency Analytics
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-editorial text-stone-900">
              Long-Term Completion Trends
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Measure your 1% compounding curve and verify your adherence to the “Never Miss Twice” rule.
            </p>
          </div>

          {/* View Mode Toggle (Monthly Bar vs Daily Rolling Area) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl text-xs font-medium shrink-0">
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-800" />
              <span>Monthly Overview</span>
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5 text-amber-800" />
              <span>30-Day Trajectory</span>
            </button>
          </div>
        </div>

        {/* Filter by Specific Habit or Overall */}
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Habit Focus:</span>
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 cursor-pointer"
            >
              <option value="all">All Habits (System Aggregate)</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-800" />
              <span>Completion Rate</span>
            </div>
            {viewMode === 'daily' && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-amber-600" />
                <span>7-Day Moving Avg</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-200" />
              <span>80% Mastery Benchmark</span>
            </div>
          </div>
        </div>

        {/* Primary Recharts Visualization */}
        <div className="mt-6 w-full h-[280px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'monthly' ? (
              <ComposedChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E1D8" />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#78716C"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E7E1D8' }}
                />
                <YAxis
                  stroke="#78716C"
                  fontSize={12}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  unit="%"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(146, 64, 14, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MonthlyDataPoint;
                      return (
                        <div className="rounded-xl bg-white border border-stone-200 p-3 shadow-lg text-xs space-y-1">
                          <div className="font-semibold text-stone-900 font-editorial">
                            {data.label}
                          </div>
                          <div className="text-stone-600 flex items-center justify-between gap-4">
                            <span>Completion Rate:</span>
                            <span className="font-bold tabular-nums text-amber-900 text-sm">
                              {data.completionRate}%
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center justify-between gap-4">
                            <span>Votes Cast:</span>
                            <span className="tabular-nums font-medium text-stone-700">
                              {data.totalCompleted} / {data.totalPossible}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center justify-between gap-4">
                            <span>2-Minute Gateway:</span>
                            <span className="tabular-nums font-medium text-amber-700">
                              {data.twoMinuteRate}% of completions
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* 80% Sustainable Habit Mastery Baseline */}
                <ReferenceLine
                  y={80}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '80% Target',
                    position: 'insideTopRight',
                    fill: '#92400E',
                    fontSize: 10,
                  }}
                />
                <Bar
                  dataKey="completionRate"
                  fill="#92400E"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#D97706"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#FAF8F5', stroke: '#92400E', strokeWidth: 2 }}
                />
              </ComposedChart>
            ) : (
              <ComposedChart
                data={dailyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#92400E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#92400E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E1D8" />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#78716C"
                  fontSize={11}
                  interval={4}
                  tickLine={false}
                  axisLine={{ stroke: '#E7E1D8' }}
                />
                <YAxis
                  stroke="#78716C"
                  fontSize={12}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  unit="%"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyDataPoint;
                      return (
                        <div className="rounded-xl bg-white border border-stone-200 p-3 shadow-lg text-xs space-y-1">
                          <div className="font-semibold text-stone-900 font-editorial">
                            {data.dayLabel}
                          </div>
                          <div className="text-stone-600 flex items-center justify-between gap-4">
                            <span>Daily Completion:</span>
                            <span className="font-bold tabular-nums text-amber-900">
                              {data.completionRate}%
                            </span>
                          </div>
                          <div className="text-stone-600 flex items-center justify-between gap-4">
                            <span>7-Day Moving Avg:</span>
                            <span className="font-bold tabular-nums text-amber-700">
                              {data.movingAvg}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#B45309"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#amberGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  stroke="#92400E"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Quantitative Rigor / Key Consistency Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Current Month Rate */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-800" />
            <span>Monthly Rate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tabular-nums">
            {currentMonthRate}%
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {currentMonthRate >= 80 ? 'In the Mastery Zone (>=80%)' : 'Building compound momentum'}
          </div>
        </div>

        {/* Metric 2: "Never Miss Twice" Recovery Adherence */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Never Miss Twice</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tabular-nums">
            {neverMissTwiceStats.recoveryRate}%
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {neverMissTwiceStats.recoveredNextDay} of {neverMissTwiceStats.missedSingleDays || 1} misses recovered next day
          </div>
        </div>

        {/* Metric 3: 2-Minute Gateway Rule Ratio */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>2-Min Rule Used</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tabular-nums">
            {twoMinutePercentage}%
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Standardizing before optimizing
          </div>
        </div>

        {/* Metric 4: Best Consistency Month */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-900" />
            <span>Peak Consistency</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tabular-nums">
            {bestMonthRate}%
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Highest historical monthly rate
          </div>
        </div>
      </div>
    </div>
  );
};
