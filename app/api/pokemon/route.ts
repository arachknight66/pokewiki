/**
 * API Route: Pokémon - List all Pokémon with filtering (Migrated to PokeApi)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PokemonFilterSchema } from '@/lib/validators';
import { Pokemon } from '@/lib/types';
import { getAllPokemonSearchData } from '@/lib/api/pokeApi';
import { getPokemonSprites } from '@/lib/sprites';

export const dynamic = 'force-dynamic';

// In-memory cache for fast pagination without hitting GraphQL every query
let cachedData: Pokemon[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 3600000; // 1 hour

async function fetchAllPokemon(): Promise<Pokemon[]> {
  if (cachedData && (Date.now() - lastFetchTime) < CACHE_TTL) {
    return cachedData;
  }
  
  const rawData = await getAllPokemonSearchData();
  cachedData = rawData.map(p => ({
    id: p.id,
    name: p.name.replace('-', ' '),
    pokedexNumber: p.id,
    description: "Data loaded from PokeAPI.",
    generation: p.generation_id,
    stats: p.stats,
    type1: p.types[0] as any,
    type2: p.types[1] as any,
    abilities: p.abilities,
    height: p.height,
    weight: p.weight,
    baseExp: p.base_exp,
    sprites: getPokemonSprites(p.id)
  }));
  lastFetchTime = Date.now();
  return cachedData;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const validation = PokemonFilterSchema.safeParse({
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      search: searchParams.get('search') || undefined,
      type1: searchParams.get('type1') || undefined,
      type2: searchParams.get('type2') || undefined,
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

    // Fetch all records
    const allPokemon = await fetchAllPokemon();

    // 1. Filter
    let filtered = allPokemon.filter(p => {
      // Name
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      // Types
      if (type1 && p.type1 !== type1) return false;
      if (type2) {
          if (p.type2 !== type2 && p.type1 !== type2) return false;
      }
      // Generation
      if (generation && p.generation !== generation) return false;
      
      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let valA: any = a.pokedexNumber;
      let valB: any = b.pokedexNumber;
      if (sortBy === 'name') {
        valA = a.name;
        valB = b.name;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 3. Paginate
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + pageSize);
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      {
        success: true,
        data: paginated,
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
    console.error('Pokémon list API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch Pokémon from PokeAPI',
        },
      },
      { status: 500 }
    );
  }
}
