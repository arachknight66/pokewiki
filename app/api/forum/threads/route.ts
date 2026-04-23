/**
 * API Route: Forum Threads - List and Create
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { CreateThreadSchema } from '@/lib/validators';
import { getThreads, createThread } from '@/lib/forum-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    const threads = getThreads(category);
    
    return NextResponse.json({
      success: true,
      data: threads
    });
  } catch (error) {
    console.error('Forum list error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch threads' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid session' } },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validation = CreateThreadSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    
    const { title, body: threadBody, category } = validation.data;
    
    const thread = createThread(decoded.userId, category, title, threadBody);
    
    return NextResponse.json({
      success: true,
      data: thread
    }, { status: 201 });
  } catch (error) {
    console.error('Forum create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create thread' } },
      { status: 500 }
    );
  }
}
