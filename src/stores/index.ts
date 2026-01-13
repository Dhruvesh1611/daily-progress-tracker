import { create } from 'zustand';
import type { Task, Streak } from '@/types';

interface TaskState {
  tasks: Task[];
  selectedDate: Date;
  streaks: Map<string, Streak>;
  
  // Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  setSelectedDate: (date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
  updateStreak: (taskId: string, streak: Streak) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedDate: new Date(),
  streaks: new Map(),
  
  addTask: (task: Task) =>
    set(state => ({
      tasks: [...state.tasks, task],
    })),
  
  updateTask: (id: string, updates: Partial<Task>) =>
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      ),
    })),
  
  deleteTask: (id: string) =>
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id),
    })),
  
  setTasks: (tasks: Task[]) =>
    set({ tasks }),
  
  setSelectedDate: (date: Date) =>
    set({ selectedDate: date }),
  
  getTasksForDate: (date: Date) => {
    const state = get();
    return state.tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  },
  
  updateStreak: (taskId: string, streak: Streak) =>
    set(state => {
      const newStreaks = new Map(state.streaks);
      newStreaks.set(taskId, streak);
      return { streaks: newStreaks };
    }),
}));

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // Actions
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>(set => ({
  theme: 'light',
  sidebarOpen: true,
  
  toggleTheme: () =>
    set(state => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
  
  toggleSidebar: () =>
    set(state => ({
      sidebarOpen: !state.sidebarOpen,
    })),
}));
