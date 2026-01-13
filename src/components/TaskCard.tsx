'use client';

import { Task } from '@/types';
import { useTaskStore } from '@/stores';

interface TaskCardProps {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const updateTask = useTaskStore(state => state.updateTask);
  const deleteTask = useTaskStore(state => state.deleteTask);

  const toggleStatus = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined,
    });
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { status: 'skipped' });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      deleteTask(task.id);
    }
  };

  const getCategoryConfig = () => {
    const configs: Record<string, { icon: string; gradient: string; bg: string }> = {
      Health: { icon: '💪', gradient: 'from-red-500 to-pink-500', bg: 'bg-red-50' },
      Study: { icon: '📚', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
      Work: { icon: '💼', gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
      Personal: { icon: '🎯', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
      Other: { icon: '📌', gradient: 'from-gray-500 to-slate-500', bg: 'bg-gray-50' },
    };
    return configs[task.category] || configs.Other;
  };

  const config = getCategoryConfig();
  const isCompleted = task.status === 'completed';
  const isSkipped = task.status === 'skipped';

  return (
    <div
      className={`group relative rounded-xl p-4 mb-3 transition-all duration-200 hover:shadow-lg border-2 ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : isSkipped
            ? 'bg-gray-50 border-gray-200 opacity-60'
            : `${config.bg} border-transparent hover:border-gray-200`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleStatus}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {isCompleted && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{config.icon}</span>
            <h3
              className={`font-semibold text-gray-800 truncate ${
                isCompleted ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className={`text-sm mb-2 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${config.gradient} text-white`}
            >
              {task.category}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
              {task.type === 'Habit' ? '🔄 ' : '✓ '}{task.type}
            </span>
            <span className="text-xs text-gray-500">
              {task.frequency}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isCompleted && !isSkipped && (
            <button
              onClick={handleSkip}
              className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"
              title="Skip"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            ✓ Done
          </span>
        </div>
      )}
      {isSkipped && (
        <div className="absolute top-2 right-2">
          <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            Skipped
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
