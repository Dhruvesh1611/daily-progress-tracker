'use client';

import { useMemo } from 'react';

interface MiniCalendarProps {
  completionData?: Map<string, number>; // date string -> completion percentage
}

export const MiniCalendar = ({ completionData = new Map() }: MiniCalendarProps) => {
  const today = new Date();
  
  const calendarData = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    
    return { days, month, year };
  }, [today]);

  const getColorForDay = (day: number) => {
    const dateStr = new Date(calendarData.year, calendarData.month, day).toDateString();
    const completion = completionData.get(dateStr) || 0;
    
    if (completion >= 80) return 'bg-green-500 text-white';
    if (completion >= 50) return 'bg-green-300 text-green-900';
    if (completion >= 30) return 'bg-amber-200 text-amber-900';
    if (completion > 0) return 'bg-red-200 text-red-900';
    return 'bg-gray-50 text-gray-600';
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">📆</span>
            <h3 className="font-bold text-lg sm:text-xl text-gray-800">This Month</h3>
          </div>
          <span className="text-sm sm:text-base font-medium text-gray-500">
            {monthNames[calendarData.month]} {calendarData.year}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 sm:p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-xs sm:text-sm font-bold text-gray-500 py-0.5 sm:py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarData.days.map((day, idx) => {
            if (day === null) {
              return <div key={idx} className="aspect-square" />;
            }
            
            const isToday = day === today.getDate() && 
                           calendarData.month === today.getMonth() &&
                           calendarData.year === today.getFullYear();
            
            return (
              <div
                key={idx}
                className={`aspect-square rounded sm:rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all cursor-default ${
                  isToday 
                    ? 'ring-1 sm:ring-2 ring-blue-500 ring-offset-1 bg-blue-500 text-white' 
                    : getColorForDay(day)
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-500" />
              <span>80%+</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-amber-200" />
              <span>30-79%</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-red-200" />
              <span>&lt;30%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
