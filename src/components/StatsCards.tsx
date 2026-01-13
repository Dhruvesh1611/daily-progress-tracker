'use client';

import { useTaskStore } from '@/stores';

export const StatsCards = () => {
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

  const stats = [
    {
      label: 'Health',
      count: dailyTasks.filter(t => t.category === 'Health').length,
      completed: dailyTasks.filter(t => t.category === 'Health' && t.status === 'completed').length,
      icon: '💪',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Study',
      count: dailyTasks.filter(t => t.category === 'Study').length,
      completed: dailyTasks.filter(t => t.category === 'Study' && t.status === 'completed').length,
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Work',
      count: dailyTasks.filter(t => t.category === 'Work').length,
      completed: dailyTasks.filter(t => t.category === 'Work' && t.status === 'completed').length,
      icon: '💼',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Personal',
      count: dailyTasks.filter(t => t.category === 'Personal').length,
      completed: dailyTasks.filter(t => t.category === 'Personal' && t.status === 'completed').length,
      icon: '🎯',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(stat => (
        <div
          key={stat.label}
          className={`${stat.bgColor} rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full">
              {stat.completed}/{stat.count}
            </span>
          </div>
          <p className="font-semibold text-gray-800">{stat.label}</p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
              style={{ width: stat.count > 0 ? `${(stat.completed / stat.count) * 100}%` : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
