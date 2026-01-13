'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores';
import { useAuthStore, useSocialStore } from '@/stores/authStore';
import TaskForm from '@/components/TaskForm';
import HabitList from '@/components/HabitList';
import WeeklyHabitTable from '@/components/WeeklyHabitTable';
import MiniCalendar from '@/components/MiniCalendar';
import WeeklyBarChart from '@/components/WeeklyBarChart';
import MonthlyLineChart from '@/components/MonthlyLineChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import StreakCard from '@/components/StreakCard';
import DailyReflection from '@/components/DailyReflection';
import StatsOverview from '@/components/StatsOverview';
import BadgesDisplay from '@/components/BadgesDisplay';
import MoodChart from '@/components/MoodChart';
import UserGuide from '@/components/UserGuide';
import AuthModal from '@/components/AuthModal';
import FriendsSection from '@/components/FriendsSection';
import GroupsSection from '@/components/GroupsSection';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('habits');
  const tasks = useTaskStore(state => state.tasks);
  
  // Auth state
  const { user, isAuthenticated, logout } = useAuthStore();
  const { friendRequests, groupInvites } = useSocialStore();

  const habits = tasks.filter(t => t.type === 'Habit');
  const completedToday = habits.filter(t => t.status === 'completed').length;
  const totalHabits = habits.length;
  const todayProgress = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Count pending notifications
  const pendingFriendRequests = friendRequests.filter(r => r.toUserId === user?.id && r.status === 'pending').length;
  const pendingGroupInvites = groupInvites.filter(i => i.toUserId === user?.id && i.status === 'pending').length;
  const totalNotifications = pendingFriendRequests + pendingGroupInvites;

  const navItems = [
    { id: 'habits', label: 'Habits', icon: '📋', description: 'Track daily habits' },
    { id: 'analytics', label: 'Analytics', icon: '📊', description: 'View statistics' },
    { id: 'reflect', label: 'Reflect', icon: '✨', description: 'Daily reflection' },
    { id: 'friends', label: 'Friends', icon: '👥', description: 'Connect with friends', badge: pendingFriendRequests },
    { id: 'groups', label: 'Groups', icon: '👨‍👩‍👧‍👦', description: 'Track together', badge: pendingGroupInvites },
  ];

  // Handle tab change with auth check for social features
  const handleTabChange = (tabId) => {
    if ((tabId === 'friends' || tabId === 'groups') && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <main className="min-h-screen bg-gray-100 pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Daily Progress</h1>
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Build habits, track progress</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications Badge */}
              {isAuthenticated && totalNotifications > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setActiveTab(pendingFriendRequests > 0 ? 'friends' : 'groups')}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                      {totalNotifications}
                    </span>
                  </button>
                </div>
              )}

              <UserGuide />
              
              {/* Auth Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition"
                  >
                    <span className="text-xl">{user?.avatar || '👤'}</span>
                    <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-white text-gray-900 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Habit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-72px)]">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          {/* User Profile Section */}
          {isAuthenticated && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl">
                  {user?.avatar || '👤'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Navigation</p>
            <nav className="space-y-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl relative">
                    {item.icon}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <div className="flex-1">
                    <p className={`font-bold text-lg ${activeTab === item.id ? 'text-white' : 'text-gray-800'}`}>
                      {item.label}
                    </p>
                    <p className={`text-sm ${activeTab === item.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                  {activeTab === item.id && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {!isAuthenticated && (item.id === 'friends' || item.id === 'groups') && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Login</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Today's Progress</p>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Completion</span>
                <span className="text-lg font-bold text-gray-800">{todayProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    todayProgress >= 80 ? 'bg-green-500' : todayProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{completedToday}</p>
                  <p className="text-xs text-gray-500">Done</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{totalHabits}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
              <p className="text-sm font-medium text-blue-100">Today</p>
              <p className="text-xl font-bold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <span className="text-2xl sm:text-4xl">{navItems.find(n => n.id === activeTab)?.icon}</span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
            </div>
            <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
              {activeTab === 'habits' && 'Manage your daily habits and track your progress'}
              {activeTab === 'analytics' && 'Detailed statistics and insights about your habits'}
              {activeTab === 'reflect' && 'Take a moment to reflect on your day and track your mood'}
              {activeTab === 'friends' && 'Connect with friends and see their progress'}
              {activeTab === 'groups' && 'Create groups and track habits together'}
            </p>
          </div>

          {/* Habits Tab Content */}
          {activeTab === 'habits' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats Grid - TOP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl">🔥</span>
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-800">0</p>
                      <p className="text-sm sm:text-base font-medium text-gray-500">Day Streak</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl">📊</span>
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-800">{totalHabits}</p>
                      <p className="text-sm sm:text-base font-medium text-gray-500">Total Habits</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl">⭐</span>
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-800">{todayProgress}%</p>
                      <p className="text-sm sm:text-base font-medium text-gray-500">Today's Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak & Weekly Table Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <StreakCard />
                <div className="lg:col-span-2">
                  <WeeklyHabitTable />
                </div>
              </div>

              {/* Habit List & Calendar Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <HabitList onAddHabit={() => setShowForm(true)} />
                <div className="lg:col-span-2">
                  <MiniCalendar />
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab Content */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Stats Overview */}
              <StatsOverview />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <WeeklyBarChart />
                <MonthlyLineChart />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <CategoryPieChart />
                <div className="md:col-span-1 lg:col-span-2">
                  <BadgesDisplay />
                </div>
              </div>
            </div>
          )}

          {/* Reflect Tab Content */}
          {activeTab === 'reflect' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <DailyReflection />
                <MoodChart />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <StreakCard />
                <BadgesDisplay />
              </div>
            </div>
          )}

          {/* Friends Tab Content */}
          {activeTab === 'friends' && isAuthenticated && (
            <FriendsSection />
          )}

          {/* Groups Tab Content */}
          {activeTab === 'groups' && isAuthenticated && (
            <GroupsSection />
          )}

          {/* Not Authenticated Message for Social Features */}
          {(activeTab === 'friends' || activeTab === 'groups') && !isAuthenticated && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <span className="text-6xl block mb-4">🔐</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Login Required</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Sign in to connect with friends, create groups, and track progress together!
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition"
              >
                Sign In to Continue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center px-2 py-2 rounded-lg transition-all relative ${
                activeTab === item.id
                  ? 'text-gray-900'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-lg sm:text-xl mb-0.5 relative">
                {item.icon}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-medium ${activeTab === item.id ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="w-1 h-1 bg-gray-900 rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button - adjusted for mobile nav */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all flex items-center justify-center z-30"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Task Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <TaskForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  );
}
