'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Friend, FriendRequest, Group, GroupInvite, SharedProgress } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface SocialState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  groups: Group[];
  groupInvites: GroupInvite[];
  
  // Friend actions
  sendFriendRequest: (toEmail: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  
  // Group actions
  createGroup: (name: string, description?: string, isPrivate?: boolean) => void;
  deleteGroup: (groupId: string) => void;
  inviteToGroup: (groupId: string, userEmail: string) => Promise<boolean>;
  acceptGroupInvite: (inviteId: string) => void;
  rejectGroupInvite: (inviteId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // Shared progress
  getFriendProgress: (friendId: string) => SharedProgress | null;
  getGroupProgress: (groupId: string) => SharedProgress[];
}

// Mock users database (in production, this would be a real database)
const mockUsers: Map<string, { user: User; password: string }> = new Map();

// Initialize with some demo users
mockUsers.set('demo@test.com', {
  user: {
    id: 'demo-user-1',
    name: 'Demo User',
    email: 'demo@test.com',
    avatar: '👤',
    createdAt: new Date(),
    streak: 5,
    totalHabits: 12,
  },
  password: 'demo123',
});

mockUsers.set('john@test.com', {
  user: {
    id: 'john-user-2',
    name: 'John Doe',
    email: 'john@test.com',
    avatar: '🧑',
    createdAt: new Date(),
    streak: 10,
    totalHabits: 8,
  },
  password: 'john123',
});

mockUsers.set('jane@test.com', {
  user: {
    id: 'jane-user-3',
    name: 'Jane Smith',
    email: 'jane@test.com',
    avatar: '👩',
    createdAt: new Date(),
    streak: 15,
    totalHabits: 20,
  },
  password: 'jane123',
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        const userData = mockUsers.get(email.toLowerCase());
        if (userData && userData.password === password) {
          set({ user: userData.user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      signup: async (name: string, email: string, password: string) => {
        const emailLower = email.toLowerCase();
        if (mockUsers.has(emailLower)) {
          return false; // User already exists
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email: emailLower,
          avatar: '👤',
          createdAt: new Date(),
          streak: 0,
          totalHabits: 0,
        };
        
        mockUsers.set(emailLower, { user: newUser, password });
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data };
          set({ user: updatedUser });
          
          // Update mock database
          const userData = mockUsers.get(currentUser.email);
          if (userData) {
            mockUsers.set(currentUser.email, { ...userData, user: updatedUser });
          }
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
      
      sendFriendRequest: async (toEmail: string) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return false;
        
        // Make sure current user is in mockUsers (for users who signed up and page was refreshed)
        if (!mockUsers.has(currentUser.email.toLowerCase())) {
          mockUsers.set(currentUser.email.toLowerCase(), { 
            user: currentUser, 
            password: 'temp' // Password doesn't matter for friend requests
          });
        }
        
        const targetUser = mockUsers.get(toEmail.toLowerCase());
        if (!targetUser) return false;
        
        // Can't send request to yourself
        if (targetUser.user.id === currentUser.id) return false;
        
        // Check if already friends or request exists
        const existingFriend = get().friends.find(f => f.id === targetUser.user.id);
        const existingRequest = get().friendRequests.find(
          r => (r.fromUserId === currentUser.id && r.toUserId === targetUser.user.id) ||
               (r.fromUserId === targetUser.user.id && r.toUserId === currentUser.id)
        );
        
        if (existingFriend || existingRequest) return false;
        
        const newRequest: FriendRequest = {
          id: `req-${Date.now()}`,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          fromUserAvatar: currentUser.avatar,
          toUserId: targetUser.user.id,
          status: 'pending',
          createdAt: new Date(),
        };
        
        set(state => ({
          friendRequests: [...state.friendRequests, newRequest],
        }));
        
        return true;
      },
      
      acceptFriendRequest: (requestId: string) => {
        const request = get().friendRequests.find(r => r.id === requestId);
        if (!request) return;
        
        const fromUser = Array.from(mockUsers.values()).find(u => u.user.id === request.fromUserId);
        if (!fromUser) return;
        
        const newFriend: Friend = {
          id: fromUser.user.id,
          odak: fromUser.user.id,
          name: fromUser.user.name,
          avatar: fromUser.user.avatar,
          addedAt: new Date(),
          streak: fromUser.user.streak,
          todayProgress: Math.floor(Math.random() * 100),
        };
        
        set(state => ({
          friends: [...state.friends, newFriend],
          friendRequests: state.friendRequests.map(r =>
            r.id === requestId ? { ...r, status: 'accepted' as const } : r
          ),
        }));
      },
      
      rejectFriendRequest: (requestId: string) => {
        set(state => ({
          friendRequests: state.friendRequests.map(r =>
            r.id === requestId ? { ...r, status: 'rejected' as const } : r
          ),
        }));
      },
      
      removeFriend: (friendId: string) => {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendId),
        }));
      },
      
      createGroup: (name: string, description?: string, isPrivate: boolean = false) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;
        
        const newGroup: Group = {
          id: `group-${Date.now()}`,
          name,
          description,
          creatorId: currentUser.id,
          members: [{
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            role: 'admin',
            joinedAt: new Date(),
          }],
          createdAt: new Date(),
          isPrivate,
        };
        
        set(state => ({
          groups: [...state.groups, newGroup],
        }));
      },
      
      deleteGroup: (groupId: string) => {
        const currentUser = useAuthStore.getState().user;
        const group = get().groups.find(g => g.id === groupId);
        
        if (!group || group.creatorId !== currentUser?.id) return;
        
        set(state => ({
          groups: state.groups.filter(g => g.id !== groupId),
        }));
      },
      
      inviteToGroup: async (groupId: string, userEmail: string) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return false;
        
        const group = get().groups.find(g => g.id === groupId);
        const targetUser = mockUsers.get(userEmail.toLowerCase());
        
        if (!group || !targetUser) return false;
        
        // Check if already member or invited
        const isMember = group.members.some(m => m.userId === targetUser.user.id);
        const existingInvite = get().groupInvites.find(
          i => i.groupId === groupId && i.toUserId === targetUser.user.id && i.status === 'pending'
        );
        
        if (isMember || existingInvite) return false;
        
        const newInvite: GroupInvite = {
          id: `ginv-${Date.now()}`,
          groupId,
          groupName: group.name,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: targetUser.user.id,
          status: 'pending',
          createdAt: new Date(),
        };
        
        set(state => ({
          groupInvites: [...state.groupInvites, newInvite],
        }));
        
        return true;
      },
      
      acceptGroupInvite: (inviteId: string) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;
        
        const invite = get().groupInvites.find(i => i.id === inviteId);
        if (!invite) return;
        
        set(state => ({
          groups: state.groups.map(g => {
            if (g.id === invite.groupId) {
              return {
                ...g,
                members: [...g.members, {
                  userId: currentUser.id,
                  userName: currentUser.name,
                  userAvatar: currentUser.avatar,
                  role: 'member' as const,
                  joinedAt: new Date(),
                }],
              };
            }
            return g;
          }),
          groupInvites: state.groupInvites.map(i =>
            i.id === inviteId ? { ...i, status: 'accepted' as const } : i
          ),
        }));
      },
      
      rejectGroupInvite: (inviteId: string) => {
        set(state => ({
          groupInvites: state.groupInvites.map(i =>
            i.id === inviteId ? { ...i, status: 'rejected' as const } : i
          ),
        }));
      },
      
      leaveGroup: (groupId: string) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;
        
        set(state => ({
          groups: state.groups.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                members: g.members.filter(m => m.userId !== currentUser.id),
              };
            }
            return g;
          }).filter(g => g.members.length > 0),
        }));
      },
      
      getFriendProgress: (friendId: string): SharedProgress | null => {
        const friend = get().friends.find(f => f.id === friendId);
        if (!friend) return null;
        
        return {
          odak: friend.id,
          odakName: friend.name,
          userAvatar: friend.avatar,
          date: new Date().toDateString(),
          completedHabits: Math.floor(Math.random() * 5) + 1,
          totalHabits: Math.floor(Math.random() * 5) + 5,
          streak: friend.streak,
          mood: ['😊', '😐', '😞'][Math.floor(Math.random() * 3)] as '😊' | '😐' | '😞',
        };
      },
      
      getGroupProgress: (groupId: string): SharedProgress[] => {
        const group = get().groups.find(g => g.id === groupId);
        if (!group) return [];
        
        return group.members.map(member => ({
          odak: member.userId,
          odakName: member.userName,
          userAvatar: member.userAvatar,
          date: new Date().toDateString(),
          completedHabits: Math.floor(Math.random() * 5) + 1,
          totalHabits: Math.floor(Math.random() * 5) + 5,
          streak: Math.floor(Math.random() * 20),
          mood: ['😊', '😐', '😞'][Math.floor(Math.random() * 3)] as '😊' | '😐' | '😞',
        }));
      },
    }),
    {
      name: 'social-storage',
    }
  )
);
