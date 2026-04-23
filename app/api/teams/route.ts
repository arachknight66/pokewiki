/**
 * API Route: Teams - List and create teams
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { CreateTeamSchema, TeamListSchema } from '@/lib/validators';
import { Team } from '@/lib/types';
import { rateTeam } from '@/lib/rating-engine';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);
    
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

    // Build query
    let whereClause = 'is_public = true';
    let params: any[] = [];

    // If authenticated, include user's own teams
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        whereClause = `is_public = true OR user_id = $1`;
        params = [decoded.userId];
      }
    }

    const sortColumn = sortBy === 'rating' ? 'rating_score' : sortBy === 'name' ? 'name' : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM teams WHERE ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult.rows[0].total;

    // Get teams
    const paramIndex = params.length + 1;
    const dataQuery = `
      SELECT id, user_id, name, description, format, pokemon_ids, 
             rating_score, is_public, views, created_at, updated_at
      FROM teams
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(pageSize, offset);
    const result = await query(dataQuery, params);

    const teams: Team[] = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description || undefined,
      format: row.format,
      pokemonIds: row.pokemon_ids,
      ratingScore: row.rating_score,
      isPublic: row.is_public,
      views: row.views,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
    const token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
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
    const teamId = uuidv4();

    // Create team
    const result = await query(
      `INSERT INTO teams (id, user_id, name, description, format, pokemon_ids)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [teamId, decoded.userId, name, description || null, format, pokemonIds]
    );

    const team = result.rows[0];

    // Calculate initial rating (simplified for now)
    const ratingScore = Math.round(Math.random() * 40 + 40); // 40-80
    
    await query(
      'UPDATE teams SET rating_score = $1 WHERE id = $2',
      [ratingScore, teamId]
    );

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
          ratingScore,
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
