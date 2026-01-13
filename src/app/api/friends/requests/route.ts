import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { FriendRequest, Friend, User } from '@/models';

// GET friend requests for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Get pending requests TO this user
    const requests = await FriendRequest.find({
      toUserId: userId,
      status: 'pending'
    }).populate('fromUserId', 'name email avatar');
    
    const formattedRequests = requests.map(req => ({
      id: req._id.toString(),
      fromUserId: req.fromUserId._id.toString(),
      fromUserName: (req.fromUserId as any).name,
      fromUserAvatar: (req.fromUserId as any).avatar,
      toUserId: req.toUserId.toString(),
      status: req.status,
      createdAt: req.createdAt,
    }));
    
    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST - Send friend request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { fromUserId, toEmail } = await request.json();
    
    if (!fromUserId || !toEmail) {
      return NextResponse.json({ error: 'From user ID and to email are required' }, { status: 400 });
    }
    
    // Find target user by email
    const targetUser = await User.findOne({ email: toEmail.toLowerCase() });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Can't send request to yourself
    if (targetUser._id.toString() === fromUserId) {
      return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });
    }
    
    // Check if already friends
    const existingFriend = await Friend.findOne({
      $or: [
        { userId: fromUserId, friendId: targetUser._id },
        { userId: targetUser._id, friendId: fromUserId }
      ]
    });
    
    if (existingFriend) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }
    
    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { fromUserId: fromUserId, toUserId: targetUser._id, status: 'pending' },
        { fromUserId: targetUser._id, toUserId: fromUserId, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      return NextResponse.json({ error: 'Request already sent' }, { status: 400 });
    }
    
    // Create friend request
    const friendRequest = await FriendRequest.create({
      fromUserId,
      toUserId: targetUser._id,
      status: 'pending'
    });
    
    return NextResponse.json({ 
      message: 'Friend request sent',
      request: {
        id: friendRequest._id.toString(),
        toUserId: targetUser._id.toString(),
        toUserName: targetUser.name,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Send friend request error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PATCH - Accept/Reject friend request
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const { requestId, action } = await request.json();
    
    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
    }
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    if (action === 'accept') {
      // Create friend connections (both ways)
      await Friend.create([
        { userId: friendRequest.fromUserId, friendId: friendRequest.toUserId },
        { userId: friendRequest.toUserId, friendId: friendRequest.fromUserId }
      ]);
      
      friendRequest.status = 'accepted';
    } else if (action === 'reject') {
      friendRequest.status = 'rejected';
    }
    
    await friendRequest.save();
    
    return NextResponse.json({ message: `Request ${action}ed` });
  } catch (error) {
    console.error('Update friend request error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
