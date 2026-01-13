import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, use Supabase/Firebase
const tasks = new Map();

export async function GET(_request: NextRequest) {
  try {
    const tasks_array = Array.from(tasks.values());
    return NextResponse.json(tasks_array);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const taskId = Date.now().toString();
    
    const newTask = {
      id: taskId,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    tasks.set(taskId, newTask);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 400 }
    );
  }
}
