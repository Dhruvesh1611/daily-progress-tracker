'use client';

import { useMemo, useState } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export const MoodChart = () => {
  const [viewMode, setViewMode] = useState('week');
  
  const moodData = useMemo(() => {
    const today = new Date();
    const data = [];
    const days = viewMode === 'week' ? 7 : 30;
    
    const moods = ['😊', '😐', '😞'];
    const moodValues = { '😊': 3, '😐': 2, '😞': 1 };
    const moodLabels = { '😊': 'Great', '😐': 'Okay', '😞': 'Tough' };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const randomMood = moods[Math.floor(Math.random() * 3)];
      
      data.push({
        date: date.getDate(),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: randomMood,
        moodValue: moodValues[randomMood],
        moodLabel: moodLabels[randomMood],
        isToday: i === 0,
      });
    }
    
    return data;
  }, [viewMode]);

  const moodStats = useMemo(() => {
    const counts = { great: 0, okay: 0, tough: 0 };
    moodData.forEach(d => {
      if (d.moodValue === 3) counts.great++;
      else if (d.moodValue === 2) counts.okay++;
      else counts.tough++;
    });
    const total = moodData.length;
    return {
      great: Math.round((counts.great / total) * 100),
      okay: Math.round((counts.okay / total) * 100),
      tough: Math.round((counts.tough / total) * 100),
    };
  }, [moodData]);

  const getBarColor = (value) => {
    if (value === 3) return '#22c55e';
    if (value === 2) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">📈</span>
          <h3 className="font-bold text-lg sm:text-xl text-gray-800">Mood Tracker</h3>
        </div>
        <div className="flex gap-1 bg-gray-200 rounded-lg p-0.5 sm:p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center border border-green-100">
            <span className="text-xl sm:text-2xl block mb-0.5 sm:mb-1">😊</span>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{moodStats.great}%</p>
            <p className="text-xs sm:text-sm text-green-700 font-medium">Great</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 sm:p-3 text-center border border-amber-100">
            <span className="text-xl sm:text-2xl block mb-0.5 sm:mb-1">😐</span>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">{moodStats.okay}%</p>
            <p className="text-xs sm:text-sm text-amber-700 font-medium">Okay</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2 sm:p-3 text-center border border-red-100">
            <span className="text-xl sm:text-2xl block mb-0.5 sm:mb-1">😞</span>
            <p className="text-xl sm:text-2xl font-bold text-red-500">{moodStats.tough}%</p>
            <p className="text-xs sm:text-sm text-red-600 font-medium">Tough</p>
          </div>
        </div>

        <div className="h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moodData} barCategoryGap="12%">
              <XAxis 
                dataKey={viewMode === 'week' ? 'day' : 'date'} 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                interval={viewMode === 'month' ? 6 : 0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                domain={[0, 3]}
                ticks={[1, 2, 3]}
                tickFormatter={(v) => v === 3 ? '😊' : v === 2 ? '😐' : '😞'}
                width={25}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-900 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm shadow-lg">
                        <p className="font-semibold">{data.fullDate}</p>
                        <p className="flex items-center gap-2">
                          <span className="text-base sm:text-lg">{data.mood}</span>
                          <span className="text-gray-300">{data.moodLabel}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="moodValue" radius={[3, 3, 0, 0]}>
                {moodData.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={getBarColor(entry.moodValue)}
                    opacity={entry.isToday ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-6 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-500"></span> Great
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-amber-500"></span> Okay
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-red-500"></span> Tough
          </span>
        </div>
      </div>
    </div>
  );
};

export default MoodChart;
