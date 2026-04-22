/**
 * API Route: Pokémon - List all Pokémon with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { PokemonFilterSchema } from '@/lib/validators';
import { Pokemon } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const validation = PokemonFilterSchema.safeParse({
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      search: searchParams.get('search'),
      type1: searchParams.get('type1'),
      type2: searchParams.get('type2'),
      generation: searchParams.get('generation') ? parseInt(searchParams.get('generation')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'id',
      sortOrder: searchParams.get('sortOrder') || 'asc',
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

    const { page, pageSize, search, type1, type2, generation, sortBy, sortOrder } = validation.data;
    const offset = (page - 1) * pageSize;

    // Build dynamic query
    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type1) {
      whereConditions.push(`type_1 = $${paramIndex}`);
      params.push(type1);
      paramIndex++;
    }

    if (type2) {
      whereConditions.push(`type_2 = $${paramIndex}`);
      params.push(type2);
      paramIndex++;
    }

    if (generation) {
      whereConditions.push(`generation = $${paramIndex}`);
      params.push(generation);
      paramIndex++;
    }

    let whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const sortColumn = sortBy === 'id' ? 'pokedex_number' : 'name';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM pokemon ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult.rows[0].total;

    // Get paginated results
    const dataQuery = `
      SELECT 
        id, name, pokedex_number, description, generation,
        hp, attack, defense, spa, spd, spe,
        type_1, type_2, height, weight, base_exp, abilities
      FROM pokemon
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(pageSize, offset);

    const result = await query(dataQuery, params);

    const pokemon: Pokemon[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      pokedexNumber: row.pokedex_number,
      description: row.description,
      generation: row.generation,
      stats: {
        hp: row.hp,
        attack: row.attack,
        defense: row.defense,
        spa: row.spa,
        spd: row.spd,
        spe: row.spe,
      },
      type1: row.type_1,
      type2: row.type_2,
      abilities: row.abilities || [],
      height: row.height,
      weight: row.weight,
      baseExp: row.base_exp,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      {
        success: true,
        data: pokemon,
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
    console.error('Pokémon list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch Pokémon',
        },
      },
      { status: 500 }
    );
  }
}
