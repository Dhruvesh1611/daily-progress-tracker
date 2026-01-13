'use client';

import { useState, useMemo } from 'react';
import { useTaskStore } from '@/stores';
import { Task } from '@/types';

// Get dates for current week
const getWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface HabitRowProps {
  habit: Task;
  weekDates: Date[];
  completions: Map<string, boolean>;
  onToggle: (habitId: string, date: Date) => void;
}

const HabitRow = ({ habit, weekDates, completions, onToggle }: HabitRowProps) => {
  const getCompletionForDate = (date: Date) => {
    const key = `${habit.id}-${date.toDateString()}`;
    return completions.get(key) || false;
  };

  const completedDays = weekDates.filter(d => getCompletionForDate(d)).length;
  const progress = Math.round((completedDays / 7) * 100);

  const getCategoryEmoji = () => {
    const emojis: Record<string, string> = {
      Health: '💪',
      Study: '📚',
      Work: '💼',
      Personal: '🎯',
      Other: '📌',
    };
    return emojis[habit.category] || '📌';
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Habit Name */}
      <td className="py-3 sm:py-4 px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl">{getCategoryEmoji()}</span>
          <span className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">{habit.title}</span>
        </div>
      </td>
      
      {/* Progress Bar */}
      <td className="py-3 sm:py-4 px-2 sm:px-3 w-24 sm:w-32">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex-1 h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : progress > 0 ? 'bg-amber-500' : 'bg-gray-200'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-600 w-8 sm:w-10">{progress}%</span>
        </div>
      </td>

      {/* Day Checkboxes */}
      {weekDates.map((date, idx) => {
        const isCompleted = getCompletionForDate(date);
        const isToday = date.toDateString() === new Date().toDateString();
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
        
        return (
          <td key={idx} className="py-3 px-2 text-center">
            <button
              onClick={() => onToggle(habit.id, date)}
              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-blue-500 text-white'
                  : isToday
                    ? 'bg-blue-50 border-2 border-blue-300 hover:bg-blue-100'
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {isCompleted && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </td>
        );
      })}
    </tr>
  );
};

export const WeeklyHabitTable = () => {
  const tasks = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const [completions, setCompletions] = useState<Map<string, boolean>>(new Map());
  
  const weekDates = useMemo(() => getWeekDates(), []);
  const habits = tasks.filter(t => t.type === 'Habit');

  const handleToggle = (habitId: string, date: Date) => {
    const key = `${habitId}-${date.toDateString()}`;
    setCompletions(prev => {
      const newMap = new Map(prev);
      newMap.set(key, !prev.get(key));
      return newMap;
    });
  };

  // Calculate daily progress
  const getDailyProgress = (date: Date) => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => {
      const key = `${h.id}-${date.toDateString()}`;
      return completions.get(key);
    }).length;
    return Math.round((completed / habits.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">📅</span>
          <h3 className="font-bold text-lg sm:text-xl text-gray-800">This Week</h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase">Habit</th>
              <th className="py-3 px-3 text-left text-sm font-bold text-gray-600 uppercase">Progress</th>
              {weekDates.map((date, idx) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <th key={idx} className={`py-3 px-2 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                    <div className="text-sm font-bold text-gray-600">{dayNames[idx]}</div>
                    <div className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                      {date.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  <p className="text-sm">No habits yet. Add habits to track them weekly!</p>
                </td>
              </tr>
            ) : (
              habits.map(habit => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  weekDates={weekDates}
                  completions={completions}
                  onToggle={handleToggle}
                />
              ))
            )}
          </tbody>
          {habits.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="py-2 px-4 text-sm font-semibold text-gray-600">Daily Progress</td>
                <td></td>
                {weekDates.map((date, idx) => {
                  const progress = getDailyProgress(date);
                  return (
                    <td key={idx} className="py-2 px-2 text-center">
                      <span className={`text-xs font-bold ${
                        progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-blue-600' : progress > 0 ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {progress}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default WeeklyHabitTable;
