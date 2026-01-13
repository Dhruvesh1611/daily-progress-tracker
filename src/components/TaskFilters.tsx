'use client';

import { TaskCategory, Status } from '@/types';

interface TaskFiltersProps {
  selectedCategory: TaskCategory | 'All';
  selectedStatus: Status | 'All';
  onCategoryChange: (category: TaskCategory | 'All') => void;
  onStatusChange: (status: Status | 'All') => void;
}

export const TaskFilters = ({
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}: TaskFiltersProps) => {
  const categories: (TaskCategory | 'All')[] = ['All', 'Health', 'Study', 'Work', 'Personal', 'Other'];
  const statuses: (Status | 'All')[] = ['All', 'pending', 'completed', 'skipped'];

  const getCategoryIcon = (cat: TaskCategory | 'All') => {
    const icons: Record<string, string> = {
      All: '📋',
      Health: '💪',
      Study: '📚',
      Work: '💼',
      Personal: '🎯',
      Other: '📌',
    };
    return icons[cat] || '📌';
  };

  const getStatusLabel = (status: Status | 'All') => {
    const labels: Record<string, string> = {
      All: 'All',
      pending: '⏳ Pending',
      completed: '✅ Done',
      skipped: '⏭️ Skipped',
    };
    return labels[status];
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Category Filter */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="sm:w-auto">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Status
        </label>
        <select
          value={selectedStatus}
          onChange={e => onStatusChange(e.target.value as Status | 'All')}
          className="w-full sm:w-40 px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
