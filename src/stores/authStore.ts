'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Friend, FriendRequest, Group, GroupInvite, SharedProgress } from '@/types/user';

// Notification type
export interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'group_invite' | 'group_joined';
  title: string;
  message: string;
  fromUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

interface SocialState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  groups: Group[];
  groupInvites: GroupInvite[];
  isLoading: boolean;
  
  // Fetch actions
  fetchFriends: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchGroupInvites: () => Promise<void>;
  
  // Friend actions
  sendFriendRequest: (toEmail: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  
  // Group actions
  createGroup: (name: string, description?: string, isPrivate?: boolean) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  inviteToGroup: (groupId: string, userEmail: string) => Promise<boolean>;
  acceptGroupInvite: (inviteId: string) => Promise<void>;
  rejectGroupInvite: (inviteId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  
  // Shared progress
  friendProgressCache: { [key: string]: SharedProgress };
  getFriendProgress: (friendId: string) => SharedProgress | null;
  fetchFriendProgress: (friendId: string) => Promise<SharedProgress | null>;
  getGroupProgress: (groupId: string) => SharedProgress[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data };
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      friends: [],
      friendRequests: [],
      groups: [],
      groupInvites: [],
      friendProgressCache: {},
      isLoading: false,
      
      // Fetch Friends
      fetchFriends: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch(`/api/friends?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            set({ friends: data.friends });
          }
        } catch (error) {
          console.error('Fetch friends error:', error);
        }
      },
      
      // Fetch Friend Requests
      fetchFriendRequests: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch(`/api/friends/requests?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            set({ friendRequests: data.requests });
          }
        } catch (error) {
          console.error('Fetch friend requests error:', error);
        }
      },
      
      // Fetch Groups
      fetchGroups: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch(`/api/groups?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            set({ groups: data.groups });
          }
        } catch (error) {
          console.error('Fetch groups error:', error);
        }
      },
      
      // Fetch Group Invites
      fetchGroupInvites: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch(`/api/groups/invites?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            set({ groupInvites: data.invites });
          }
        } catch (error) {
          console.error('Fetch group invites error:', error);
        }
      },
      
      // Send Friend Request
      sendFriendRequest: async (toEmail: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return false;
        
        try {
          const res = await fetch('/api/friends/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromUserId: user.id, toEmail }),
          });
          
          if (res.ok) {
            // Refresh friend requests
            await get().fetchFriendRequests();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Send friend request error:', error);
          return false;
        }
      },
      
      // Accept Friend Request
      acceptFriendRequest: async (requestId: string) => {
        try {
          const res = await fetch('/api/friends/requests', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, action: 'accept' }),
          });
          
          if (res.ok) {
            await get().fetchFriends();
            await get().fetchFriendRequests();
          }
        } catch (error) {
          console.error('Accept friend request error:', error);
        }
      },
      
      // Reject Friend Request
      rejectFriendRequest: async (requestId: string) => {
        try {
          const res = await fetch('/api/friends/requests', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, action: 'reject' }),
          });
          
          if (res.ok) {
            await get().fetchFriendRequests();
          }
        } catch (error) {
          console.error('Reject friend request error:', error);
        }
      },
      
      // Remove Friend
      removeFriend: async (friendId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch(`/api/friends?userId=${user.id}&friendId=${friendId}`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            await get().fetchFriends();
          }
        } catch (error) {
          console.error('Remove friend error:', error);
        }
      },
      
      // Create Group
      createGroup: async (name: string, description?: string, isPrivate: boolean = false) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, isPrivate, creatorId: user.id }),
          });
          
          if (res.ok) {
            await get().fetchGroups();
          }
        } catch (error) {
          console.error('Create group error:', error);
        }
      },
      
      // Delete Group
      deleteGroup: async (groupId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch(`/api/groups?groupId=${groupId}&userId=${user.id}`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            await get().fetchGroups();
          }
        } catch (error) {
          console.error('Delete group error:', error);
        }
      },
      
      // Invite to Group
      inviteToGroup: async (groupId: string, userEmail: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return false;
        
        try {
          const res = await fetch('/api/groups/invites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, fromUserId: user.id, toEmail: userEmail }),
          });
          
          return res.ok;
        } catch (error) {
          console.error('Invite to group error:', error);
          return false;
        }
      },
      
      // Accept Group Invite
      acceptGroupInvite: async (inviteId: string) => {
        try {
          const res = await fetch('/api/groups/invites', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteId, action: 'accept' }),
          });
          
          if (res.ok) {
            await get().fetchGroups();
            await get().fetchGroupInvites();
          }
        } catch (error) {
          console.error('Accept group invite error:', error);
        }
      },
      
      // Reject Group Invite
      rejectGroupInvite: async (inviteId: string) => {
        try {
          const res = await fetch('/api/groups/invites', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteId, action: 'reject' }),
          });
          
          if (res.ok) {
            await get().fetchGroupInvites();
          }
        } catch (error) {
          console.error('Reject group invite error:', error);
        }
      },
      
      // Leave Group
      leaveGroup: async (groupId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch('/api/groups', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, userId: user.id }),
          });
          
          if (res.ok) {
            await get().fetchGroups();
          }
        } catch (error) {
          console.error('Leave group error:', error);
        }
      },
      
      // Get Friend Progress from cache
      getFriendProgress: (friendId: string) => {
        return get().friendProgressCache[friendId] || null;
      },
      
      // Fetch Friend Progress from API
      fetchFriendProgress: async (friendId: string) => {
        try {
          const res = await fetch(`/api/friends/progress?friendId=${friendId}`);
          if (res.ok) {
            const data = await res.json();
            set(state => ({
              friendProgressCache: {
                ...state.friendProgressCache,
                [friendId]: data.progress
              }
            }));
            return data.progress;
          }
          return null;
        } catch (error) {
          console.error('Fetch friend progress error:', error);
          return null;
        }
      },
      
      // Get Group Progress (mock for now)
      getGroupProgress: (groupId: string) => {
        const group = get().groups.find(g => g.id === groupId);
        if (!group) return [];
        
        return group.members.map(member => ({
          odak: member.userId,
          odakName: member.userName,
          userAvatar: member.userAvatar,
          completedHabits: Math.floor(Math.random() * 5),
          totalHabits: 5,
          streak: Math.floor(Math.random() * 10),
          mood: ['😊', '😄', '🙂', '😌'][Math.floor(Math.random() * 4)],
          date: new Date().toISOString(),
        }));
      },
    }),
    {
      name: 'social-storage',
    }
  )
);

// Notification Store
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      
      fetchNotifications: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        set({ isLoading: true });
        try {
          const res = await fetch(`/api/notifications?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            set({ 
              notifications: data.notifications, 
              unreadCount: data.unreadCount,
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Fetch notifications error:', error);
          set({ isLoading: false });
        }
      },
      
      markAsRead: async (notificationIds: string[]) => {
        try {
          const res = await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds }),
          });
          
          if (res.ok) {
            set(state => ({
              notifications: state.notifications.map(n =>
                notificationIds.includes(n.id) ? { ...n, isRead: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - notificationIds.length),
            }));
          }
        } catch (error) {
          console.error('Mark as read error:', error);
        }
      },
      
      markAllAsRead: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, markAllRead: true }),
          });
          
          if (res.ok) {
            set(state => ({
              notifications: state.notifications.map(n => ({ ...n, isRead: true })),
              unreadCount: 0,
            }));
          }
        } catch (error) {
          console.error('Mark all as read error:', error);
        }
      },
      
      clearAll: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const res = await fetch(`/api/notifications?userId=${user.id}&clearAll=true`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            set({ notifications: [], unreadCount: 0 });
          }
        } catch (error) {
          console.error('Clear notifications error:', error);
        }
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);
