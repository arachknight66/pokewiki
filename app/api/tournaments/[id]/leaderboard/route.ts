import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Tournament not found' } },
        { status: 404 }
      );
    }

    const submissions = await prisma.tournamentSubmission.findMany({
      where: { tournament_id: tournamentId },
      orderBy: { elo_rating: 'desc' },
      include: {
        user: { select: { username: true } },
        team: { select: { name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Tournament leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch leaderboard' } },
      { status: 500 }
    );
  }
}
