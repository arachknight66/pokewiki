/**
 * API Route: Teams - List and create teams
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateTeamSchema, TeamListSchema } from '@/lib/validators';
import { Team } from '@/lib/types';
import { rateTeam } from '@/lib/rating-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession(authOptions);
    
    // Parse pagination params
    const validation = TeamListSchema.safeParse({
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: searchParams.get('sortBy') || 'created',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid parameters',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const { page, pageSize, sortBy, sortOrder } = validation.data;
    const offset = (page - 1) * pageSize;

    // Build query conditions
    const whereClause: any = {
      is_public: true,
    };

    if (session?.user) {
      // If authenticated, include user's own teams
      whereClause.OR = [
        { is_public: true },
        { user_id: (session.user as any).id },
      ];
      delete whereClause.is_public; // Remove the single constraint since we have OR
    }

    // Determine sort column
    const orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy.rating_score = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.created_at = sortOrder;
    }

    const [total, dbTeams] = await Promise.all([
      prisma.team.count({ where: whereClause }),
      prisma.team.findMany({
        where: whereClause,
        orderBy,
        skip: offset,
        take: pageSize,
      }),
    ]);

    const teams: Team[] = dbTeams.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description || undefined,
      format: row.format || 'OU',
      pokemonIds: row.pokemon_ids,
      ratingScore: row.rating_score ? Number(row.rating_score) : 0,
      isPublic: row.is_public || false,
      views: row.views || 0,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      {
        success: true,
        data: teams,
        meta: {
          total,
          page,
          pageSize,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Teams list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch teams' },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = CreateTeamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const { name, description, format, pokemonIds } = validation.data;

    // Calculate initial rating (simplified for now)
    const ratingScore = Math.round(Math.random() * 40 + 40); // 40-80

    // Create team using Prisma
    const team = await prisma.team.create({
      data: {
        user_id: (session.user as any).id,
        name,
        description: description || null,
        format,
        pokemon_ids: pokemonIds,
        rating_score: ratingScore,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: team.id,
          userId: team.user_id,
          name: team.name,
          description: team.description,
          format: team.format,
          pokemonIds: team.pokemon_ids,
          ratingScore: team.rating_score ? Number(team.rating_score) : ratingScore,
          isPublic: team.is_public,
          views: team.views,
          createdAt: team.created_at,
          updatedAt: team.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CREATE_ERROR', message: 'Failed to create team' },
      },
      { status: 500 }
    );
  }
}
