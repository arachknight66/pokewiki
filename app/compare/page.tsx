/**
 * Stat Comparison Tool
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDebounce } from '@/hooks';
import PokeballLoader from '@/components/ui/PokeballLoader';
import { TYPE_COLORS } from '@/lib/type-system';
import { PokemonType } from '@/lib/types';
import { TYPE_MATCHUPS, analyzeDefensiveProfile } from '@/lib/type-system';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useShinyMode } from '@/app/ShinyModeContext';

const CompareChart = dynamic(() => import('@/components/pokemon/CompareChart'), {
  ssr: false,
});

const statsKeys = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'spa', label: 'Sp. Atk' },
  { key: 'spd', label: 'Sp. Def' },
  { key: 'spe', label: 'Speed' },
];

export default function ComparePage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center py-20"><PokeballLoader /></div>}>
      <ComparePageContent />
    </React.Suspense>
  );
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isShinyMode } = useShinyMode();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [mounted, setMounted] = useState(false);

  // Recharts mounted hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-load ID from URL query if present (e.g. ?add=6)
  useEffect(() => {
    const addId = searchParams.get('add');
    if (addId) {
      const id = parseInt(addId, 10);
      if (!isNaN(id) && !selectedIds.includes(id)) {
        setSelectedIds(prev => {
          if (prev.length >= 4) return prev;
          return [...prev, id];
        });
        // Clear param from URL after parsing
        const params = new URLSearchParams(searchParams.toString());
        params.delete('add');
        router.replace(`/compare?${params.toString()}`);
      }
    }
  }, [searchParams, router, selectedIds]);

  // Fetch search suggestions based on search query
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['compare-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await axios.get(`/api/pokemon?search=${debouncedQuery}&pageSize=5`);
      return response.data?.data || [];
    },
    enabled: debouncedQuery.length > 1,
  });

  // Parallel fetches for all selected Pokémon details
  const results = useQueries({
    queries: selectedIds.map(id => ({
      queryKey: ['pokemon', id],
      queryFn: async () => {
        const response = await axios.get(`/api/pokemon/${id}`);
        return response.data?.data;
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    })),
  });

  // Filter loaded pokemon detail payloads
  const pokemonList = useMemo(() => {
    return results.map(r => r.data).filter(Boolean);
  }, [results]);

  const isLoading = results.some(r => r.isLoading);

  const addPokemon = (id: number) => {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 4) {
      alert('You can compare a maximum of 4 Pokémon.');
      return;
    }
    setSelectedIds(prev => [...prev, id]);
    setSearchQuery('');
  };

  const removePokemon = (id: number) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const chartData = useMemo(() => {
    return statsKeys.map(sk => {
      const row: any = { subject: sk.label };
      pokemonList.forEach(item => {
        row[item.pokemon.name] = item.pokemon.stats[sk.key];
      });
      return row;
    });
  }, [pokemonList]);

  // Delta calculation for exactly 2 species
  const getDeltaString = (statKey: string, valA: number, valB: number) => {
    const diff = valB - valA;
    if (diff > 0) return <span className="text-green-500 font-extrabold ml-1.5">(+{diff})</span>;
    if (diff < 0) return <span className="text-red-500 font-extrabold ml-1.5">({diff})</span>;
    return <span className="text-gray-400 font-bold ml-1.5">(0)</span>;
  };

  // Synergy helper for exactly 2 species
  const synergyInfo = useMemo(() => {
    if (pokemonList.length !== 2) return null;
    const pokeA = pokemonList[0].pokemon;
    const pokeB = pokemonList[1].pokemon;

    const defA = analyzeDefensiveProfile([pokeA.type1, pokeA.type2]);
    const defB = analyzeDefensiveProfile([pokeB.type1, pokeB.type2]);

    const sharedWeaknesses = defA.weaknesses.filter(w => defB.weaknesses.includes(w));

    const checkResist = (targetType: PokemonType, moveType: PokemonType) => {
      const chart = TYPE_MATCHUPS[targetType];
      return chart?.resistance?.includes(moveType) || chart?.immune?.includes(moveType);
    };

    const resists = (types: (PokemonType | undefined)[], moveType: PokemonType) => {
      return types.some(t => t && checkResist(t, moveType));
    };

    const weaknessesACoveredByB = defA.weaknesses.filter(w => resists([pokeB.type1, pokeB.type2], w));
    const weaknessesBCoveredByA = defB.weaknesses.filter(w => resists([pokeA.type1, pokeA.type2], w));

    return {
      sharedWeaknesses,
      weaknessesACoveredByB,
      weaknessesBCoveredByA,
    };
  }, [pokemonList]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 stagger-children">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-black font-display flex items-center gap-2">
          <span style={{ color: 'var(--pokedex-red)' }}>⬣</span> Stat Comparison
        </h1>
        <p className="text-xs font-extrabold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
          Compare stats, radar charts, and type synergy for up to 4 Pokémon
        </p>
      </div>

      {/* Input recruitment box */}
      <div className="relative w-full max-w-md">
        <div className="auth-input-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search to add Pokémon... (e.g. Charizard)"
            className="auth-input shadow-inner !pl-10 text-sm"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
          <div className="auth-input-glow" />
        </div>

        {/* Suggestion Dropdown */}
        {searchResults && searchResults.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border-2 overflow-hidden shadow-lg p-1.5"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--text-primary)' }}
          >
            {searchResults.map((poke: any) => (
              <button
                key={poke.id}
                onClick={() => addPokemon(poke.id)}
                className="w-full flex items-center justify-between p-2 hover:bg-[var(--bg-secondary)] rounded-xl font-bold transition-all text-xs border border-transparent hover:border-[var(--border-color)]"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={isShinyMode ? (poke.sprites?.frontShiny2d || poke.sprites?.front2d) : poke.sprites?.front2d}
                    alt={poke.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <span>{poke.name}</span>
                </div>
                <span className="text-[10px] text-muted">+#{poke.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Slots Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedIds.map(id => {
          const detail = pokemonList.find(x => x?.pokemon?.id === id);
          const p = detail?.pokemon;

          return (
            <Card key={id} className="relative flex flex-col items-center justify-center p-5 select-none h-44">
              <button
                onClick={() => removePokemon(id)}
                className="absolute top-3 right-3 text-sm font-black hover:text-[var(--pokedex-red)] cursor-pointer"
                title="Remove"
              >
                ✕
              </button>
              {isLoading && !p ? (
                <div className="animate-spin text-lg">⏳</div>
              ) : p ? (
                <>
                  <div className="w-16 h-16 relative flex items-center justify-center mb-2 bg-white/5 dark:bg-black/20 rounded-full border">
                    <Image
                      src={isShinyMode ? (p.sprites.frontShiny2d || p.sprites.front2d) : p.sprites.front2d}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-extrabold capitalize text-sm truncate max-w-[120px]">{p.name}</h3>
                  <span className="text-[10px] font-black uppercase text-muted" style={{ color: TYPE_COLORS[p.type1 as PokemonType] }}>
                    {p.type1} {p.type2 ? `· ${p.type2}` : ''}
                  </span>
                </>
              ) : (
                <span className="text-xs font-extrabold opacity-60">Loaded</span>
              )}
            </Card>
          );
        })}
        
        {/* Empty slots placeholders */}
        {Array.from({ length: Math.max(0, 4 - selectedIds.length) }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed opacity-40 h-44"
            style={{ borderColor: 'var(--border-color-bold)' }}
          >
            <span className="text-2xl font-bold">+</span>
            <span className="text-[10px] font-extrabold uppercase mt-1">Empty Slot</span>
          </div>
        ))}
      </div>

      {pokemonList.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar Chart Overlay */}
          <Card className="flex flex-col items-center justify-center">
            <h2 className="text-lg font-black font-display mb-4 self-start">📊 Radar Stats Layout</h2>
            {mounted ? (
              <CompareChart chartData={chartData} pokemonList={pokemonList} />
            ) : (
              <div className="h-64 flex items-center justify-center">Loading chart components...</div>
            )}
          </Card>

          {/* Detailed stats table with delta markers */}
          <Card>
            <h2 className="text-lg font-black font-display mb-4">⬣ Stats Comparison</h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] font-extrabold border-b border-[var(--border-color-bold)]">
                    <th className="p-3">Stat</th>
                    {pokemonList.map(p => (
                      <th key={p.pokemon.id} className="p-3 capitalize">{p.pokemon.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {statsKeys.map(sk => (
                    <tr key={sk.key} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-extrabold">{sk.label}</td>
                      {pokemonList.map((p, idx) => {
                        const val = p.pokemon.stats[sk.key];
                        return (
                          <td key={p.pokemon.id} className="p-3 font-black">
                            <span>{val}</span>
                            {pokemonList.length === 2 && idx === 1 && 
                              getDeltaString(sk.key, pokemonList[0].pokemon.stats[sk.key], val)
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Total stats row */}
                  <tr className="font-extrabold bg-[var(--bg-secondary)] border-t border-[var(--border-color-bold)]">
                    <td className="p-3">Total</td>
                    {pokemonList.map((p, idx) => {
                      const total = Object.values(p.pokemon.stats).reduce((acc: number, curr: any) => acc + curr, 0) as number;
                      const baseTotal = pokemonList[0] ? Object.values(pokemonList[0].pokemon.stats).reduce((acc: number, curr: any) => acc + curr, 0) as number : 0;
                      return (
                        <td key={p.pokemon.id} className="p-3 font-black text-sm" style={{ color: 'var(--pokedex-red)' }}>
                          <span>{total}</span>
                          {pokemonList.length === 2 && idx === 1 && 
                            getDeltaString('total', baseTotal, total)
                          }
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Type Synergy Panel (Exactly 2 species) */}
          {synergyInfo && (
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-black font-display mb-3">⚡ Type Synergy HUD</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div 
                  className="p-4 rounded-xl border-2 space-y-2"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color-bold)',
                    boxShadow: '2px 2px 0px var(--text-primary)'
                  }}
                >
                  <p className="text-[10px] font-black uppercase text-red-500">Shared Weaknesses ⚠️</p>
                  <div className="flex flex-wrap gap-1.5">
                    {synergyInfo.sharedWeaknesses.length > 0 ? (
                      synergyInfo.sharedWeaknesses.map(w => (
                        <span key={w} className="text-[9px] font-black uppercase bg-red-500/10 text-red-600 px-2 py-0.5 rounded border border-red-300 dark:text-red-400 capitalize">
                          {w}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-gray-500">No overlapping weaknesses!</span>
                    )}
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl border-2 space-y-2"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color-bold)',
                    boxShadow: '2px 2px 0px var(--text-primary)'
                  }}
                >
                  <p className="text-[10px] font-black uppercase text-green-500">A Covered By B ✅</p>
                  <div className="flex flex-wrap gap-1.5">
                    {synergyInfo.weaknessesACoveredByB.length > 0 ? (
                      synergyInfo.weaknessesACoveredByB.map(w => (
                        <span key={w} className="text-[9px] font-black uppercase bg-green-500/10 text-green-600 px-2 py-0.5 rounded border border-green-300 dark:text-green-400 capitalize">
                          {w}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-gray-500">No covered weaknesses.</span>
                    )}
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl border-2 space-y-2"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color-bold)',
                    boxShadow: '2px 2px 0px var(--text-primary)'
                  }}
                >
                  <p className="text-[10px] font-black uppercase text-green-500">B Covered By A ✅</p>
                  <div className="flex flex-wrap gap-1.5">
                    {synergyInfo.weaknessesBCoveredByA.length > 0 ? (
                      synergyInfo.weaknessesBCoveredByA.map(w => (
                        <span key={w} className="text-[9px] font-black uppercase bg-green-500/10 text-green-600 px-2 py-0.5 rounded border border-green-300 dark:text-green-400 capitalize">
                          {w}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-gray-500">No covered weaknesses.</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="text-center py-20">
          <p className="text-base font-extrabold" style={{ color: 'var(--text-secondary)' }}>
            No Pokémon selected. Use the search box above to add Pokémon to the comparison deck.
          </p>
        </Card>
      )}
    </div>
  );
}
