'use client';

import { useTaskStore } from '@/stores';
import { calculateDailyCompletion } from '@/lib/utils';

export const DailyProgressDisplay = () => {
  const tasks = useTaskStore(state => state.tasks);
  const selectedDate = useTaskStore(state => state.selectedDate);

  const dailyTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  });

  const completion = calculateDailyCompletion(dailyTasks);
  const completed = dailyTasks.filter(t => t.status === 'completed').length;
  const pending = dailyTasks.filter(t => t.status === 'pending').length;
  const skipped = dailyTasks.filter(t => t.status === 'skipped').length;
  const total = dailyTasks.length;

  const getCompletionGradient = () => {
    if (completion >= 80) return 'from-green-500 to-emerald-500';
    if (completion >= 50) return 'from-blue-500 to-cyan-500';
    if (completion >= 30) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getCompletionEmoji = () => {
    if (completion >= 80) return '🎉';
    if (completion >= 50) return '💪';
    if (completion >= 30) return '📈';
    if (completion > 0) return '🌱';
    return '🎯';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Today's Progress</h2>
          <p className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="text-4xl">{getCompletionEmoji()}</div>
      </div>

      {/* Main Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-36 h-36">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="url(#progressGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${completion * 3.77} 377`}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={completion >= 50 ? '#10b981' : '#f59e0b'} />
                <stop offset="100%" stopColor={completion >= 50 ? '#059669' : '#ef4444'} />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{completion}%</span>
            <span className="text-xs text-gray-500 font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{completed}</div>
          <div className="text-xs font-medium text-green-700">Completed</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{pending}</div>
          <div className="text-xs font-medium text-amber-700">Pending</div>
        </div>
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gray-600">{skipped}</div>
          <div className="text-xs font-medium text-gray-700">Skipped</div>
        </div>
      </div>

      {/* Progress bar below */}
      <div className="mt-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getCompletionGradient()} transition-all duration-700`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span>{completed}/{total} tasks</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default DailyProgressDisplay;
