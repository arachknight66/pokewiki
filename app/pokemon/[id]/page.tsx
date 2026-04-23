/**
 * Pokémon Detail Page — Anime battle card style
 */

'use client';

import { useState } from 'react';
import { usePokemon } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import { Button } from '@/components/ui/Button';
import PokeballLoader from '@/components/ui/PokeballLoader';
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

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

type SpriteTab = 'artwork' | 'home3d' | 'animated' | 'classic';

export default function PokemonDetailPage() {
  const params = useParams();
  const pokemonId = parseInt(params.id as string);
  const [spriteTab, setSpriteTab] = useState<SpriteTab>('artwork');
  const [showShiny, setShowShiny] = useState(false);

  const { data, isLoading, error } = usePokemon(pokemonId);

  if (isLoading)
    return <PokeballLoader message="Loading Pokémon data..." />;

  if (error || !data?.pokemon)
    return (
      <Card className="text-center py-16">
        <p className="text-2xl font-black font-display">Pokémon not found</p>
        <Link href="/pokemon" className="inline-block mt-3 text-sm font-bold" style={{ color: 'var(--pokedex-red)' }}>
          ← Back to Pokédex
        </Link>
      </Card>
    );

  const pokemon = data.pokemon;
  const moves = data.moves || [];
  const pokedexEntries: { game: string; text: string }[] = data.pokedexEntries || [];
  const bgColor = TYPE_COLORS[pokemon.type1] || '#A8A878';
  const rgb = hexToRgb(bgColor);

  const statsOrder = [
    { label: 'HP',      key: 'hp',      value: pokemon.stats.hp,      color: '#FF5959' },
    { label: 'Attack',  key: 'attack',  value: pokemon.stats.attack,  color: '#F5AC78' },
    { label: 'Defense', key: 'defense', value: pokemon.stats.defense, color: '#FAE078' },
    { label: 'Sp. Atk', key: 'spa',     value: pokemon.stats.spa,     color: '#9DB7F5' },
    { label: 'Sp. Def', key: 'spd',     value: pokemon.stats.spd,     color: '#A7DB8D' },
    { label: 'Speed',   key: 'spe',     value: pokemon.stats.spe,     color: '#FA92B2' },
  ];

  const totalStats = statsOrder.reduce((sum, s) => sum + s.value, 0);
  const maxStat = 255;

  const spriteMap: Record<SpriteTab, { normal: string; shiny: string; label: string }> = {
    artwork: {
      normal: pokemon.sprites?.officialArtwork || '',
      shiny:  pokemon.sprites?.officialArtworkShiny || '',
      label:  'Official Art',
    },
    home3d: {
      normal: pokemon.sprites?.home3d || '',
      shiny:  pokemon.sprites?.home3dShiny || '',
      label:  '3D Home',
    },
    animated: {
      normal: pokemon.sprites?.showdownAnimated || '',
      shiny:  pokemon.sprites?.showdownAnimatedShiny || '',
      label:  'Animated',
    },
    classic: {
      normal: pokemon.sprites?.front2d || '',
      shiny:  pokemon.sprites?.frontShiny2d || '',
      label:  'Classic 2D',
    },
  };

  const currentSprite = showShiny
    ? spriteMap[spriteTab].shiny
    : spriteMap[spriteTab].normal;

  return (
    <div className="space-y-8 stagger-children">
      {/* Back nav */}
      <Link
        href="/pokemon"
        className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:translate-x-[-4px]"
        style={{ color: 'var(--pokedex-red)' }}
      >
        ← Back to Pokédex
      </Link>

      {/* Hero — Flat Anime Card */}
      <div
        className="rounded-[2rem] overflow-hidden relative transition-all duration-300"
        style={{
          background: 'var(--bg-card)',
          border: `4px solid var(--text-primary)`,
          boxShadow: `12px 12px 0px var(--text-primary)`,
        }}
      >
        {/* Animated Background layer - Flat Shapes */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white/5 dark:bg-black/20">
          <div
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 border-8"
            style={{ borderColor: bgColor, borderStyle: 'solid' }}
          />
          <div
            className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] border-8 opacity-20 transform rotate-12"
            style={{ borderColor: bgColor, borderStyle: 'solid' }}
          />

          {/* Electric particles themed to pokemon type - Flat Blocks */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="absolute w-4 h-4 border-2" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `electricFloat 3s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
              background: bgColor,
              borderColor: 'var(--text-primary)',
              transform: `rotate(${Math.random() * 90}deg)`
            }} />
          ))}

          {/* Speed lines */}
          <div className="absolute inset-0" style={{
            background: `repeating-linear-gradient(45deg, transparent 0px, transparent 40px, rgba(0,0,0, 0.05) 40px, rgba(0,0,0, 0.05) 44px)`,
          }} />
        </div>

        {/* Type color stripe at top */}
        <div className="h-1.5 w-full relative z-10" style={{ background: `linear-gradient(90deg, ${bgColor}, ${bgColor}88, transparent)` }} />

        <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-10 relative z-10">
          {/* Sprite Gallery */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-xs aspect-square rounded-2xl flex items-center justify-center mb-5 group">
              {/* Solid geometric backdrop for pokemon */}
              <div
                className="absolute inset-0 m-auto w-40 h-40 rounded-full border-4 opacity-50 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: bgColor, borderColor: 'var(--text-primary)' }}
              />

              {/* Pokédex number watermark */}
              <span className="absolute top-4 left-4 text-6xl font-black select-none opacity-[0.06] dark:opacity-[0.12] font-display">
                #{String(pokemon.pokedexNumber).padStart(3, '0')}
              </span>

              {currentSprite && (
                <Image
                  src={currentSprite}
                  alt={`${pokemon.name} ${spriteTab} ${showShiny ? 'shiny' : ''}`}
                  width={spriteTab === 'animated' ? 160 : 240}
                  height={spriteTab === 'animated' ? 160 : 240}
                  className="relative z-10 transition-all duration-300 object-contain group-hover:-translate-y-2"
                  style={{
                    imageRendering: spriteTab === 'classic' || spriteTab === 'animated' ? 'pixelated' : 'auto',
                    filter: showShiny ? `drop-shadow(4px 4px 0px rgba(245, 158, 11, 1))` : `drop-shadow(4px 4px 0px rgba(0, 0, 0, 1))`,
                  }}
                  unoptimized
                />
              )}
            </div>

            {/* Sprite tabs */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-3">
              {(Object.keys(spriteMap) as SpriteTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSpriteTab(tab)}
                  className="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200"
                  style={{
                    background: spriteTab === tab ? bgColor : 'var(--bg-secondary)',
                    color: spriteTab === tab ? '#fff' : 'var(--text-secondary)',
                    border: `2px solid ${spriteTab === tab ? bgColor : 'var(--border-color)'}`,
                    boxShadow: spriteTab === tab ? `0 2px 10px ${bgColor}44` : 'none',
                  }}
                >
                  {spriteMap[tab].label}
                </button>
              ))}
            </div>

            {/* Shiny toggle */}
            <button
              onClick={() => setShowShiny(!showShiny)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300"
              style={{
                background: showShiny ? 'linear-gradient(135deg, #F59E0B, #EAB308)' : 'var(--bg-secondary)',
                color: showShiny ? '#78350f' : 'var(--text-secondary)',
                border: `2px solid ${showShiny ? '#D97706' : 'var(--border-color)'}`,
                boxShadow: showShiny ? '0 4px 15px rgba(245, 158, 11, 0.35)' : 'none',
              }}
            >
              <span className="text-base">✨</span>
              {showShiny ? 'Shiny Active' : 'Toggle Shiny'}
            </button>
          </div>

          {/* Info side */}
          <div className="flex flex-col justify-center space-y-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: bgColor }}>
                #{String(pokemon.pokedexNumber).padStart(3, '0')} · Gen {pokemon.generation}
              </p>
              <h1 className="text-4xl lg:text-5xl font-black font-display capitalize">
                {pokemon.name}
              </h1>
            </div>

            <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} size="lg" />

            {pokemon.description && (
              <p className="leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                {pokemon.description}
              </p>
            )}

            {/* Physical data */}
            <div className="flex gap-6 pt-2">
              {[
                { label: 'Height', val: pokemon.height ? `${pokemon.height} m` : '—' },
                { label: 'Weight', val: pokemon.weight ? `${pokemon.weight} kg` : '—' },
                { label: 'Base Exp', val: pokemon.baseExp || '—' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {item.label}
                  </p>
                  <p className="text-xl font-black font-display">{item.val}</p>
                </div>
              ))}
            </div>

            <Link href="/team-builder">
              <Button size="lg">⚔️ Use in Team Builder</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats + Abilities */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Base Stats — battle HUD style */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-black font-display mb-5 flex items-center gap-2">
              <span style={{ color: 'var(--pokedex-red)' }}>⬣</span> Base Stats
            </h2>
            <div className="space-y-3">
              {statsOrder.map((stat) => (
                <div key={stat.key} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-extrabold text-right" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </span>
                  <span className="w-10 text-sm font-black text-right">{stat.value}</span>
                  <div className="stat-bar-track flex-1">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: `${(stat.value / maxStat) * 100}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '2px solid var(--border-color)' }}>
              <span className="w-16 text-xs font-black text-right" style={{ color: 'var(--text-muted)' }}>Total</span>
              <span className="w-10 text-lg font-black text-right">{totalStats}</span>
              <div className="stat-bar-track flex-1">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${(totalStats / (maxStat * 6)) * 100}%`,
                    background: `linear-gradient(90deg, ${bgColor}, ${bgColor}88)`,
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Abilities */}
        <Card>
          <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--accent-secondary)' }}>⬣</span> Abilities
          </h2>
          <div className="space-y-2.5">
            {pokemon.abilities?.map((ability: string) => (
              <div
                key={ability}
                className="p-3.5 rounded-xl transition-all duration-200 hover:translate-x-1"
                style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}
              >
                <p className="font-extrabold capitalize text-sm">{ability.replace('-', ' ')}</p>
              </div>
            ))}
            {pokemon.hiddenAbility && (
              <div
                className="p-3.5 rounded-xl transition-all duration-200 hover:translate-x-1"
                style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '2px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <p className="font-extrabold capitalize text-sm">{pokemon.hiddenAbility.replace('-', ' ')}</p>
                <p className="text-[10px] font-extrabold uppercase tracking-widest mt-1" style={{ color: '#F59E0B' }}>
                  Hidden Ability
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pokédex Entries */}
      {pokedexEntries.length > 0 && (
        <Card>
          <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--accent-gold)' }}>⬣</span> Pokédex Entries
          </h2>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
            {pokedexEntries.map((entry, idx) => {
              const gameKey = entry.game.toLowerCase();
              const GAME_COLORS: Record<string, string> = {
                red: '#FF1111', blue: '#1111FF', yellow: '#FFCC00',
                gold: '#DAA520', silver: '#A0A0A0', crystal: '#4FD9E8',
                ruby: '#A00000', sapphire: '#0000A0', emerald: '#00A000',
                'firered': '#FF7327', 'leafgreen': '#00DD00',
                diamond: '#AAAAFF', pearl: '#FFAAAA', platinum: '#999999',
                'heartgold': '#B69E00', 'soulsilver': '#C0C0E1',
                black: '#222222', white: '#D0D0D0',
                'black 2': '#222222', 'white 2': '#D0D0D0',
                x: '#025CE2', y: '#E40058',
                'omega ruby': '#C40B24', 'alpha sapphire': '#08418A',
                sun: '#F18E2C', moon: '#551A8B',
                'ultra sun': '#E65100', 'ultra moon': '#283593',
                'let\'s go pikachu': '#F4D23C', 'let\'s go eevee': '#C69400',
                sword: '#00A1E9', shield: '#E3001B',
                'brilliant diamond': '#79B7E3', 'shining pearl': '#E59EC7',
                'legends arceus': '#23385B',
                scarlet: '#E3332A', violet: '#754C93'
              };
              
              const gameColor = GAME_COLORS[gameKey] || bgColor;
              // If background is very light (like white), text should be dark
              const isLight = ['white', 'white 2', 'silver'].includes(gameKey);

              return (
                <div
                  key={idx}
                  className="flex gap-3 p-3.5 rounded-xl transition-all duration-200 hover:translate-x-1"
                  style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}
                >
                  <span
                    className={`shrink-0 px-3 py-1 h-fit rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-center min-w-[80px] ${isLight ? 'text-black' : 'text-white'}`}
                    style={{ backgroundColor: gameColor, border: `2px solid var(--text-primary)`, boxShadow: `2px 2px 0px var(--text-primary)` }}
                  >
                    {entry.game}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {entry.text}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Moves */}
      {moves.length > 0 && (
        <Card>
          <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--pokedex-red)' }}>⬣</span> Moves ({moves.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-2">
            {moves.map((move: any) => {
              const moveColor = TYPE_COLORS[move.type] || '#999';
              return (
                <div
                  key={move.id}
                  className="p-3 rounded-xl transition-all duration-200 hover:translate-x-1"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--border-color)',
                    borderLeft: `4px solid ${moveColor}`,
                  }}
                >
                  <p className="font-extrabold capitalize text-sm mb-1.5">{move.name}</p>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span
                      className="px-2 py-0.5 rounded-md font-extrabold text-white capitalize"
                      style={{ backgroundColor: moveColor, border: `1px solid ${moveColor}` }}
                    >
                      {move.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-extrabold capitalize"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      {move.category}
                    </span>
                    {move.power && (
                      <span className="px-2 py-0.5 rounded-md font-extrabold" style={{ color: 'var(--pokedex-red)', background: 'rgba(var(--glow-color), 0.06)' }}>
                        PWR {move.power}
                      </span>
                    )}
                    {move.accuracy && (
                      <span className="px-2 py-0.5 rounded-md font-extrabold" style={{ color: 'var(--accent-secondary)', background: 'rgba(37, 99, 235, 0.06)' }}>
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

      {/* Navigation */}
      <div className="flex justify-between">
        {pokemonId > 1 ? (
          <Link href={`/pokemon/${pokemonId - 1}`}
            className="anime-btn px-5 py-2.5 rounded-xl font-extrabold text-sm"
            style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color-bold)' }}>
            ← #{pokemonId - 1}
          </Link>
        ) : <div />}
        <Link href={`/pokemon/${pokemonId + 1}`}
          className="anime-btn px-5 py-2.5 rounded-xl font-extrabold text-sm"
          style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color-bold)' }}>
          #{pokemonId + 1} →
        </Link>
      </div>
    </div>
  );
}
