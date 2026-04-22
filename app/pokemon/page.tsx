/**
 * Pokémon Database Page
 */

'use client';

import { useState } from 'react';
import { usePokemonList, usePokemon } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import { Pokemon } from '@/lib/types';
import Link from 'next/link';

export default function PokemonPage() {
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: pokemonListData, isLoading } = usePokemonList({
    page,
    pageSize: 20,
    search: searchTerm,
    type1: selectedType,
  });

  const types = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Pokémon Database</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Browse and analyze all Pokémon with detailed stats
        </p>
      </div>

      {/* Filters */}
      <Card className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search Pokémon by name..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Filter by Type</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <button
              onClick={() => {
                setSelectedType('');
                setPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <Card className="text-center py-8">Loading Pokémon...</Card>
      ) : pokemonListData?.data?.length === 0 ? (
        <Card className="text-center py-8">No Pokémon found</Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pokemonListData?.data?.map((pokemon: Pokemon) => (
              <Link
                key={pokemon.id}
                href={`/pokemon/${pokemon.id}`}
              >
                <Card hoverable className="h-full">
                  <h3 className="text-lg font-semibold capitalize mb-2">{pokemon.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    #{pokemon.pokedexNumber}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Type</p>
                      <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} size="sm" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <p className="font-semibold">{pokemon.stats.hp}</p>
                        <p className="text-gray-600 dark:text-gray-400">HP</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <p className="font-semibold">{pokemon.stats.attack}</p>
                        <p className="text-gray-600 dark:text-gray-400">ATK</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <p className="font-semibold">{pokemon.stats.spe}</p>
                        <p className="text-gray-600 dark:text-gray-400">SPE</p>
                      </div>
                    </div>

                    {pokemon.abilities && pokemon.abilities.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Abilities ({pokemon.abilities.length})
                        </p>
                        <p className="text-xs capitalize">{pokemon.abilities[0]}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {(pokemonListData?.meta?.totalPages || 0) > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {pokemonListData?.meta?.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pokemonListData?.meta?.totalPages}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
