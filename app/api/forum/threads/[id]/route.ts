import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateReplySchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        user: { select: { username: true } },
      }
    });

    if (!thread) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }
    
    // Also increment view count
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { views: { increment: 1 } }
    });
    
    const replies = await prisma.forumReply.findMany({
      where: { thread_id: threadId },
      orderBy: { created_at: 'asc' },
      include: {
        user: { select: { username: true } },
      }
    });

    const mappedThread = {
      ...thread,
      username: thread.user.username,
    };

    const mappedReplies = replies.map((r: any) => ({
      ...r,
      username: r.user.username,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        thread: mappedThread,
        replies: mappedReplies
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required to reply' } },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;
    const body = await req.json();
    const validation = CreateReplySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    
    const reply = await prisma.$transaction(async (tx) => {
      const newReply = await tx.forumReply.create({
        data: {
          thread_id: threadId,
          user_id: userId,
          body: validation.data.body,
        },
        include: {
           user: { select: { username: true } },
        }
      });

      await tx.forumThread.update({
        where: { id: threadId },
        data: { 
          replies_count: { increment: 1 },
          updated_at: new Date()
        }
      });
      
      return newReply;
    });

    const mappedReply = {
      ...reply,
      username: reply.user.username
    };
    
    return NextResponse.json({
      success: true,
      data: mappedReply
    }, { status: 201 });
  } catch (error) {
    console.error('Forum reply error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to post reply' } },
      { status: 500 }
    );
  }
}
