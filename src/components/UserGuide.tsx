'use client';

import { useState } from 'react';

export const UserGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const guides = [
    {
      icon: '📋',
      title: 'Habits Tab',
      description: 'Track your daily habits and routines. Click the checkbox to mark habits as complete. View your weekly progress in the table.',
      tips: [
        'Click "New Habit" to add a new habit',
        'Check off habits daily to build streaks',
        'View your weekly progress in the table',
        'Mini calendar shows your monthly progress',
      ],
    },
    {
      icon: '📊',
      title: 'Analytics Tab',
      description: 'View detailed statistics and charts about your habit performance over time.',
      tips: [
        'Weekly bar chart shows completion rates',
        'Monthly trend shows your progress over 30 days',
        'Category pie chart breaks down habits by type',
        'Unlock badges by achieving milestones',
      ],
    },
    {
      icon: '✨',
      title: 'Reflect Tab',
      description: 'Daily reflection helps you stay mindful and track your emotional well-being.',
      tips: [
        'Select your mood each day',
        'Write what you accomplished',
        'Note areas for improvement',
        'Practice gratitude daily',
      ],
    },
    {
      icon: '🔥',
      title: 'Streaks & Badges',
      description: 'Stay motivated by building streaks and earning achievement badges.',
      tips: [
        'Complete habits daily to build streaks',
        'Earn badges at 3, 7, 21, and 30 day milestones',
        'Level up from Beginner to Master',
        'Track your longest streak record',
      ],
    },
    {
      icon: '💡',
      title: 'Pro Tips',
      description: 'Make the most of your Daily Progress Tracker with these tips.',
      tips: [
        'Start small with 2-3 habits',
        'Be specific about what you want to track',
        'Review your progress weekly',
        'Celebrate small wins!',
      ],
    },
  ];

  const currentGuide = guides[currentStep];

  return (
    <>
      {/* Guide Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 sm:gap-2 bg-blue-500 text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-md text-sm sm:text-base"
        title="How to use this app"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">Guide</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full mx-2 sm:mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">{currentGuide.icon}</span>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white">{currentGuide.title}</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">Step {currentStep + 1} of {guides.length}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Progress dots */}
              <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {guides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      idx === currentStep ? 'w-6 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-5">{currentGuide.description}</p>
              
              <div className="space-y-2 sm:space-y-3">
                {currentGuide.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
                  currentStep === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                ← Previous
              </button>
              
              {currentStep === guides.length - 1 ? (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition text-sm sm:text-base"
                >
                  Got it! ✓
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition text-sm sm:text-base"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserGuide;
