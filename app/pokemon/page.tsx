/**
 * Pokémon Database Page — with sprite images
 */

'use client';

import { useState } from 'react';
import { usePokemonList } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import { Pokemon } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

const TYPE_COLORS: Record<string, string> = {
  normal:   '#A8A878', fire:     '#F08030', water:    '#6890F0',
  grass:    '#78C850', electric: '#F8D030', ice:      '#98D8D8',
  fighting: '#C03028', poison:   '#A040A0', ground:   '#E0C068',
  flying:   '#A890F0', psychic:  '#F85888', bug:      '#A8B820',
  rock:     '#B8A038', ghost:    '#705898', dragon:   '#7038F8',
  dark:     '#705848', steel:    '#B8B8D0', fairy:    '#EE99AC',
};

export default function PokemonPage() {
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedGen, setSelectedGen] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: pokemonListData, isLoading } = usePokemonList({
    page,
    pageSize: 20,
    search: searchTerm,
    type1: selectedType,
    generation: selectedGen,
  });

  const types = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const generations = [
    { id: 1, label: 'Gen I',   region: 'Kanto' },
    { id: 2, label: 'Gen II',  region: 'Johto' },
    { id: 3, label: 'Gen III', region: 'Hoenn' },
    { id: 4, label: 'Gen IV',  region: 'Sinnoh' },
    { id: 5, label: 'Gen V',   region: 'Unova' },
    { id: 6, label: 'Gen VI',  region: 'Kalos' },
    { id: 7, label: 'Gen VII', region: 'Alola' },
    { id: 8, label: 'Gen VIII',region: 'Galar' },
    { id: 9, label: 'Gen IX',  region: 'Paldea' },
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
      <Card className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search Pokémon by name..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Generation Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Generation</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedGen(0); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedGen === 0
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {generations.map(gen => (
              <button
                key={gen.id}
                onClick={() => { setSelectedGen(gen.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedGen === gen.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {gen.label}
                <span className="ml-1 opacity-60 hidden sm:inline">({gen.region})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Type</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedType('');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedType === ''
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg scale-105'
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
                className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  backgroundColor: selectedType === type ? TYPE_COLORS[type] : undefined,
                  color: selectedType === type ? '#fff' : undefined,
                  boxShadow: selectedType === type ? `0 4px 14px ${TYPE_COLORS[type]}66` : undefined,
                  transform: selectedType === type ? 'scale(1.08)' : undefined,
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-64">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-4" />
              <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-2/3 mb-2" />
              <div className="bg-gray-200 dark:bg-gray-700 rounded h-3 w-1/3" />
            </Card>
          ))}
        </div>
      ) : pokemonListData?.data?.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-xl text-gray-500">No Pokémon found</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pokemonListData?.data?.map((pokemon: Pokemon) => {
              const bgColor = TYPE_COLORS[pokemon.type1] || '#A8A878';
              return (
                <Link
                  key={pokemon.id}
                  href={`/pokemon/${pokemon.id}`}
                >
                  <div
                    className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${bgColor}22, ${bgColor}44)`,
                      border: `1px solid ${bgColor}33`,
                    }}
                  >
                    {/* Pokédex number watermark */}
                    <span
                      className="absolute top-2 right-3 text-5xl font-black opacity-[0.07] select-none"
                    >
                      #{String(pokemon.pokedexNumber).padStart(3, '0')}
                    </span>

                    {/* Sprite */}
                    <div className="relative flex items-center justify-center pt-4 pb-2 h-36">
                      {pokemon.sprites?.officialArtwork && (
                        <Image
                          src={pokemon.sprites.officialArtwork}
                          alt={pokemon.name}
                          width={120}
                          height={120}
                          className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300 object-contain"
                          unoptimized
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-4 pb-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">
                        #{String(pokemon.pokedexNumber).padStart(3, '0')}
                      </p>
                      <h3 className="text-base font-bold capitalize leading-tight">
                        {pokemon.name}
                      </h3>
                      <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} size="sm" />

                      {/* Quick Stats Row */}
                      <div className="flex gap-1 pt-1">
                        {[
                          { label: 'HP', val: pokemon.stats.hp },
                          { label: 'ATK', val: pokemon.stats.attack },
                          { label: 'SPE', val: pokemon.stats.spe },
                        ].map(s => (
                          <div
                            key={s.label}
                            className="flex-1 text-center rounded-md py-1"
                            style={{ backgroundColor: `${bgColor}18` }}
                          >
                            <p className="text-[10px] font-medium opacity-60">{s.label}</p>
                            <p className="text-xs font-bold">{s.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {(pokemonListData?.meta?.totalPages || 0) > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Page {page} of {pokemonListData?.meta?.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pokemonListData?.meta?.totalPages}
                className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
