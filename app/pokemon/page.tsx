/**
 * Pokémon Database Page — Pokémon Anime-inspired Pokédex cards
 */

'use client';

import { useState } from 'react';
import { usePokemonList } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import PokeballLoader from '@/components/ui/PokeballLoader';
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

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

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
    { id: 1, label: 'I',    region: 'Kanto' },
    { id: 2, label: 'II',   region: 'Johto' },
    { id: 3, label: 'III',  region: 'Hoenn' },
    { id: 4, label: 'IV',   region: 'Sinnoh' },
    { id: 5, label: 'V',    region: 'Unova' },
    { id: 6, label: 'VI',   region: 'Kalos' },
    { id: 7, label: 'VII',  region: 'Alola' },
    { id: 8, label: 'VIII', region: 'Galar' },
    { id: 9, label: 'IX',   region: 'Paldea' },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-black font-display">
          <span className="anime-heading">Pokédex</span>
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>
          {pokemonListData?.meta?.total
            ? `${pokemonListData.meta.total} Pokémon discovered`
            : 'Browse all known Pokémon species'}
        </p>
      </div>

      {/* Filters — Pokédex panel style */}
      <div className="pokedex-panel p-5 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-2.5 rounded-xl text-sm"
          />
        </div>

        {/* Generation Filter */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Generation
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedGen(0); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200"
              style={{
                background: selectedGen === 0 ? 'linear-gradient(135deg, var(--pokedex-red), var(--pokedex-red-dark))' : 'var(--bg-secondary)',
                color: selectedGen === 0 ? 'white' : 'var(--text-secondary)',
                border: `2px solid ${selectedGen === 0 ? 'var(--pokedex-red-dark)' : 'var(--border-color)'}`,
                boxShadow: selectedGen === 0 ? '0 2px 8px rgba(var(--glow-color), 0.25)' : 'none',
              }}
            >
              All
            </button>
            {generations.map(gen => (
              <button
                key={gen.id}
                onClick={() => { setSelectedGen(gen.id); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 group"
                style={{
                  background: selectedGen === gen.id ? 'linear-gradient(135deg, var(--accent-secondary), #1D4ED8)' : 'var(--bg-secondary)',
                  color: selectedGen === gen.id ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${selectedGen === gen.id ? '#1E40AF' : 'var(--border-color)'}`,
                  boxShadow: selectedGen === gen.id ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                }}
                title={gen.region}
              >
                {gen.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedType(''); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all duration-200"
              style={{
                background: selectedType === '' ? 'linear-gradient(135deg, var(--pokedex-red), var(--pokedex-red-dark))' : 'var(--bg-secondary)',
                color: selectedType === '' ? 'white' : 'var(--text-secondary)',
                border: `2px solid ${selectedType === '' ? 'var(--pokedex-red-dark)' : 'var(--border-color)'}`,
              }}
            >
              All
            </button>
            {types.map(type => {
              const tc = TYPE_COLORS[type];
              const isActive = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setPage(1); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all duration-200"
                  style={{
                    background: isActive ? tc : 'var(--bg-secondary)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    border: `2px solid ${isActive ? tc : 'var(--border-color)'}`,
                    boxShadow: isActive ? `0 2px 10px ${tc}55` : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <PokeballLoader message="Catching Pokémon data..." />
      ) : pokemonListData?.data?.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-2xl font-black font-display mb-2">No Pokémon found</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
            {pokemonListData?.data?.map((pokemon: Pokemon) => {
              const bgColor = TYPE_COLORS[pokemon.type1] || '#A8A878';
              const rgb = hexToRgb(bgColor);
              return (
                <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`}>
                  <div
                    className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer energy-burst"
                    style={{
                      background: 'var(--bg-card)',
                      border: `2px solid rgba(${rgb}, 0.2)`,
                      boxShadow: 'var(--shadow-card)',
                      ['--glow-color' as any]: rgb,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 8px 25px rgba(${rgb}, 0.2), 0 0 30px rgba(${rgb}, 0.08)`;
                      e.currentTarget.style.borderColor = `rgba(${rgb}, 0.5)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                      e.currentTarget.style.borderColor = `rgba(${rgb}, 0.2)`;
                    }}
                  >
                    {/* Type color stripe at top */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${bgColor}, ${bgColor}88)` }} />

                    {/* Type gradient overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] transition-opacity group-hover:opacity-[0.08] dark:group-hover:opacity-[0.14]"
                      style={{ background: `linear-gradient(135deg, ${bgColor}44, transparent 60%)` }}
                    />

                    {/* Pokédex number watermark */}
                    <span className="absolute top-3 right-3 text-4xl font-black select-none opacity-[0.04] dark:opacity-[0.07] font-display">
                      #{String(pokemon.pokedexNumber).padStart(3, '0')}
                    </span>

                    {/* Sprite */}
                    <div className="relative flex items-center justify-center pt-4 pb-2 h-36">
                      {/* Radial glow behind sprite */}
                      <div
                        className="absolute inset-0 m-auto w-20 h-20 rounded-full opacity-15 dark:opacity-25 blur-2xl transition-opacity group-hover:opacity-30 dark:group-hover:opacity-45"
                        style={{ backgroundColor: bgColor }}
                      />
                      {pokemon.sprites?.officialArtwork && (
                        <Image
                          src={pokemon.sprites.officialArtwork}
                          alt={pokemon.name}
                          width={120}
                          height={120}
                          className="relative z-10 drop-shadow-lg group-hover:scale-110 group-hover:drop-shadow-2xl transition-all duration-300 ease-smooth object-contain"
                          unoptimized
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="relative z-10 px-3.5 pb-3.5 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: bgColor }}>
                        #{String(pokemon.pokedexNumber).padStart(3, '0')}
                      </p>
                      <h3 className="text-sm font-extrabold font-display capitalize leading-tight">
                        {pokemon.name}
                      </h3>
                      <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} size="sm" />

                      {/* Quick Stats */}
                      <div className="flex gap-1 pt-1">
                        {[
                          { label: 'HP', val: pokemon.stats.hp },
                          { label: 'ATK', val: pokemon.stats.attack },
                          { label: 'SPE', val: pokemon.stats.spe },
                        ].map(s => (
                          <div
                            key={s.label}
                            className="flex-1 text-center rounded-md py-1"
                            style={{ backgroundColor: `rgba(${rgb}, 0.07)`, border: `1px solid rgba(${rgb}, 0.1)` }}
                          >
                            <p className="text-[8px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                              {s.label}
                            </p>
                            <p className="text-[11px] font-black">{s.val}</p>
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
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="anime-btn px-5 py-2.5 rounded-xl font-extrabold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color-bold)',
                }}
              >
                ← Prev
              </button>
              <span className="text-sm font-extrabold px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)' }}>
                {page} / {pokemonListData?.meta?.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pokemonListData?.meta?.totalPages}
                className="anime-btn px-5 py-2.5 rounded-xl font-extrabold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color-bold)',
                }}
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
