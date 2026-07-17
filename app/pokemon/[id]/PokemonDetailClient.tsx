'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { TYPE_COLORS, hexToRgb } from '@/lib/type-system';
import { PokemonType } from '@/lib/types';
import { useAudioPlayer, usePokemonLocationEncounters } from '@/hooks';
import { getPokemonCryUrl } from '@/lib/sprites';
import { EvolutionTree } from '@/components/pokemon/EvolutionTree';
import InteractiveHeroCard from '@/components/pokemon/InteractiveHeroCard';
import { ArrowLeft, Volume, Volume2, Sparkles, MapPin } from 'lucide-react';
import { useShinyMode } from '@/app/ShinyModeContext';

type SpriteTab = 'artwork' | 'home3d' | 'animated' | 'classic';

interface PokemonDetailClientProps {
  pokemonId: number;
  initialData: {
    pokemon: any;
    breeding: any;
    moves: any[];
    evolutionChainUrl: string | null;
  };
}

export default function PokemonDetailClient({ pokemonId, initialData }: PokemonDetailClientProps) {
  const { pokemon, breeding, moves, evolutionChainUrl } = initialData;
  
  const { isShinyMode } = useShinyMode();
  const [spriteTab, setSpriteTab] = useState<SpriteTab>('artwork');
  const [showShiny, setShowShiny] = useState(false);
  const [hasManuallyToggled, setHasManuallyToggled] = useState(false);

  const { playingId, playCry } = useAudioPlayer();

  const finalShowShiny = hasManuallyToggled ? showShiny : (showShiny || isShinyMode);

  const bgColor = TYPE_COLORS[pokemon.type1 as PokemonType] || '#A8A878';
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

  const currentSprite = finalShowShiny
    ? spriteMap[spriteTab].shiny
    : spriteMap[spriteTab].normal;

  return (
    <div className="space-y-8 stagger-children">
      {/* Back nav */}
      <Link
        href={"/pokemon" as any}
        className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:translate-x-[-4px]"
        style={{ color: 'var(--pokedex-red)' }}
        aria-label="Back to Pokédex"
      >
        <ArrowLeft size={16} /> Back to Pokédex
      </Link>

      {/* Hero — Pointer-Reactive Card */}
      <InteractiveHeroCard bgColor={bgColor}>
        {/* Animated Background layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white/5 dark:bg-black/20">
          <div
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 border-8"
            style={{ borderColor: bgColor, borderStyle: 'solid' }}
          />
          <div
            className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] border-8 opacity-20 transform rotate-12"
            style={{ borderColor: bgColor, borderStyle: 'solid' }}
          />

          {/* Electric particles */}
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
        <div className="h-1.5 w-full relative z-content" style={{ background: `linear-gradient(90deg, ${bgColor}, ${bgColor}88, transparent)` }} />

        <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-10 relative z-content">
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
                <div data-hero-sprite className="relative z-content select-none pointer-events-none transition-transform duration-300">
                  <Image
                    src={currentSprite}
                    alt={`${pokemon.name} ${spriteTab} ${finalShowShiny ? 'shiny' : ''}`}
                    width={spriteTab === 'animated' ? 160 : 240}
                    height={spriteTab === 'animated' ? 160 : 240}
                    className="object-contain group-hover:-translate-y-2 transition-transform duration-300"
                    style={{
                      imageRendering: spriteTab === 'classic' || spriteTab === 'animated' ? 'pixelated' : 'auto',
                      filter: finalShowShiny ? `drop-shadow(4px 4px 0px rgba(245, 158, 11, 1))` : `drop-shadow(4px 4px 0px rgba(0, 0, 0, 1))`,
                    }}
                    unoptimized={spriteTab === 'animated'}
                    priority
                  />
                </div>
              )}
            </div>

            {/* Sprite tabs */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-3" role="tablist" aria-label="Sprite gallery style tabs">
              {(Object.keys(spriteMap) as SpriteTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSpriteTab(tab)}
                  role="tab"
                  aria-selected={spriteTab === tab}
                  aria-label={`Show ${spriteMap[tab].label} sprite`}
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
              onClick={() => {
                setShowShiny(!showShiny);
                setHasManuallyToggled(true);
              }}
              aria-pressed={finalShowShiny}
              aria-label="Toggle shiny sprite view"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300"
              style={{
                background: finalShowShiny ? 'linear-gradient(135deg, #F59E0B, #EAB308)' : 'var(--bg-secondary)',
                color: finalShowShiny ? '#78350f' : 'var(--text-secondary)',
                border: `2px solid ${finalShowShiny ? '#D97706' : 'var(--border-color)'}`,
                boxShadow: finalShowShiny ? '0 4px 15px rgba(245, 158, 11, 0.35)' : 'none',
              }}
            >
              <Sparkles size={14} className={finalShowShiny ? 'text-amber-950' : 'text-amber-500'} />
              {finalShowShiny ? 'Shiny Active' : 'Toggle Shiny'}
            </button>
          </div>

          {/* Info side */}
          <div className="flex flex-col justify-center space-y-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: bgColor }}>
                #{String(pokemon.pokedexNumber).padStart(3, '0')} · Gen {pokemon.generation}
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl lg:text-5xl font-black font-display capitalize">
                  {pokemon.name}
                </h1>
                <button
                  onClick={() => playCry(pokemon.id, getPokemonCryUrl(pokemon.id))}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95 flex-shrink-0 ${playingId === pokemon.id ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--text-primary)',
                    boxShadow: '1px 1px 0px var(--text-primary)',
                  }}
                  title="Play Cry"
                  aria-label={`Play ${pokemon.name} battle cry`}
                  aria-pressed={playingId === pokemon.id}
                >
                  {playingId === pokemon.id ? (
                    <Volume2 size={16} className="text-[var(--pokedex-red)] animate-pulse" />
                  ) : (
                    <Volume size={16} className="text-[var(--text-muted)]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} size="lg" />
              <Link
                href={"/type-chart" as any}
                className="text-xs font-extrabold uppercase tracking-wider underline hover:text-[var(--pokedex-red)] transition-colors"
              >
                🔍 View full type chart
              </Link>
            </div>

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

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={"/team-builder" as any}>
                <Button size="lg">⚔️ Use in Team Builder</Button>
              </Link>
              <Link href={`/compare?add=${pokemon.id}` as any}>
                <Button size="lg" variant="outline">📊 Compare Stats</Button>
              </Link>
            </div>
          </div>
        </div>
      </InteractiveHeroCard>


      {/* Stats + Abilities */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Base Stats */}
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
              <Link
                key={ability}
                href={`/abilities/${ability}` as any}
                className="block p-3.5 rounded-xl transition-all duration-200 hover:translate-x-1 border-2 cursor-pointer hover:border-[var(--pokedex-red)]"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <p className="font-extrabold capitalize text-sm">{ability.replace(/-/g, ' ')}</p>
              </Link>
            ))}
            {pokemon.hiddenAbility && (
              <Link
                href={`/abilities/${pokemon.hiddenAbility}` as any}
                className="block p-3.5 rounded-xl transition-all duration-200 hover:translate-x-1 border-2 cursor-pointer hover:border-[var(--accent-gold)]"
                style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  borderColor: 'rgba(245, 158, 11, 0.2)',
                }}
              >
                <p className="font-extrabold capitalize text-sm">{pokemon.hiddenAbility.replace(/-/g, ' ')}</p>
                <p className="text-[10px] font-extrabold uppercase tracking-widest mt-1" style={{ color: '#F59E0B' }}>
                  Hidden Ability
                </p>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* Breeding data */}
      {breeding && (
        <Card>
          <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--accent-gold)' }}>⬣</span> Breeding & Growth
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Gender Ratio
              </p>
              {renderGenderBar(breeding.genderRate)}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Egg Groups
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {breeding.eggGroups.length > 0 ? (
                    breeding.eggGroups.map((g: string) => (
                      <EggGroupBadge key={g} group={g} />
                    ))
                  ) : (
                    <span className="text-xs font-bold">Unknown</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Hatch Steps
                </p>
                <p className="text-base font-black font-display">
                  {breeding.hatchCounter * 257} steps
                </p>
                <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  ({breeding.hatchCounter} cycles)
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Location encounters */}
      <LocationEncountersSection pokemonId={pokemonId} />

      {/* Moves */}
      {moves.length > 0 && (
        <Card>
          <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--pokedex-red)' }}>⬣</span> Moves ({moves.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-2">
            {moves.map((move: any) => {
              const moveColor = TYPE_COLORS[move.type as PokemonType] || '#999';
              return (
                <Link
                  key={move.name}
                  href={`/moves/${move.name.toLowerCase().replace(/ /g, '-')}` as any}
                  className="block p-3 rounded-xl transition-all duration-200 hover:translate-x-1 border-2 cursor-pointer hover:border-[var(--pokedex-red)]"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
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
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {evolutionChainUrl && (
        <Card>
          <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--pokedex-red)' }}>⬣</span> Evolution Line
          </h2>
          <EvolutionTree chainUrl={evolutionChainUrl} />
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {pokemonId > 1 ? (
          <Link href={`/pokemon/${pokemonId - 1}` as any}
            className="anime-btn px-5 py-2.5 rounded-xl font-extrabold text-sm"
            style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color-bold)' }}>
            ← #{pokemonId - 1}
          </Link>
        ) : <div />}
        <Link href={`/pokemon/${pokemonId + 1}` as any}
          className="anime-btn px-5 py-2.5 rounded-xl font-extrabold text-sm"
          style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color-bold)' }}>
          #{pokemonId + 1} →
        </Link>
      </div>
    </div>
  );
}

function EggGroupBadge({ group }: { group: string }) {
  return (
    <span
      className="inline-block rounded-lg font-black capitalize tracking-widest transition-all duration-200 hover:scale-105 border-2 shadow-sm px-3.5 py-1 text-[10px]"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        borderColor: 'var(--border-color-bold)',
        boxShadow: `0 2px 8px rgba(0,0,0,0.05)`,
      }}
      title={`Egg Group: ${group}`}
    >
      {group.replace('-', ' ')}
    </span>
  );
}

function renderGenderBar(rate: number) {
  if (rate === -1) {
    return (
      <div 
        className="w-full h-8 rounded-lg flex items-center justify-center text-xs font-black select-none border-2"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--text-primary)',
          color: 'var(--text-secondary)'
        }}
      >
        Genderless
      </div>
    );
  }
  const femalePct = (rate / 8) * 100;
  const malePct = 100 - femalePct;
  return (
    <div 
      className="w-full h-8 rounded-lg flex overflow-hidden border-2 font-black text-xs text-white"
      style={{ borderColor: 'var(--text-primary)' }}
    >
      {malePct > 0 && (
        <div 
          className="flex items-center justify-center bg-blue-500 shadow-inner" 
          style={{ width: `${malePct}%` }}
        >
          ♂ {malePct.toFixed(1)}%
        </div>
      )}
      {femalePct > 0 && (
        <div 
          className="flex items-center justify-center bg-pink-500 shadow-inner" 
          style={{ width: `${femalePct}%` }}
        >
          ♀ {femalePct.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function LocationEncountersSection({ pokemonId }: { pokemonId: number }) {
  const { data: encounters, isLoading } = usePokemonLocationEncounters(pokemonId);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const versions = React.useMemo(() => {
    if (!encounters) return [];
    const set = new Set<string>();
    encounters.forEach((enc: any) => {
      enc.version_details?.forEach((vd: any) => {
        set.add(vd.version.name);
      });
    });
    return Array.from(set).sort();
  }, [encounters]);

  React.useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions, selectedVersion]);

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
          <span style={{ color: 'var(--accent-secondary)' }} aria-hidden="true"><MapPin size={16} /></span> Where to Find
        </h2>
        <div className="text-sm font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Searching wild areas...
        </div>
      </Card>
    );
  }

  if (!encounters || encounters.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
          <span style={{ color: 'var(--accent-secondary)' }} aria-hidden="true"><MapPin size={16} /></span> Where to Find
        </h2>
        <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>
          This Pokémon cannot be found in the wild. It may be obtainable via evolution, breeding, trade, or special events.
        </p>
      </Card>
    );
  }

  const rows: any[] = [];
  encounters.forEach((enc: any) => {
    const vd = enc.version_details?.find((v: any) => v.version.name === selectedVersion);
    if (vd) {
      vd.encounter_details.forEach((ed: any) => {
        rows.push({
          area: enc.location_area.name,
          method: ed.method.name,
          minLevel: ed.min_level,
          maxLevel: ed.max_level,
          chance: ed.chance,
        });
      });
    }
  });

  const getMethodIcon = (method: string) => {
    if (method.includes('walk')) return '🚶';
    if (method.includes('surf')) return '🏄';
    if (method.includes('fish') || method.includes('rod')) return '🎣';
    if (method.includes('cave')) return '🕳️';
    if (method.includes('gift') || method.includes('receive')) return '🎁';
    return '🗺️';
  };

  return (
    <Card>
      <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
        <span style={{ color: 'var(--accent-secondary)' }} aria-hidden="true"><MapPin size={16} /></span> Where to Find
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Game Version:</span>
          <div className="auth-input-wrapper !w-48 relative">
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="auth-input shadow-inner !pl-4 !py-1 text-xs appearance-none cursor-pointer"
            >
              {versions.map(v => (
                <option key={v} value={v} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {v.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[10px]">▼</span>
            <div className="auth-input-glow" />
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--bg-secondary)] font-extrabold border-b border-[var(--border-color-bold)]">
                  <th className="p-3">Location Area</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-center">Level Range</th>
                  <th className="p-3 text-right">Encounter Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-extrabold capitalize">{row.area.replace(/-/g, ' ')}</td>
                    <td className="p-3 capitalize flex items-center gap-1.5">
                      <span>{getMethodIcon(row.method)}</span>
                      <span>{row.method.replace(/-/g, ' ')}</span>
                    </td>
                    <td className="p-3 text-center font-bold">Lv. {row.minLevel} - {row.maxLevel}</td>
                    <td className="p-3 text-right font-black" style={{ color: 'var(--pokedex-red)' }}>{row.chance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>Not available in this version.</p>
        )}
      </div>
    </Card>
  );
}
