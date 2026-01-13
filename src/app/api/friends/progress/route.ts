import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Task, Reflection } from '@/models';

// GET friend's progress
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');
    
    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }
    
    // Get friend user data
    const friendUser = await User.findById(friendId);
    if (!friendUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all habits for this user
    const allHabits = await Task.find({ 
      userId: friendId, 
      type: 'Habit' 
    });
    
    const totalHabits = allHabits.length;
    
    // Count completed habits for today
    let completedHabits = 0;
    for (const habit of allHabits) {
      const completedToday = habit.completedDates?.some((date: Date) => {
        const d = new Date(date);
        return d >= today && d < tomorrow;
      });
      if (completedToday) {
        completedHabits++;
      }
    }
    
    // Get today's reflection for mood
    const todayReflection = await Reflection.findOne({
      userId: friendId,
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Calculate streak
    const streak = friendUser.streak || 0;
    
    const progress = {
      odak: friendId,
      odakName: friendUser.name,
      userAvatar: friendUser.avatar || '👤',
      completedHabits,
      totalHabits,
      streak,
      mood: todayReflection?.mood || '😊',
    };
    
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get friend progress error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
