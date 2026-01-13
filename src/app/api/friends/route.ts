import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Friend, Task } from '@/models';

// GET friends list
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const friendConnections = await Friend.find({ userId }).populate('friendId', 'name email avatar streak totalHabits');
    
    const friends = await Promise.all(friendConnections.map(async (f) => {
      const friendUser = f.friendId as any;
      
      // Get friend's today progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalTasks = await Task.countDocuments({ userId: friendUser._id, type: 'Habit' });
      const completedToday = await Task.countDocuments({
        userId: friendUser._id,
        type: 'Habit',
        completedDates: { $gte: today }
      });
      
      const todayProgress = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;
      
      return {
        id: friendUser._id.toString(),
        odak: friendUser._id.toString(),
        name: friendUser.name,
        email: friendUser.email,
        avatar: friendUser.avatar,
        streak: friendUser.streak || 0,
        todayProgress,
        addedAt: f.addedAt,
      };
    }));
    
    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE - Remove friend
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');
    
    if (!userId || !friendId) {
      return NextResponse.json({ error: 'User ID and Friend ID are required' }, { status: 400 });
    }
    
    // Remove both friend connections
    await Friend.deleteMany({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    });
    
    return NextResponse.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
