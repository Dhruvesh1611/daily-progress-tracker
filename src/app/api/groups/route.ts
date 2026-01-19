import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Group, User } from '@/models';

// GET groups for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const groups = await Group.find({
      'members.userId': userId
    }).populate('members.userId', 'name email avatar streak');
    
    const formattedGroups = groups.map(g => ({
      id: g._id.toString(),
      name: g.name,
      description: g.description,
      creatorId: g.creatorId.toString(),
      isPrivate: g.isPrivate,
      createdAt: g.createdAt,
      members: g.members.map((m: any) => ({
        userId: m.userId._id.toString(),
        userName: m.userId.name,
        userAvatar: m.userId.avatar,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    }));
    
    return NextResponse.json({ groups: formattedGroups });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST - Create group
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, description, isPrivate, creatorId } = await request.json();
    
    if (!name || !creatorId) {
      return NextResponse.json({ error: 'Name and creator ID are required' }, { status: 400 });
    }
    
    const creator = await User.findById(creatorId);
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    
    const group = await Group.create({
      name,
      description,
      creatorId,
      isPrivate: isPrivate || false,
      members: [{
        userId: creatorId,
        role: 'admin',
        joinedAt: new Date(),
      }],
    });
    
    return NextResponse.json({
      group: {
        id: group._id.toString(),
        name: group.name,
        description: group.description,
        creatorId: group.creatorId.toString(),
        isPrivate: group.isPrivate,
        members: [{
          userId: creatorId,
          userName: creator.name,
          userAvatar: creator.avatar,
          role: 'admin',
          joinedAt: group.members[0].joinedAt,
        }],
        createdAt: group.createdAt,
      },
      message: 'Group created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE - Delete group
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');
    
    if (!groupId || !userId) {
      return NextResponse.json({ error: 'Group ID and User ID are required' }, { status: 400 });
    }
    
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    // Check if user is the creator
    if (group.creatorId.toString() !== userId) {
      return NextResponse.json({ error: 'Only creator can delete the group' }, { status: 403 });
    }
    
    await Group.findByIdAndDelete(groupId);
    
    return NextResponse.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PATCH - Leave group
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const { groupId, userId } = await request.json();
    
    if (!groupId || !userId) {
      return NextResponse.json({ error: 'Group ID and User ID are required' }, { status: 400 });
    }
    
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    // Remove user from members
    group.members = group.members.filter((m: any) => m.userId.toString() !== userId);
    await group.save();
    
    return NextResponse.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
