import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification } from '@/models';

// GET notifications for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const query: any = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('fromUserId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const formattedNotifications = notifications.map(n => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      fromUser: n.fromUserId ? {
        id: (n.fromUserId as any)._id.toString(),
        name: (n.fromUserId as any).name,
        avatar: (n.fromUserId as any).avatar,
      } : null,
      relatedId: n.relatedId,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
    
    // Count unread
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    
    return NextResponse.json({ notifications: formattedNotifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST - Create notification (internal use)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, type, title, message, fromUserId, relatedId } = await request.json();
    
    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      fromUserId,
      relatedId,
      isRead: false,
    });
    
    return NextResponse.json({ 
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const { notificationIds, userId, markAllRead } = await request.json();
    
    if (markAllRead && userId) {
      // Mark all as read for user
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }
    
    if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { isRead: true }
      );
      return NextResponse.json({ message: 'Notifications marked as read' });
    }
    
    return NextResponse.json({ error: 'No notifications specified' }, { status: 400 });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    const userId = searchParams.get('userId');
    const clearAll = searchParams.get('clearAll') === 'true';
    
    if (clearAll && userId) {
      await Notification.deleteMany({ userId });
      return NextResponse.json({ message: 'All notifications cleared' });
    }
    
    if (notificationId) {
      await Notification.findByIdAndDelete(notificationId);
      return NextResponse.json({ message: 'Notification deleted' });
    }
    
    return NextResponse.json({ error: 'No notification specified' }, { status: 400 });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
