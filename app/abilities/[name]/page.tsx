/**
 * Ability Detail Page
 */
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAbilityDetail, usePokemonByAbility } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PokeballLoader from '@/components/ui/PokeballLoader';
import Link from 'next/link';
import Image from 'next/image';
import { getPokemonSprites } from '@/lib/sprites';

export default function AbilityDetailPage() {
  const params = useParams();
  const name = params.name as string;
  const router = useRouter();

  const { data: ability, isLoading: abilityLoading, error } = useAbilityDetail(name);
  const { data: pokemonList, isLoading: listLoading } = usePokemonByAbility(name);

  if (abilityLoading) {
    return <PokeballLoader message="Searching ability databases..." />;
  }

  if (error || !ability) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <Card className="text-center">
          <p className="text-2xl font-black font-display mb-2">Ability not found</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-3">
            ← Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 stagger-children">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        ← Back
      </Button>

      {/* Hero Card */}
      <div
        className="rounded-[2rem] overflow-hidden relative transition-all duration-300"
        style={{
          background: 'var(--bg-card)',
          border: `4px solid var(--text-primary)`,
          boxShadow: `12px 12px 0px var(--text-primary)`,
        }}
      >
        {/* Decorative background stripe */}
        <div className="h-2 w-full bg-[var(--accent-gold)]" />

        <div className="p-6 lg:p-10 space-y-4 relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg text-white bg-[var(--accent-gold)] border border-[var(--text-primary)] shadow-sm">
              Ability
            </span>
            <h1 className="text-4xl lg:text-5xl font-black font-display capitalize mt-3">
              {ability.name.replace(/-/g, ' ')}
            </h1>
          </div>

          <p className="text-base leading-relaxed max-w-2xl text-secondary" style={{ color: 'var(--text-secondary)' }}>
            {ability.effect || ability.shortEffect || ability.flavorText}
          </p>
        </div>
      </div>

      {/* Pokémon with this Ability */}
      <Card>
        <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
          <span style={{ color: 'var(--accent-gold)' }}>⬣</span> Pokémon with this Ability
        </h2>
        
        {listLoading ? (
          <div className="text-xs font-bold text-muted animate-pulse">Searching Pokédex...</div>
        ) : pokemonList && pokemonList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {pokemonList.map((poke: any) => {
              const sprites = getPokemonSprites(poke.id);
              return (
                <Link key={poke.id} href={`/pokemon/${poke.id}`}>
                  <div 
                    className="flex flex-col items-center p-3 rounded-xl transition-all duration-300 hover:scale-105 border-2 text-center select-none cursor-pointer"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      boxShadow: '1px 1px 0px var(--text-primary)'
                    }}
                  >
                    <Image 
                      src={sprites.front2d}
                      alt={poke.name}
                      width={48}
                      height={48}
                      className="object-contain mb-1"
                      unoptimized
                    />
                    <p className="font-extrabold capitalize text-xs truncate max-w-[90px]">{poke.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm font-bold opacity-60">No Pokémon have this ability.</p>
        )}
      </Card>
    </div>
  );
}
