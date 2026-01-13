'use client';

import { useTaskStore } from '@/stores';

export const StreakDisplay = () => {
  const tasks = useTaskStore(state => state.tasks);
  
  // Calculate current streak based on consecutive days with completed tasks
  const calculateCurrentStreak = () => {
    const completedDates = new Set(
      tasks
        .filter(t => t.status === 'completed' && t.completedAt)
        .map(t => new Date(t.completedAt!).toDateString())
    );
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      if (completedDates.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateCurrentStreak();
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">🔥</span>
            <span className="text-4xl font-bold">{currentStreak}</span>
          </div>
          <p className="text-orange-100 text-sm font-medium">Day Streak</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{totalCompleted}</p>
          <p className="text-orange-100 text-sm font-medium">Tasks Done</p>
        </div>
      </div>
      
      {currentStreak >= 3 && (
        <div className="mt-4 pt-4 border-t border-orange-400/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {currentStreak >= 21 ? '🏆' : currentStreak >= 7 ? '⭐' : '✨'}
            </span>
            <span className="text-sm font-medium">
              {currentStreak >= 21
                ? 'Master Level! 21+ days!'
                : currentStreak >= 7
                  ? 'Great! Keep the momentum!'
                  : 'Good start! Keep going!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
