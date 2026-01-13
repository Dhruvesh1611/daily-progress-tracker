import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Schedule from '@/models/Schedule';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const sched = await Schedule.findOne({ userId }).lean();
    if (!sched) return NextResponse.json({ entries: {} });

    // convert Map to plain object
    const entries = {} as any;
    if (sched.entries) {
      for (const [k, v] of sched.entries.entries()) entries[k] = v;
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Schedule GET error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, entries } = body;
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    // Upsert schedule
    const doc = await Schedule.findOneAndUpdate(
      { userId },
      { entries: entries || {} },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, schedule: doc });
  } catch (error) {
    console.error('Schedule POST error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await Schedule.deleteOne({ userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Schedule DELETE error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
