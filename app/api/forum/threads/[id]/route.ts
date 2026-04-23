/**
 * API Route: Forum Thread Detail - Get Details and Add Replies
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { CreateReplySchema } from '@/lib/validators';
import { getThreadById, getRepliesForThread, createReply } from '@/lib/forum-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    
    const thread = getThreadById(threadId);
    if (!thread) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }
    
    const replies = getRepliesForThread(threadId);
    
    return NextResponse.json({
      success: true,
      data: {
        thread,
        replies
      }
    });
  } catch (error) {
    console.error('Forum detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal error' } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    const token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required to reply' } },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired' } },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validation = CreateReplySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    
    const reply = createReply(threadId, decoded.userId, validation.data.body);
    
    return NextResponse.json({
      success: true,
      data: reply
    }, { status: 201 });
  } catch (error) {
    console.error('Forum reply error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to post reply' } },
      { status: 500 }
    );
  }
}
