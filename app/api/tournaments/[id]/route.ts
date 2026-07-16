import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        creator: { select: { username: true } },
        _count: { select: { submissions: true } }
      }
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Tournament not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch tournament details' } },
      { status: 500 }
    );
  }
}
