import mongoose, { Schema, Document, Model } from 'mongoose';

// User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: string;
  streak: number;
  totalHabits: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task/Habit Interface
export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: 'Health' | 'Study' | 'Work' | 'Personal' | 'Other';
  type: 'Task' | 'Habit';
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  status: 'pending' | 'completed' | 'skipped';
  completedDates: Date[];
  createdAt: Date;
  updatedAt: Date;
}

// Friend Request Interface
export interface IFriendRequest extends Document {
  _id: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Friend Interface
export interface IFriend extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  addedAt: Date;
}

// Group Interface
export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  creatorId: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: 'admin' | 'member';
    joinedAt: Date;
  }[];
  isPrivate: boolean;
  createdAt: Date;
}

// Group Invite Interface
export interface IGroupInvite extends Document {
  _id: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Reflection Interface
export interface IReflection extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  mood: string;
  gratitude: string;
  accomplishment: string;
  improvement: string;
  createdAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '👤' },
  streak: { type: Number, default: 0 },
  totalHabits: { type: Number, default: 0 },
}, { timestamps: true });

// Task Schema
const TaskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Health', 'Study', 'Work', 'Personal', 'Other'],
    default: 'Personal'
  },
  type: { 
    type: String, 
    enum: ['Task', 'Habit'],
    default: 'Habit'
  },
  frequency: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Daily'
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'skipped'],
    default: 'pending'
  },
  completedDates: [{ type: Date }],
}, { timestamps: true });

// Friend Request Schema
const FriendRequestSchema = new Schema<IFriendRequest>({
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
}, { timestamps: true });

// Friend Schema
const FriendSchema = new Schema<IFriend>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now },
});

// Group Schema
const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  description: { type: String },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  isPrivate: { type: Boolean, default: false },
}, { timestamps: true });

// Group Invite Schema
const GroupInviteSchema = new Schema<IGroupInvite>({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
}, { timestamps: true });

// Reflection Schema
const ReflectionSchema = new Schema<IReflection>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mood: { type: String, required: true },
  gratitude: { type: String },
  accomplishment: { type: String },
  improvement: { type: String },
}, { timestamps: true });

// Export Models
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export const FriendRequest: Model<IFriendRequest> = mongoose.models.FriendRequest || mongoose.model<IFriendRequest>('FriendRequest', FriendRequestSchema);
export const Friend: Model<IFriend> = mongoose.models.Friend || mongoose.model<IFriend>('Friend', FriendSchema);
export const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export const GroupInvite: Model<IGroupInvite> = mongoose.models.GroupInvite || mongoose.model<IGroupInvite>('GroupInvite', GroupInviteSchema);
export const Reflection: Model<IReflection> = mongoose.models.Reflection || mongoose.model<IReflection>('Reflection', ReflectionSchema);
