'use client';

import { useState } from 'react';
import { Task, TaskCategory, TaskType, Frequency } from '@/types';
import { useTaskStore } from '@/stores';

interface TaskFormProps {
  onClose: () => void;
}

export const TaskForm = ({ onClose }: TaskFormProps) => {
  const addTask = useTaskStore(state => state.addTask);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personal' as TaskCategory,
    type: 'Habit' as TaskType,
    frequency: 'Daily' as Frequency,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    addTask(newTask);
    setFormData({
      title: '',
      description: '',
      category: 'Personal',
      type: 'Habit',
      frequency: 'Daily',
    });
    onClose();
  };

  const categories: { value: TaskCategory; label: string; icon: string }[] = [
    { value: 'Health', label: 'Health', icon: '💪' },
    { value: 'Study', label: 'Study', icon: '📚' },
    { value: 'Work', label: 'Work', icon: '💼' },
    { value: 'Personal', label: 'Personal', icon: '🎯' },
    { value: 'Other', label: 'Other', icon: '📌' },
  ];

  const types: { value: TaskType; label: string; icon: string }[] = [
    { value: 'Task', label: 'One-time Task', icon: '✓' },
    { value: 'Habit', label: 'Recurring Habit', icon: '🔄' },
  ];

  const frequencies: Frequency[] = ['Daily', 'Weekly', 'Monthly'];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-3 sm:mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold text-white">Add New Habit</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        {/* Title */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-sm sm:text-base font-bold text-gray-700 mb-1.5 sm:mb-2">
            What habit do you want to build?
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Exercise 30 minutes 🏃"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-gray-800 focus:bg-white transition-all text-sm sm:text-base text-gray-800 placeholder-gray-400"
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-sm sm:text-base font-bold text-gray-700 mb-1.5 sm:mb-2">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add any details or reminders..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base text-gray-800 placeholder-gray-400 resize-none"
            rows={2}
          />
        </div>

        {/* Category Selection */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-sm sm:text-base font-bold text-gray-700 mb-1.5 sm:mb-2">Category</label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`flex flex-col items-center p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
                  formData.category === cat.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-lg sm:text-2xl mb-0.5 sm:mb-1">{cat.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-600">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Selection */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-sm sm:text-base font-bold text-gray-700 mb-1.5 sm:mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {types.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`flex items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border-2 transition-all ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-lg sm:text-xl">{type.icon}</span>
                <span className="text-sm sm:text-base font-medium text-gray-700">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="mb-5 sm:mb-6">
          <label className="block text-sm sm:text-base font-bold text-gray-700 mb-1.5 sm:mb-2">Frequency</label>
          <div className="flex gap-2">
            {frequencies.map(freq => (
              <button
                key={freq}
                type="button"
                onClick={() => setFormData({ ...formData, frequency: freq })}
                className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base font-semibold transition-all ${
                  formData.frequency === freq
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-100 text-gray-700 hover:border-gray-200 bg-gray-50'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm sm:text-base hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-gray-900 text-white font-bold text-sm sm:text-base hover:bg-gray-800 transition-all"
          >
            Add Habit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
