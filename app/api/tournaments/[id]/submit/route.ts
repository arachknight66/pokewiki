import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TournamentSubmissionSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validation = TournamentSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { teamId } = validation.data;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: { select: { submissions: true } }
      }
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Tournament not found' } },
        { status: 404 }
      );
    }

    // Check tournament status is 'open'
    if (tournament.status !== 'open') {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Submissions are only allowed for open tournaments' } },
        { status: 400 }
      );
    }

    // Check participant limit
    const maxParticipants = tournament.max_participants || 64;
    if (tournament._count.submissions >= maxParticipants) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Tournament is full' } },
        { status: 400 }
      );
    }

    // Check if user owns the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        user_id: userId
      }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You can only submit your own teams' } },
        { status: 403 }
      );
    }

    // Check if user has already submitted a team to this tournament
    const existingSubmission = await prisma.tournamentSubmission.findFirst({
      where: {
        tournament_id: tournamentId,
        user_id: userId
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'You have already submitted a team to this tournament' } },
        { status: 400 }
      );
    }

    // Insert submission
    const submission = await prisma.tournamentSubmission.create({
      data: {
        tournament_id: tournamentId,
        user_id: userId,
        team_id: teamId,
        rating_at_submission: team.rating_score || 0,
        elo_rating: 1600,
        wins: 0,
        losses: 0
      }
    });

    return NextResponse.json({
      success: true,
      data: submission
    }, { status: 201 });
  } catch (error) {
    console.error('Submit tournament team error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to submit team' } },
      { status: 500 }
    );
  }
}
