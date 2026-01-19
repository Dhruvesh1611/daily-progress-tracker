'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTaskStore } from '@/stores';

export const CategoryPieChart = () => {
  const tasks = useTaskStore(state => state.tasks);
  
  const categoryData = useMemo(() => {
    const categories: Record<string, { total: number; completed: number; color: string; icon: string }> = {
      Health: { total: 0, completed: 0, color: '#ef4444', icon: '💪' },
      Study: { total: 0, completed: 0, color: '#3b82f6', icon: '📚' },
      Work: { total: 0, completed: 0, color: '#8b5cf6', icon: '💼' },
      Personal: { total: 0, completed: 0, color: '#f59e0b', icon: '🎯' },
      Other: { total: 0, completed: 0, color: '#6b7280', icon: '📌' },
    };
    
    tasks.forEach(task => {
      if (categories[task.category]) {
        categories[task.category].total++;
        if (task.status === 'completed') {
          categories[task.category].completed++;
        }
      }
    });
    
    return Object.entries(categories)
      .filter(([_, data]) => data.total > 0)
      .map(([name, data]) => ({
        name,
        value: data.total,
        completed: data.completed,
        color: data.color,
        icon: data.icon,
        percentage: Math.round((data.completed / data.total) * 100),
      }));
  }, [tasks]);

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
          <span className="text-xl sm:text-2xl">🎯</span>
          <h3 className="font-bold text-base sm:text-xl text-gray-800">Categories</h3>
        </div>
        <div className="h-40 sm:h-48 flex items-center justify-center text-gray-400 text-sm sm:text-base font-medium">
          Add habits to see category breakdown
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
        <span className="text-xl sm:text-2xl">🎯</span>
        <h3 className="font-bold text-base sm:text-xl text-gray-800">By Category</h3>
      </div>
      
      <div className="h-36 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
        {categoryData.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <span className="text-lg sm:text-xl">{cat.icon}</span>
            <span className="font-medium text-gray-700">{cat.name}</span>
            <span className="text-gray-400 text-xs sm:text-sm">({cat.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
