'use client';

import { Task } from '@/types';
import { useTaskStore } from '@/stores';

interface HabitListProps {
  onAddHabit: () => void;
}

export const HabitList = ({ onAddHabit }: HabitListProps) => {
  const tasks = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const deleteTask = useTaskStore(state => state.deleteTask);

  const habits = tasks.filter(t => t.type === 'Habit');

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      Health: '💪',
      Study: '📚',
      Work: '💼',
      Personal: '🎯',
      Other: '📌',
    };
    return emojis[category] || '📌';
  };

  const toggleToday = (habit: Task) => {
    const newStatus = habit.status === 'completed' ? 'pending' : 'completed';
    updateTask(habit.id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">📋</span>
          <h3 className="font-bold text-lg sm:text-xl text-gray-800">Habit List</h3>
        </div>
        <span className="text-xs sm:text-sm text-gray-500 italic hidden sm:inline">Progress not Perfection</span>
      </div>

      {/* Habit Items */}
      <div className="divide-y divide-gray-100">
        {habits.length === 0 ? (
          <div className="px-3 sm:px-4 py-6 sm:py-8 text-center">
            <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">No habits created yet</p>
            <button
              onClick={onAddHabit}
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
            >
              + Add your first habit
            </button>
          </div>
        ) : (
          habits.map(habit => (
            <div
              key={habit.id}
              className="px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 hover:bg-gray-50/50 transition-colors group"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleToday(habit)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  habit.status === 'completed'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {habit.status === 'completed' && (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Emoji */}
              <span className="text-lg sm:text-xl">{getCategoryEmoji(habit.category)}</span>

              {/* Title */}
              <span className={`flex-1 text-sm sm:text-base font-medium truncate ${
                habit.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}>
                {habit.title}
              </span>

              {/* Delete button (visible on mobile, hover on desktop) */}
              <button
                onClick={() => deleteTask(habit.id)}
                className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Habit Button */}
      {habits.length > 0 && (
        <div className="px-3 sm:px-4 py-2 border-t border-gray-100">
          <button
            onClick={onAddHabit}
            className="w-full py-2 text-xs sm:text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Habit
          </button>
        </div>
      )}
    </div>
  );
};

export default HabitList;
