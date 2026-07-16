import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateReplySchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const replyId = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } },
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

    // Check if reply exists and user is owner
    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId }
    });

    if (!reply) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Reply not found' } },
        { status: 404 }
      );
    }

    if (reply.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You can only edit your own replies' } },
        { status: 403 }
      );
    }

    const updated = await prisma.forumReply.update({
      where: { id: replyId },
      data: {
        body: validation.data.body,
        is_edited: true,
        edited_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Edit reply error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to edit reply' } },
      { status: 500 }
    );
  }
}
