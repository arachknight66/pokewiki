/**
 * API Route: Pokémon - Get single Pokémon details
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Pokemon, Move } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pokemonId = parseInt(params.id);

    if (isNaN(pokemonId)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_ID', message: 'Invalid Pokémon ID' },
        },
        { status: 400 }
      );
    }

    // Get Pokémon details
    const pokemonResult = await query(
      `SELECT 
        id, name, pokedex_number, description, generation,
        hp, attack, defense, spa, spd, spe,
        type_1, type_2, height, weight, base_exp, abilities, hidden_ability
      FROM pokemon WHERE id = $1`,
      [pokemonId]
    );

    if (pokemonResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Pokémon not found' },
        },
        { status: 404 }
      );
    }

    const row = pokemonResult.rows[0];

    const pokemon: Pokemon = {
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
      hiddenAbility: row.hidden_ability,
      height: row.height,
      weight: row.weight,
      baseExp: row.base_exp,
    };

    // Get available moves
    const movesResult = await query(
      `SELECT m.id, m.name, m.type, m.category, m.power, m.accuracy, m.pp, m.priority, m.description
       FROM moves m
       INNER JOIN pokemon_moves pm ON m.id = pm.move_id
       WHERE pm.pokemon_id = $1
       ORDER BY m.type, m.name`,
      [pokemonId]
    );

    const moves: Move[] = movesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      category: row.category,
      power: row.power,
      accuracy: row.accuracy,
      pp: row.pp,
      priority: row.priority,
      description: row.description,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          pokemon,
          moves,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Pokémon detail error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch Pokémon details' },
      },
      { status: 500 }
    );
  }
}
