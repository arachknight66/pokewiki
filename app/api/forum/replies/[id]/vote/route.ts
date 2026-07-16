import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { VoteSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const replyId = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required to vote' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validation = VoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { voteType } = validation.data;

    // Check if reply exists
    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId }
    });

    if (!reply) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Reply not found' } },
        { status: 404 }
      );
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check for existing vote
      const existingVote = await tx.forumVote.findUnique({
        where: {
          user_id_reply_id: {
            user_id: userId,
            reply_id: replyId
          }
        }
      });

      if (!existingVote) {
        // Create new vote
        await tx.forumVote.create({
          data: {
            user_id: userId,
            reply_id: replyId,
            vote_type: voteType
          }
        });

        // Increment reply counters
        const upDiff = voteType === 'upvote' ? 1 : 0;
        const downDiff = voteType === 'downvote' ? 1 : 0;
        const netDiff = voteType === 'upvote' ? 1 : -1;

        return await tx.forumReply.update({
          where: { id: replyId },
          data: {
            upvotes: { increment: upDiff },
            downvotes: { increment: downDiff },
            net_votes: { increment: netDiff }
          }
        });
      }

      if (existingVote.vote_type === voteType) {
        // Remove existing vote (toggle off)
        await tx.forumVote.delete({
          where: { id: existingVote.id }
        });

        // Decrement reply counters
        const upDiff = voteType === 'upvote' ? -1 : 0;
        const downDiff = voteType === 'downvote' ? -1 : 0;
        const netDiff = voteType === 'upvote' ? -1 : 1;

        return await tx.forumReply.update({
          where: { id: replyId },
          data: {
            upvotes: { increment: upDiff },
            downvotes: { increment: downDiff },
            net_votes: { increment: netDiff }
          }
        });
      }

      // Switch vote (opposite type)
      await tx.forumVote.update({
        where: { id: existingVote.id },
        data: { vote_type: voteType }
      });

      // Adjust reply counters by 2
      const upDiff = voteType === 'upvote' ? 1 : -1;
      const downDiff = voteType === 'downvote' ? 1 : -1;
      const netDiff = voteType === 'upvote' ? 2 : -2;

      return await tx.forumReply.update({
        where: { id: replyId },
        data: {
          upvotes: { increment: upDiff },
          downvotes: { increment: downDiff },
          net_votes: { increment: netDiff }
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        net_votes: result.net_votes,
        userVote: voteType
      }
    });
  } catch (error) {
    console.error('Vote reply error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to record vote' } },
      { status: 500 }
    );
  }
}
