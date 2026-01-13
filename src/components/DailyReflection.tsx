'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores';
import { Mood } from '@/types';

export const DailyReflection = () => {
  const [reflection, setReflection] = useState({
    completed: '',
    improve: '',
    mood: '😊' as Mood,
    gratitude: '',
  });
  const [saved, setSaved] = useState(false);

  const moods: { emoji: Mood; label: string }[] = [
    { emoji: '😊', label: 'Great' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😞', label: 'Tough' },
  ];

  const handleSave = () => {
    // In production, save to database
    console.log('Saving reflection:', reflection);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-indigo-500">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">✨</span>
          <h3 className="font-bold text-lg sm:text-xl text-white">Daily Reflection</h3>
        </div>
        <p className="text-purple-100 text-xs sm:text-sm mt-1">Take a moment to reflect on your day</p>
      </div>

      <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">
        {/* Mood Selection */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-600 uppercase mb-2 sm:mb-3">
            How are you feeling?
          </label>
          <div className="flex gap-2">
            {moods.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => setReflection({ ...reflection, mood: emoji })}
                className={`flex-1 py-2 sm:py-3 rounded-lg border-2 transition-all ${
                  reflection.mood === emoji
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className="text-2xl sm:text-3xl block mb-0.5 sm:mb-1">{emoji}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-600">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* What did you accomplish? */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-600 uppercase mb-2 sm:mb-3">
            🏆 What did you accomplish today?
          </label>
          <textarea
            value={reflection.completed}
            onChange={(e) => setReflection({ ...reflection, completed: e.target.value })}
            placeholder="I completed..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:border-purple-400 resize-none"
            rows={2}
          />
        </div>

        {/* What can you improve? */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-600 uppercase mb-2 sm:mb-3">
            📈 What can you improve?
          </label>
          <textarea
            value={reflection.improve}
            onChange={(e) => setReflection({ ...reflection, improve: e.target.value })}
            placeholder="Tomorrow I will..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:border-purple-400 resize-none"
            rows={2}
          />
        </div>

        {/* Gratitude */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-600 uppercase mb-2 sm:mb-3">
            🙏 One thing you're grateful for
          </label>
          <input
            type="text"
            value={reflection.gratitude}
            onChange={(e) => setReflection({ ...reflection, gratitude: e.target.value })}
            placeholder="I'm grateful for..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-lg font-bold text-base transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Reflection'}
        </button>
      </div>
    </div>
  );
};

export default DailyReflection;
