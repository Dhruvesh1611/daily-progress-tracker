import type { Task, UserStats } from '@/types';

/**
 * Calculate daily completion percentage
 * Formula: completedTasks / totalTasks * 100
 */
export const calculateDailyCompletion = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
};

/**
 * Get color for completion percentage
 * Green: 80-100%, Yellow: 30-79%, Red: 0-29%
 */
export const getCompletionColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
};

/**
 * Calculate streak logic
 * Continues if task completed yesterday, breaks if missed
 */
export const calculateStreak = (
  completionHistory: { date: Date; completed: boolean }[]
): { current: number; longest: number } => {
  if (completionHistory.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sortedHistory = [...completionHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check if today or yesterday was completed to continue streak
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayCompleted = sortedHistory.some(
    h => isSameDay(h.date, today) && h.completed
  );
  const yesterdayCompleted = sortedHistory.some(
    h => isSameDay(h.date, yesterday) && h.completed
  );

  // Only count streak if recently active
  if (todayCompleted || yesterdayCompleted) {
    currentStreak = 1;
  }

  // Calculate longest streak
  for (const entry of sortedHistory) {
    if (entry.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current: currentStreak, longest: longestStreak };
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get tasks for a specific date
 */
export const getTasksForDate = (tasks: Task[], date: Date): Task[] => {
  return tasks.filter(task => {
    if (!task.completedAt) return false;
    return isSameDay(new Date(task.completedAt), date);
  });
};

/**
 * Calculate user statistics
 */
export const calculateUserStats = (tasks: Task[]): UserStats => {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;

  return {
    totalTasks: total,
    completedTasks: completed,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    totalDays: new Set(
      tasks.map(t => new Date(t.createdAt).toDateString())
    ).size,
  };
};

/**
 * Group tasks by category
 */
export const groupTasksByCategory = (
  tasks: Task[]
): Record<string, Task[]> => {
  return tasks.reduce(
    (acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get last N days of data
 */
export const getLastNDays = (
  completionData: { date: Date; completion: number }[],
  n: number
): { date: Date; completion: number }[] => {
  const today = new Date();
  const result = [];

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const found = completionData.find(d => isSameDay(d.date, date));
    result.push(found || { date, completion: 0 });
  }

  return result;
};
