/**
 * API Route: Pokémon - Get single Pokémon details (Migrated to PokeApi)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pokemon, Move } from '@/lib/types';
import { getPokemonDetail, getPokemonSpecies, getPokemonMovesData } from '@/lib/api/pokeApi';
import { getPokemonSprites } from '@/lib/sprites';

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

    // 1. Fetch from PokéAPI REST
    const [detailParams, speciesParams, movesData] = await Promise.all([
      getPokemonDetail(pokemonId).catch(() => null),
      getPokemonSpecies(pokemonId).catch(() => null),
      getPokemonMovesData(pokemonId).catch(() => null)
    ]);

    if (!detailParams) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Pokémon not found' },
        },
        { status: 404 }
      );
    }

    // 2. Map pokemon to Pokewiki type
    let description = 'No description available.';
    let generation = 1;

    if (speciesParams) {
      const flavor = speciesParams.flavor_text_entries?.find((f: any) => f.language.name === 'en');
      if (flavor) {
        description = flavor.flavor_text.replace(/\n|\f/g, ' ');
      }
      generation = parseInt(speciesParams.generation.url.split('/').filter(Boolean).pop() || '1');
    }

    const type1 = detailParams.types[0]?.type.name as any;
    const type2 = detailParams.types[1]?.type.name as any;

    const normalAbilities = detailParams.abilities.filter((a: any) => !a.is_hidden).map((a: any) => a.ability.name);
    const hiddenAbility = detailParams.abilities.find((a: any) => a.is_hidden)?.ability.name;

    const pokemon: Pokemon = {
      id: detailParams.id,
      name: detailParams.name.replace('-', ' '),
      pokedexNumber: detailParams.id,
      description,
      generation,
      stats: {
        hp: detailParams.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 0,
        attack: detailParams.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
        defense: detailParams.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 0,
        spa: detailParams.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 0,
        spd: detailParams.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 0,
        spe: detailParams.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0,
      },
      type1,
      type2,
      abilities: normalAbilities,
      hiddenAbility,
      height: detailParams.height / 10,
      weight: detailParams.weight / 10,
      baseExp: detailParams.base_experience,
      sprites: getPokemonSprites(detailParams.id),
    };

    // 3. Map moves to Pokewiki type
    // We combine levelUp and machine
    const allMoves = [...(movesData?.levelUp || []), ...(movesData?.machine || [])];
    
    // Deduplicate moves by name
    const uniqueMoves = new Map<string, typeof allMoves[0]>();
    allMoves.forEach(m => uniqueMoves.set(m.name, m));

    const moves: Move[] = Array.from(uniqueMoves.values()).map((m, idx) => ({
      id: idx + 1, // Fake ID
      name: m.name.replace('-', ' '),
      type: m.type as any,
      category: (m.damage_class === 'none' ? 'status' : m.damage_class) as any,
      power: m.power || undefined,
      accuracy: m.accuracy || undefined,
      pp: Math.max(10, Math.floor((m.power || 50) / 10)), // Approximate PP if omitted
      priority: 0,
      description: `Learned via ${m.method}`,
    }));

    // 4. Extract Pokédex entries from different games
    const pokedexEntries: { game: string; text: string }[] = [];
    if (speciesParams?.flavor_text_entries) {
      const seen = new Set<string>();
      speciesParams.flavor_text_entries
        .filter((f: any) => f.language.name === 'en')
        .forEach((f: any) => {
          const text = f.flavor_text.replace(/\n|\f/g, ' ').trim();
          // Deduplicate identical text across versions
          if (!seen.has(text)) {
            seen.add(text);
            pokedexEntries.push({
              game: f.version.name.replace('-', ' '),
              text,
            });
          }
        });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          pokemon,
          moves,
          pokedexEntries,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Pokémon detail error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch Pokémon details from PokeAPI' },
      },
      { status: 500 }
    );
  }
}
