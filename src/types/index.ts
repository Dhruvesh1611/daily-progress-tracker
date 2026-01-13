// Task and Habit Types for Daily Progress Tracker

export type TaskCategory = 'Health' | 'Study' | 'Work' | 'Personal' | 'Other';
export type TaskType = 'Task' | 'Habit';
export type Frequency = 'Daily' | 'Weekly' | 'Monthly';
export type Status = 'completed' | 'pending' | 'skipped';
export type Mood = '😊' | '😐' | '😞';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  type: TaskType;
  frequency: Frequency;
  description?: string;
  status: Status;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface DailyProgress {
  date: Date;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  tasks: Task[];
}

export interface Streak {
  taskId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
  startDate: Date;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  bestDay?: string;
  totalDays: number;
}

export interface DailyReflection {
  date: Date;
  completed: string; // What did you complete today?
  improve: string;   // What can you improve?
  mood: Mood;
  userId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  requirement: number; // e.g., 3 days for Level 1
}

export interface UserProfile {
  userId: string;
  email?: string;
  name?: string;
  theme: 'light' | 'dark';
  customCategories?: TaskCategory[];
  badges: Badge[];
  joinedAt: Date;
}
