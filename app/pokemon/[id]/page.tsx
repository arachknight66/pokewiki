/**
 * Pokémon Detail Server Page (Static ISR + SEO Metadata)
 */

import React from 'react';
import { Metadata } from 'next';
import { getPokemonDetail, getPokemonSpecies, getPokemonMovesData } from '@/lib/api/pokeApi';
import { getPokemonSprites } from '@/lib/sprites';
import { Pokemon } from '@/lib/types';
import PokemonDetailClient from './PokemonDetailClient';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 86400; // 24 hours ISR

interface PageProps {
  params: { id: string };
}

// Generate static pre-rendered routes for the first 151 Pokémon
export async function generateStaticParams() {
  const paths = [];
  for (let i = 1; i <= 151; i++) {
    paths.push({ id: i.toString() });
  }
  return paths;
}

// Fetch helper on server
async function fetchPokemonData(pokemonId: number) {
  if (pokemonId === 0) return null;
  try {
    const [detailParams, speciesParams, movesData] = await Promise.all([
      getPokemonDetail(pokemonId).catch(() => null),
      getPokemonSpecies(pokemonId).catch(() => null),
      getPokemonMovesData(pokemonId).catch(() => null)
    ]);

    if (!detailParams) return null;

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
      name: detailParams.name.replace(/-/g, ' '),
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

    const breeding = speciesParams ? {
      eggGroups: speciesParams.egg_groups?.map((g: any) => g.name) || [],
      genderRate: speciesParams.gender_rate,
      hatchCounter: speciesParams.hatch_counter,
    } : null;

    const allMoves = [...(movesData?.levelUp || []), ...(movesData?.machine || [])];
    const uniqueMoves = new Map<string, any>();
    allMoves.forEach(m => uniqueMoves.set(m.name, m));

    return {
      pokemon,
      breeding,
      moves: Array.from(uniqueMoves.values()),
      evolutionChainUrl: speciesParams?.evolution_chain?.url || null,
    };
  } catch (err) {
    console.error('Error fetching server-side pokemon details:', err);
    return null;
  }
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pokemonId = parseInt(params.id);
  if (isNaN(pokemonId)) {
    return { title: 'Pokémon Details' };
  }

  if (pokemonId === 0) {
    return {
      title: '?M?s?s?n?No. (#000) — PokéWiki',
      description: 'You found something you weren\'t meant to.',
      robots: {
        index: false,
        follow: false,
      }
    };
  }

  const data = await fetchPokemonData(pokemonId);
  if (!data) {
    return { title: 'Pokémon Not Found | PokéWiki' };
  }

  const { pokemon } = data;
  const nameCapitalized = pokemon.name.replace(/\b\w/g, (c: string) => c.toUpperCase());
  const desc = pokemon.description || 'No description available.';
  const descText = desc.length > 155 
    ? `${desc.slice(0, 152)}...` 
    : desc;

  const artwork = pokemon.sprites?.officialArtwork || '';

  return {
    title: `${nameCapitalized} (#${String(pokemon.pokedexNumber).padStart(3, '0')}) — PokéWiki`,
    description: descText,
    openGraph: {
      title: `${nameCapitalized} (#${String(pokemon.pokedexNumber).padStart(3, '0')}) — PokéWiki`,
      description: descText,
      images: artwork ? [
        {
          url: artwork,
          width: 475,
          height: 475,
          alt: pokemon.name,
        }
      ] : [],
      type: 'article',
    },
  };
}

export default async function PokemonPage({ params }: PageProps) {
  const pokemonId = parseInt(params.id);

  if (isNaN(pokemonId)) {
    return (
      <Card className="text-center py-16">
        <p className="text-2xl font-black font-display">Invalid Pokémon ID</p>
        <Link href={"/pokemon" as any} className="inline-block mt-3 text-sm font-bold" style={{ color: 'var(--pokedex-red)' }}>
          ← Back to Pokédex
        </Link>
      </Card>
    );
  }

  // 1. Render MissingNo Easter Egg
  if (pokemonId === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 stagger-children">
        <Link
          href={"/pokemon" as any}
          className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:translate-x-[-4px]"
          style={{ color: 'var(--pokedex-red)' }}
        >
          <ArrowLeft size={16} /> Back to Pokédex
        </Link>

        {/* CSS glitch animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes glitch-text {
            0% { text-shadow: 2px -2px 0px #ff00c1, -2px 2px 0px #00fff0; }
            20% { text-shadow: -2px 2px 0px #ff00c1, 2px -2px 0px #00fff0; }
            40% { text-shadow: 2px 2px 0px #ff00c1, -2px -2px 0px #00fff0; }
            60% { text-shadow: -2px -2px 0px #ff00c1, 2px 2px 0px #00fff0; }
            80% { text-shadow: 2px -2px 0px #ff00c1, -2px 2px 0px #00fff0; }
            100% { text-shadow: -2px 2px 0px #ff00c1, 2px -2px 0px #00fff0; }
          }
          .glitch-active {
            animation: glitch-text 0.5s infinite;
            font-family: monospace;
          }
          .glitch-blocks {
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 8px 8px;
          }
        ` }} />

        <div className="rounded-[2rem] border-4 border-dashed border-[var(--text-primary)] bg-[var(--bg-card)] shadow-[12px_12px_0px_var(--text-primary)] relative p-8 md:p-12 glitch-blocks">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* Left Block - Glitched Image */}
            <div className="flex flex-col items-center">
              <div className="w-56 h-72 border-4 border-[var(--text-primary)] bg-black/40 flex flex-col justify-between p-2 shadow-[4px_4px_0px_var(--text-primary)] font-mono text-[9px] text-green-400 select-none overflow-hidden relative">
                {/* Horizontal scanline lines overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] pointer-events-none" />
                
                <div className="border border-green-500/20 p-1 flex justify-between bg-black/80">
                  <span>ID: ???</span>
                  <span>NO: 000</span>
                </div>
                
                {/* Glitch Block Matrix graphic */}
                <div className="flex-1 my-2 flex items-center justify-center bg-black/20 border border-green-500/10 relative">
                  <div className="w-32 h-44 grid grid-cols-6 grid-rows-8 gap-0.5 opacity-80">
                    {Array.from({ length: 48 }).map((_, idx) => {
                      const fill = (idx * 17) % 3 === 0;
                      return (
                        <div 
                          key={idx} 
                          className="border border-green-400/20"
                          style={{ backgroundColor: fill ? 'currentColor' : 'transparent' }} 
                        />
                      );
                    })}
                  </div>
                  <span className="absolute text-5xl font-black glitch-active text-white">?</span>
                </div>
                
                <div className="border border-green-500/20 p-1 bg-black/80 flex justify-center uppercase tracking-widest text-[8px]">
                  STATUS: CORRUPTED
                </div>
              </div>
            </div>

            {/* Right Block - Description */}
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white bg-red-600 border border-[var(--text-primary)] shadow-sm">
                  UNKNOWN
                </span>
                <h1 className="text-4xl lg:text-5xl font-black glitch-active text-[var(--pokedex-red)] mt-3">
                  MissingNo.
                </h1>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 border-2 border-[var(--text-primary)] bg-zinc-800 text-zinc-400 text-[10px] font-extrabold rounded-lg">
                    ?
                  </span>
                  <span className="px-2 py-0.5 border-2 border-[var(--text-primary)] bg-zinc-800 text-zinc-400 text-[10px] font-extrabold rounded-lg">
                    TYPE/NULL
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
                A glitch Pokémon species found in the Red and Blue games. Its appearance is a result of Pokémon games trying to load data for a non-existent index block from Cinnabar Island&apos;s coastlines.
              </p>

              {/* Stats Section with block characters */}
              <div className="space-y-2 font-mono text-xs">
                <h3 className="font-black uppercase tracking-wider text-[10px] text-[var(--text-muted)]">Base Metrics</h3>
                {[
                  { label: 'HP', val: '▓▓▓▓▓▓▓░░░' },
                  { label: 'ATK', val: '▓▓▓▓▓▓▓▓▓░' },
                  { label: 'DEF', val: '▓▓░░░░░░░░' },
                  { label: 'SPD', val: '▓▓▓▓░░░░░░' }
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <span className="w-8 font-black text-[var(--text-muted)]">{stat.label}</span>
                    <span className="text-amber-500 font-bold">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="border-t-2 border-[var(--text-primary)] mt-8 pt-4 text-center">
            <p className="text-xs italic font-bold" style={{ color: 'var(--text-muted)' }}>
              &quot;You found something you weren&apos;t meant to.&quot;
            </p>
            <p className="text-[9px] font-mono mt-1 opacity-60">
              A tribute to the old-rod and Cinnabar Island coastal shore memory exploit (1998).
            </p>
          </div>

        </div>
      </div>
    );
  }

  // 2. Render normal Pokémon details
  const initialData = await fetchPokemonData(pokemonId);

  if (!initialData) {
    return (
      <Card className="text-center py-16">
        <p className="text-2xl font-black font-display">Pokémon not found</p>
        <Link href={"/pokemon" as any} className="inline-block mt-3 text-sm font-bold" style={{ color: 'var(--pokedex-red)' }}>
          ← Back to Pokédex
        </Link>
      </Card>
    );
  }

  return (
    <PokemonDetailClient pokemonId={pokemonId} initialData={initialData} />
  );
}
