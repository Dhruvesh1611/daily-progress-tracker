'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/stores';

export const StatsOverview = () => {
  const tasks = useTaskStore(state => state.tasks);

  const stats = useMemo(() => {
    const today = new Date();
    const habits = tasks.filter(t => t.type === 'Habit');
    
    // Today's stats
    const todayTasks = habits.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate.toDateString() === today.toDateString();
    });
    const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;
    const todayTotal = todayTasks.length;
    const todayRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // This week's stats
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekTasks = habits.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate >= startOfWeek;
    });
    const weekCompleted = weekTasks.filter(t => t.status === 'completed').length;
    const weekTotal = weekTasks.length;
    const weekRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    // This month's stats
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTasks = habits.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate >= startOfMonth;
    });
    const monthCompleted = monthTasks.filter(t => t.status === 'completed').length;
    const monthTotal = monthTasks.length;
    const monthRate = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;

    // Best day calculation
    const dayStats: Record<string, { completed: number; total: number }> = {};
    habits.forEach(task => {
      const dateStr = new Date(task.createdAt).toDateString();
      if (!dayStats[dateStr]) {
        dayStats[dateStr] = { completed: 0, total: 0 };
      }
      dayStats[dateStr].total++;
      if (task.status === 'completed') {
        dayStats[dateStr].completed++;
      }
    });

    let bestDay = { date: '', rate: 0 };
    Object.entries(dayStats).forEach(([date, stats]) => {
      const rate = Math.round((stats.completed / stats.total) * 100);
      if (rate > bestDay.rate) {
        bestDay = { date, rate };
      }
    });

    return {
      today: { completed: todayCompleted, total: todayTotal, rate: todayRate },
      week: { completed: weekCompleted, total: weekTotal, rate: weekRate },
      month: { completed: monthCompleted, total: monthTotal, rate: monthRate },
      bestDay,
      totalHabits: habits.length,
      totalCompleted: habits.filter(t => t.status === 'completed').length,
    };
  }, [tasks]);

  const statCards = [
    {
      title: 'Today',
      value: `${stats.today.rate}%`,
      subtitle: `${stats.today.completed}/${stats.today.total} done`,
      icon: '📅',
      color: stats.today.rate >= 80 ? 'text-green-600' : stats.today.rate >= 50 ? 'text-amber-600' : 'text-red-500',
    },
    {
      title: 'This Week',
      value: `${stats.week.rate}%`,
      subtitle: `${stats.week.completed}/${stats.week.total} done`,
      icon: '📊',
      color: stats.week.rate >= 80 ? 'text-green-600' : stats.week.rate >= 50 ? 'text-amber-600' : 'text-red-500',
    },
    {
      title: 'This Month',
      value: `${stats.month.rate}%`,
      subtitle: `${stats.month.completed}/${stats.month.total} done`,
      icon: '📈',
      color: stats.month.rate >= 80 ? 'text-green-600' : stats.month.rate >= 50 ? 'text-amber-600' : 'text-red-500',
    },
    {
      title: 'Best Day',
      value: stats.bestDay.rate > 0 ? `${stats.bestDay.rate}%` : '-',
      subtitle: stats.bestDay.date ? new Date(stats.bestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No data',
      icon: '🏆',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <span className="text-xl sm:text-2xl">{stat.icon}</span>
            <span className="text-xs sm:text-sm font-bold text-gray-600 uppercase">{stat.title}</span>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
