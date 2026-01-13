'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/stores';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'total' | 'category';
  unlocked: boolean;
}

export const BadgesDisplay = () => {
  const tasks = useTaskStore(state => state.tasks);

  const badges = useMemo(() => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    
    // Calculate streak
    const completedDates = new Set<string>();
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        completedDates.add(new Date(task.completedAt).toDateString());
      }
    });

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (completedDates.has(checkDate.toDateString())) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    const allBadges: Badge[] = [
      {
        id: 'first_step',
        name: 'First Step',
        description: 'Complete your first habit',
        icon: '🌱',
        requirement: 1,
        type: 'total',
        unlocked: completedCount >= 1,
      },
      {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Complete 10 habits',
        icon: '🚀',
        requirement: 10,
        type: 'total',
        unlocked: completedCount >= 10,
      },
      {
        id: 'habit_builder',
        name: 'Habit Builder',
        description: 'Complete 50 habits',
        icon: '⚡',
        requirement: 50,
        type: 'total',
        unlocked: completedCount >= 50,
      },
      {
        id: 'centurion',
        name: 'Centurion',
        description: 'Complete 100 habits',
        icon: '💯',
        requirement: 100,
        type: 'total',
        unlocked: completedCount >= 100,
      },
      {
        id: 'streak_3',
        name: 'On Fire',
        description: '3 day streak',
        icon: '🔥',
        requirement: 3,
        type: 'streak',
        unlocked: currentStreak >= 3,
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: '7 day streak',
        icon: '⭐',
        requirement: 7,
        type: 'streak',
        unlocked: currentStreak >= 7,
      },
      {
        id: 'streak_21',
        name: 'Habit Master',
        description: '21 day streak',
        icon: '🏆',
        requirement: 21,
        type: 'streak',
        unlocked: currentStreak >= 21,
      },
      {
        id: 'streak_30',
        name: 'Unstoppable',
        description: '30 day streak',
        icon: '👑',
        requirement: 30,
        type: 'streak',
        unlocked: currentStreak >= 30,
      },
    ];

    return allBadges;
  }, [tasks]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">🏅</span>
          <h3 className="font-bold text-lg sm:text-xl text-gray-800">Achievements</h3>
        </div>
        <span className="text-xs sm:text-sm font-bold text-gray-600 bg-gray-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          {unlockedCount}/{badges.length}
        </span>
      </div>

      <div className="p-3 sm:p-5">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center p-2 sm:p-4 rounded-lg transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-gray-50 border border-gray-100 opacity-50'
              }`}
              title={badge.description}
            >
              <span className={`text-2xl sm:text-3xl mb-1 sm:mb-2 ${badge.unlocked ? '' : 'grayscale'}`}>
                {badge.icon}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center leading-tight">
                {badge.name}
              </span>
              {badge.unlocked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgesDisplay;
