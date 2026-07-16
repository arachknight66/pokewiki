import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Run count queries in parallel
    const [teamsCount, threadsCount, repliesCount, submissionsCount] = await Promise.all([
      prisma.team.count({ where: { user_id: userId } }),
      prisma.forumThread.count({ where: { user_id: userId } }),
      prisma.forumReply.count({ where: { user_id: userId } }),
      prisma.tournamentSubmission.count({ where: { user_id: userId } }),
    ]);

    // Retrieve tournament registry history with details
    const submissions = await prisma.tournamentSubmission.findMany({
      where: { user_id: userId },
      include: {
        tournament: {
          select: {
            name: true,
            status: true,
            format: true
          }
        },
        team: {
          select: {
            name: true
          }
        }
      },
      orderBy: { submitted_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          teams: teamsCount,
          threads: threadsCount,
          replies: repliesCount,
          submissions: submissionsCount,
        },
        submissions: submissions.map(sub => ({
          id: sub.id,
          tournamentId: sub.tournament_id,
          tournamentName: sub.tournament.name,
          tournamentStatus: sub.tournament.status,
          tournamentFormat: sub.tournament.format,
          teamName: sub.team.name,
          elo: Math.round(Number(sub.elo_rating || 1600)),
          wins: sub.wins || 0,
          losses: sub.losses || 0,
          submittedAt: sub.submitted_at
        }))
      }
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve trainer stats' } },
      { status: 500 }
    );
  }
}
