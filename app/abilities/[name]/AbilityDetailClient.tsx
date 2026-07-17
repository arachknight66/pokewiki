'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { getPokemonSprites } from '@/lib/sprites';
import { useShinyMode } from '@/app/ShinyModeContext';
import { ArrowLeft } from 'lucide-react';

interface AbilityDetailClientProps {
  initialData: {
    ability: any;
    pokemonList: any[];
  };
}

export default function AbilityDetailClient({ initialData }: AbilityDetailClientProps) {
  const { ability, pokemonList } = initialData;
  const router = useRouter();
  const { isShinyMode } = useShinyMode();

  return (
    <div className="max-w-5xl mx-auto space-y-6 stagger-children">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Back
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

        <div className="p-6 lg:p-10 space-y-4 relative z-content">
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
        
        {pokemonList && pokemonList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {pokemonList.map((poke: any) => {
              const sprites = getPokemonSprites(poke.id);
              const spriteSrc = isShinyMode ? sprites.frontShiny2d : sprites.front2d;
              return (
                <Link key={poke.id} href={`/pokemon/${poke.id}` as any}>
                  <div 
                    className="flex flex-col items-center p-3 rounded-xl transition-all duration-300 hover:scale-105 border-2 text-center select-none cursor-pointer"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      boxShadow: '1px 1px 0px var(--text-primary)'
                    }}
                  >
                    <Image 
                      src={spriteSrc}
                      alt={poke.name}
                      width={48}
                      height={48}
                      className="object-contain mb-1"
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
