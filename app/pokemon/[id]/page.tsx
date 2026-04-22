/**
 * Pokémon Detail Page
 */

'use client';

import { usePokemon } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PokemonDetailPage() {
  const params = useParams();
  const pokemonId = parseInt(params.id as string);

  const { data, isLoading, error } = usePokemon(pokemonId);

  if (isLoading) return <Card className="text-center py-8">Loading...</Card>;
  if (error || !data?.pokemon)
    return <Card className="text-center py-8">Pokémon not found</Card>;

  const pokemon = data.pokemon;
  const moves = data.moves || [];

  const statsOrder = [
    { label: 'HP', value: pokemon.stats.hp },
    { label: 'Attack', value: pokemon.stats.attack },
    { label: 'Defense', value: pokemon.stats.defense },
    { label: 'Sp. Atk', value: pokemon.stats.spa },
    { label: 'Sp. Def', value: pokemon.stats.spd },
    { label: 'Speed', value: pokemon.stats.spe },
  ];

  const maxStat = 200;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold capitalize mb-2">{pokemon.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            #{pokemon.pokedexNumber}
          </p>
        </div>
        <Link href="/team-builder">
          <Button>Use in Team</Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {pokemon.description && (
            <Card>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {pokemon.description}
              </p>
            </Card>
          )}

          {/* Types and Abilities */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Typing & Abilities</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Types
                </p>
                <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} size="lg" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Abilities
                </p>
                <div className="space-y-2">
                  {pokemon.abilities?.map((ability: string) => (
                    <div
                      key={ability}
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded capitalize"
                    >
                      {ability}
                    </div>
                  ))}
                  {pokemon.hiddenAbility && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 capitalize">
                      {pokemon.hiddenAbility} <small className="text-yellow-700 dark:text-yellow-300">(Hidden)</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Physical Data */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Physical Data</h2>
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Height</p>
                <p className="text-2xl font-bold">
                  {pokemon.height ? `${pokemon.height} m` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weight</p>
                <p className="text-2xl font-bold">
                  {pokemon.weight ? `${pokemon.weight} kg` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* Moves */}
          {moves.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Moves ({moves.length})</h2>
              <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {moves.map((move: any) => (
                  <div
                    key={move.id}
                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <p className="font-semibold capitalize">{move.name}</p>
                    <div className="flex gap-2 mt-1 text-xs">
                      <span
                        className="px-2 py-1 rounded text-white capitalize"
                        style={{
                          backgroundColor: {
                            fire: '#F08030',
                            water: '#6890F0',
                            grass: '#78C850',
                            electric: '#F8D030',
                            // ... add more colors as needed
                          }[move.type] || '#ccc',
                        }}
                      >
                        {move.type}
                      </span>
                      <span className="px-2 py-1 rounded bg-gray-300 dark:bg-gray-700 capitalize">
                        {move.category}
                      </span>
                      {move.power && <span className="px-2 py-1">Power: {move.power}</span>}
                    </div>
                    {move.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {move.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Stats */}
        <div>
          <Card className="sticky top-8">
            <h2 className="text-xl font-semibold mb-6">Base Stats</h2>
            <div className="space-y-4">
              {statsOrder.map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium">{stat.label}</span>
                    <span className="font-bold">{stat.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${(stat.value / maxStat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Total Stats
                </p>
                <p className="text-3xl font-bold">
                  {Object.values(pokemon.stats).reduce((a: number, b: number) => a + b, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
