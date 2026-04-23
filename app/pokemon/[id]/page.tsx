/**
 * Pokémon Detail Page — with 2D / 3D sprite gallery
 */

'use client';

import { useState } from 'react';
import { usePokemon } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const TYPE_COLORS: Record<string, string> = {
  normal:   '#A8A878', fire:     '#F08030', water:    '#6890F0',
  grass:    '#78C850', electric: '#F8D030', ice:      '#98D8D8',
  fighting: '#C03028', poison:   '#A040A0', ground:   '#E0C068',
  flying:   '#A890F0', psychic:  '#F85888', bug:      '#A8B820',
  rock:     '#B8A038', ghost:    '#705898', dragon:   '#7038F8',
  dark:     '#705848', steel:    '#B8B8D0', fairy:    '#EE99AC',
};

type SpriteTab = 'artwork' | 'home3d' | 'animated' | 'classic';

export default function PokemonDetailPage() {
  const params = useParams();
  const pokemonId = parseInt(params.id as string);
  const [spriteTab, setSpriteTab] = useState<SpriteTab>('artwork');
  const [showShiny, setShowShiny] = useState(false);

  const { data, isLoading, error } = usePokemon(pokemonId);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Loading Pokémon data...</p>
      </div>
    );

  if (error || !data?.pokemon)
    return (
      <Card className="text-center py-12">
        <p className="text-xl font-semibold">Pokémon not found</p>
        <Link href="/pokemon" className="text-blue-500 hover:underline mt-2 inline-block">
          ← Back to Pokédex
        </Link>
      </Card>
    );

  const pokemon = data.pokemon;
  const moves = data.moves || [];
  const pokedexEntries: { game: string; text: string }[] = data.pokedexEntries || [];
  const bgColor = TYPE_COLORS[pokemon.type1] || '#A8A878';

  const statsOrder = [
    { label: 'HP', key: 'hp', value: pokemon.stats.hp, color: '#FF5959' },
    { label: 'Attack', key: 'attack', value: pokemon.stats.attack, color: '#F5AC78' },
    { label: 'Defense', key: 'defense', value: pokemon.stats.defense, color: '#FAE078' },
    { label: 'Sp. Atk', key: 'spa', value: pokemon.stats.spa, color: '#9DB7F5' },
    { label: 'Sp. Def', key: 'spd', value: pokemon.stats.spd, color: '#A7DB8D' },
    { label: 'Speed', key: 'spe', value: pokemon.stats.spe, color: '#FA92B2' },
  ];

  const totalStats = statsOrder.reduce((sum, s) => sum + s.value, 0);
  const maxStat = 255;

  // Sprite sources
  const spriteMap: Record<SpriteTab, { normal: string; shiny: string; label: string }> = {
    artwork: {
      normal: pokemon.sprites?.officialArtwork || '',
      shiny: pokemon.sprites?.officialArtworkShiny || '',
      label: 'Official Artwork',
    },
    home3d: {
      normal: pokemon.sprites?.home3d || '',
      shiny: pokemon.sprites?.home3dShiny || '',
      label: '3D Home',
    },
    animated: {
      normal: pokemon.sprites?.showdownAnimated || '',
      shiny: pokemon.sprites?.showdownAnimatedShiny || '',
      label: 'Animated',
    },
    classic: {
      normal: pokemon.sprites?.front2d || '',
      shiny: pokemon.sprites?.frontShiny2d || '',
      label: 'Classic 2D',
    },
  };

  const currentSprite = showShiny
    ? spriteMap[spriteTab].shiny
    : spriteMap[spriteTab].normal;

  return (
    <div className="space-y-8">
      {/* Back nav */}
      <Link
        href="/pokemon"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        ← Back to Pokédex
      </Link>

      {/* Hero */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${bgColor}30, ${bgColor}15, transparent)`,
        }}
      >
        <div className="grid lg:grid-cols-2 gap-6 p-6 lg:p-10">
          {/* Sprite Gallery */}
          <div className="flex flex-col items-center">
            {/* Main sprite display */}
            <div
              className="relative w-full max-w-xs aspect-square rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `radial-gradient(circle, ${bgColor}20 0%, transparent 70%)` }}
            >
              {/* Watermark */}
              <span className="absolute top-4 left-4 text-6xl font-black opacity-[0.06] select-none">
                #{String(pokemon.pokedexNumber).padStart(3, '0')}
              </span>

              {currentSprite && (
                <Image
                  src={currentSprite}
                  alt={`${pokemon.name} ${spriteTab} ${showShiny ? 'shiny' : ''}`}
                  width={spriteTab === 'animated' ? 160 : 220}
                  height={spriteTab === 'animated' ? 160 : 220}
                  className="drop-shadow-2xl transition-all duration-500 object-contain"
                  style={{
                    imageRendering:
                      spriteTab === 'classic' || spriteTab === 'animated'
                        ? 'pixelated'
                        : 'auto',
                  }}
                  unoptimized
                />
              )}
            </div>

            {/* Sprite tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              {(Object.keys(spriteMap) as SpriteTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSpriteTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    spriteTab === tab
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {spriteMap[tab].label}
                </button>
              ))}
            </div>

            {/* Shiny toggle */}
            <button
              onClick={() => setShowShiny(!showShiny)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                showShiny
                  ? 'bg-amber-400 text-amber-900 shadow-md shadow-amber-200'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-base">✨</span>
              {showShiny ? 'Shiny Active' : 'Toggle Shiny'}
            </button>
          </div>

          {/* Info side */}
          <div className="flex flex-col justify-center space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1">
                #{String(pokemon.pokedexNumber).padStart(3, '0')} · Gen {pokemon.generation}
              </p>
              <h1 className="text-4xl lg:text-5xl font-extrabold capitalize">
                {pokemon.name}
              </h1>
            </div>

            <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} size="lg" />

            {pokemon.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                {pokemon.description}
              </p>
            )}

            {/* Quick physical data */}
            <div className="flex gap-6 pt-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">Height</p>
                <p className="text-lg font-bold">{pokemon.height ? `${pokemon.height} m` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Weight</p>
                <p className="text-lg font-bold">{pokemon.weight ? `${pokemon.weight} kg` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Base Exp</p>
                <p className="text-lg font-bold">{pokemon.baseExp || '—'}</p>
              </div>
            </div>

            <Link href="/team-builder">
              <Button>Use in Team Builder</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats + Abilities grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Base Stats */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold mb-5">Base Stats</h2>
            <div className="space-y-3">
              {statsOrder.map((stat) => (
                <div key={stat.key} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-semibold text-gray-500 text-right">
                    {stat.label}
                  </span>
                  <span className="w-10 text-sm font-bold text-right">{stat.value}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(stat.value / maxStat) * 100}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="w-16 text-xs font-bold text-gray-500 text-right">Total</span>
              <span className="w-10 text-lg font-black text-right">{totalStats}</span>
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(totalStats / (maxStat * 6)) * 100}%`,
                    background: `linear-gradient(90deg, ${bgColor}, ${bgColor}99)`,
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Abilities */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Abilities</h2>
          <div className="space-y-3">
            {pokemon.abilities?.map((ability: string) => (
              <div
                key={ability}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <p className="font-semibold capitalize text-sm">{ability.replace('-', ' ')}</p>
              </div>
            ))}
            {pokemon.hiddenAbility && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="font-semibold capitalize text-sm">
                  {pokemon.hiddenAbility.replace('-', ' ')}
                </p>
                <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 uppercase tracking-wider">
                  Hidden Ability
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pokédex Entries from Different Games */}
      {pokedexEntries.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Pokédex Entries</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {pokedexEntries.map((entry, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
              >
                <span
                  className="shrink-0 px-2.5 py-1 h-fit rounded-lg text-[10px] font-bold uppercase tracking-wider text-white text-center min-w-[80px]"
                  style={{ backgroundColor: bgColor }}
                >
                  {entry.game}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Moves */}
      {moves.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Moves ({moves.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {moves.map((move: any) => {
              const moveColor = TYPE_COLORS[move.type] || '#999';
              return (
                <div
                  key={move.id}
                  className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
                >
                  <p className="font-semibold capitalize text-sm mb-1.5">{move.name}</p>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span
                      className="px-2 py-0.5 rounded-md font-bold text-white capitalize"
                      style={{ backgroundColor: moveColor }}
                    >
                      {move.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 font-semibold capitalize">
                      {move.category}
                    </span>
                    {move.power && (
                      <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold">
                        PWR {move.power}
                      </span>
                    )}
                    {move.accuracy && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold">
                        ACC {move.accuracy}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Navigation between Pokémon */}
      <div className="flex justify-between">
        {pokemonId > 1 && (
          <Link
            href={`/pokemon/${pokemonId - 1}`}
            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← #{pokemonId - 1}
          </Link>
        )}
        <div />
        <Link
          href={`/pokemon/${pokemonId + 1}`}
          className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          #{pokemonId + 1} →
        </Link>
      </div>
    </div>
  );
}
