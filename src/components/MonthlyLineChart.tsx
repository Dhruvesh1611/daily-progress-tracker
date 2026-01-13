'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTaskStore } from '@/stores';

export const MonthlyLineChart = () => {
  const tasks = useTaskStore(state => state.tasks);
  
  const monthData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    // Get last 30 days
    for (let i = 29; i >= 0; i--) {
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
        date: date.getDate(),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        percentage,
        completed,
        total,
      });
    }
    
    return data;
  }, [tasks]);

  // Calculate average
  const average = useMemo(() => {
    const validDays = monthData.filter(d => d.total > 0);
    if (validDays.length === 0) return 0;
    return Math.round(validDays.reduce((sum, d) => sum + d.percentage, 0) / validDays.length);
  }, [monthData]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">📈</span>
          <h3 className="font-bold text-base sm:text-xl text-gray-800">Monthly Trend</h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm font-medium text-gray-500">Avg:</span>
          <span className={`text-base sm:text-lg font-bold ${average >= 70 ? 'text-green-600' : average >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
            {average}%
          </span>
        </div>
      </div>
      
      <div className="h-40 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthData}>
            <defs>
              <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              interval={6}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              width={30}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
                      <p className="font-semibold">{data.fullDate}</p>
                      <p className="text-blue-300">{data.percentage}% completed</p>
                      <p className="text-gray-400 text-xs">{data.completed}/{data.total} tasks</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="percentage" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorPercentage)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyLineChart;
