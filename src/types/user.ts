// User and Group Types

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  streak: number;
  totalHabits: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Friend {
  id: string;
  odak: string;
  name: string;
  avatar?: string;
  addedAt: Date;
  streak: number;
  todayProgress: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  members: GroupMember[];
  createdAt: Date;
  isPrivate: boolean;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface SharedProgress {
  odak: string;
  odakName: string;
  userAvatar?: string;
  date: string;
  completedHabits: number;
  totalHabits: number;
  streak: number;
  mood?: '😊' | '😐' | '😞';
}
