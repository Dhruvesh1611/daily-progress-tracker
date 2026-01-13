'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTaskStore } from '@/stores';

export const WeeklyBarChart = () => {
  const tasks = useTaskStore(state => state.tasks);
  
  const weekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter(t => t.status === 'completed').length;
      const total = dayTasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      data.push({
        day: days[date.getDay()],
        date: date.getDate(),
        percentage,
        completed,
        total,
        isToday: i === 0,
      });
    }
    
    return data;
  }, [tasks]);

  const getBarColor = (percentage: number, isToday: boolean) => {
    if (isToday) return '#3b82f6';
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 50) return '#eab308';
    if (percentage > 0) return '#f97316';
    return '#e5e7eb';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">📊</span>
          <h3 className="font-bold text-base sm:text-xl text-gray-800">Weekly Overview</h3>
        </div>
        <span className="text-xs sm:text-sm font-medium text-gray-500">Last 7 days</span>
      </div>
      
      <div className="h-40 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData} barCategoryGap="15%">
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              width={35}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
                      <p className="font-semibold">{data.day} {data.date}</p>
                      <p className="text-gray-300">{data.percentage}% completed</p>
                      <p className="text-gray-400 text-xs">{data.completed}/{data.total} tasks</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {weekData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.percentage, entry.isToday)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>80%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>50-79%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>&lt;50%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyBarChart;
