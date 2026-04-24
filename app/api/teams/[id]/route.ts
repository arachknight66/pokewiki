/**
 * API Route: Teams Details - Get a specific team
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Team } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const teamId = params.id;

    // Fetch team
    const dbTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!dbTeam) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Team not found' } },
        { status: 404 }
      );
    }

    // Check authorization: must be public OR owned by user
    if (!dbTeam.is_public) {
      const isOwner = session?.user && (session.user as any).id === dbTeam.user_id;
      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
          { status: 403 }
        );
      }
    }

    // Map to Team interface
    const team: Team = {
      id: dbTeam.id,
      userId: dbTeam.user_id,
      name: dbTeam.name,
      description: dbTeam.description || undefined,
      format: dbTeam.format || 'OU',
      pokemonIds: dbTeam.pokemon_ids,
      ratingScore: dbTeam.rating_score ? Number(dbTeam.rating_score) : 0,
      isPublic: dbTeam.is_public || false,
      views: dbTeam.views || 0,
      createdAt: dbTeam.created_at as Date,
      updatedAt: dbTeam.updated_at as Date,
    };

    // Increment views asynchronously
    prisma.team.update({
      where: { id: teamId },
      data: { views: { increment: 1 } },
    }).catch(console.error);

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error('Team fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch team' } },
      { status: 500 }
    );
  }
}
