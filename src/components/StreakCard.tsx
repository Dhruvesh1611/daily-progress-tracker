'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/stores';

export const StreakCard = () => {
  const tasks = useTaskStore(state => state.tasks);
  
  const streakData = useMemo(() => {
    // Get unique dates with completed tasks
    const completedDates = new Set<string>();
    
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        completedDates.add(new Date(task.completedAt).toDateString());
      }
    });

    // Calculate current streak
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

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Array.from(completedDates).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    sortedDates.forEach((dateStr, idx) => {
      if (idx === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[idx - 1]);
        const currDate = new Date(dateStr);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    });

    // Get level
    let level = 1;
    let levelName = 'Beginner';
    let nextMilestone = 3;
    
    if (currentStreak >= 21) {
      level = 4;
      levelName = 'Master';
      nextMilestone = 30;
    } else if (currentStreak >= 7) {
      level = 3;
      levelName = 'Committed';
      nextMilestone = 21;
    } else if (currentStreak >= 3) {
      level = 2;
      levelName = 'Rising';
      nextMilestone = 7;
    }

    return { currentStreak, longestStreak, level, levelName, nextMilestone };
  }, [tasks]);

  // Generate streak visualization (last 30 days)
  const streakViz = useMemo(() => {
    const viz = [];
    const today = new Date();
    const completedDates = new Set<string>();
    
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        completedDates.add(new Date(task.completedAt).toDateString());
      }
    });

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      viz.push({
        date: date.toDateString(),
        completed: completedDates.has(date.toDateString()),
        isToday: i === 0,
      });
    }
    
    return viz;
  }, [tasks]);

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-4 sm:p-6 text-white">
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-5xl">🔥</span>
            <div>
              <p className="text-4xl sm:text-6xl font-bold">{streakData.currentStreak}</p>
              <p className="text-orange-100 text-sm sm:text-base font-medium">Day Streak</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-white/20 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
            <p className="text-xs sm:text-sm text-orange-100">Level {streakData.level}</p>
            <p className="font-bold text-base sm:text-lg">{streakData.levelName}</p>
          </div>
        </div>
      </div>

      {/* Streak Visualization */}
      <div className="mb-4 sm:mb-5">
        <p className="text-xs sm:text-sm font-medium text-orange-100 mb-2 sm:mb-3">Last 30 Days</p>
        <div className="flex gap-0.5 sm:gap-1 flex-wrap">
          {streakViz.map((day, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm ${
                day.completed 
                  ? 'bg-white' 
                  : day.isToday 
                    ? 'bg-white/50 ring-1 ring-white' 
                    : 'bg-white/20'
              }`}
              title={day.date}
            />
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/20">
        <div>
          <p className="text-orange-100 text-xs sm:text-sm font-medium">Longest Streak</p>
          <p className="font-bold text-lg sm:text-xl">{streakData.longestStreak} days</p>
        </div>
        <div className="text-right">
          <p className="text-orange-100 text-xs sm:text-sm font-medium">Next Milestone</p>
          <p className="font-bold text-lg sm:text-xl">{streakData.nextMilestone} days</p>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
