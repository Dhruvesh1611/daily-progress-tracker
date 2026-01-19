import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GroupInvite, Group, User } from '@/models';

// GET group invites for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const invites = await GroupInvite.find({
      toUserId: userId,
      status: 'pending'
    }).populate('groupId', 'name').populate('fromUserId', 'name');
    
    const formattedInvites = invites.map(inv => ({
      id: inv._id.toString(),
      groupId: (inv.groupId as any)._id.toString(),
      groupName: (inv.groupId as any).name,
      fromUserId: (inv.fromUserId as any)._id.toString(),
      fromUserName: (inv.fromUserId as any).name,
      toUserId: inv.toUserId.toString(),
      status: inv.status,
      createdAt: inv.createdAt,
    }));
    
    return NextResponse.json({ invites: formattedInvites });
  } catch (error) {
    console.error('Get group invites error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST - Send group invite
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { groupId, fromUserId, toEmail } = await request.json();
    
    if (!groupId || !fromUserId || !toEmail) {
      return NextResponse.json({ error: 'Group ID, from user ID and to email are required' }, { status: 400 });
    }
    
    // Find target user
    const targetUser = await User.findOne({ email: toEmail.toLowerCase() });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    // Check if user is already a member
    const isMember = group.members.some((m: any) => m.userId.toString() === targetUser._id.toString());
    if (isMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }
    
    // Check if invite already exists
    const existingInvite = await GroupInvite.findOne({
      groupId,
      toUserId: targetUser._id,
      status: 'pending'
    });
    
    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already sent' }, { status: 400 });
    }
    
    const invite = await GroupInvite.create({
      groupId,
      fromUserId,
      toUserId: targetUser._id,
      status: 'pending'
    });
    
    return NextResponse.json({
      message: 'Invite sent',
      invite: {
        id: invite._id.toString(),
        toUserId: targetUser._id.toString(),
        toUserName: targetUser.name,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Send group invite error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PATCH - Accept/Reject group invite
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const { inviteId, action } = await request.json();
    
    if (!inviteId || !action) {
      return NextResponse.json({ error: 'Invite ID and action are required' }, { status: 400 });
    }
    
    const invite = await GroupInvite.findById(inviteId);
    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }
    
    if (action === 'accept') {
      // Add user to group: validate user exists
      const user = await User.findById(invite.toUserId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      await Group.findByIdAndUpdate(invite.groupId, {
        $push: {
          members: {
            userId: invite.toUserId,
            role: 'member',
            joinedAt: new Date(),
          }
        }
      });
      
      invite.status = 'accepted';
    } else if (action === 'reject') {
      invite.status = 'rejected';
    }
    
    await invite.save();
    
    return NextResponse.json({ message: `Invite ${action}ed` });
  } catch (error) {
    console.error('Update group invite error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
