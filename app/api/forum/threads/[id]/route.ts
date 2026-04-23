/**
 * API Route: Forum Thread Detail - Get Details and Add Replies
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { CreateReplySchema } from '@/lib/validators';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    
    // 1. Fetch thread info
    const threadResult = await query(
      'SELECT * FROM forum_threads WHERE id = $1',
      [threadId]
    );
    
    if (threadResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }
    
    // 2. Fetch replies
    const repliesResult = await query(
      'SELECT * FROM forum_replies WHERE thread_id = $1 ORDER BY created_at ASC',
      [threadId]
    );
    
    return NextResponse.json({
      success: true,
      data: {
        thread: threadResult.rows[0],
        replies: repliesResult.rows
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
    
    const result = await query(
      `INSERT INTO forum_replies (thread_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [threadId, decoded.userId, validation.data.body]
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Forum reply error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to post reply' } },
      { status: 500 }
    );
  }
}
