import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateReportSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required to report content' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validation = CreateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { targetType, targetId, reason } = validation.data;

    // Verify target exists
    if (targetType === 'thread') {
      const thread = await prisma.forumThread.findUnique({
        where: { id: targetId }
      });
      if (!thread) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Thread not found' } },
          { status: 404 }
        );
      }
    } else {
      const reply = await prisma.forumReply.findUnique({
        where: { id: targetId }
      });
      if (!reply) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Reply not found' } },
          { status: 404 }
        );
      }
    }

    // Insert report row
    const report = await prisma.forumReport.create({
      data: {
        reporter_id: userId,
        target_type: targetType,
        target_id: targetId,
        reason: reason || null,
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: report.id }
    }, { status: 201 });
  } catch (error) {
    console.error('Report content error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to submit report' } },
      { status: 500 }
    );
  }
}
