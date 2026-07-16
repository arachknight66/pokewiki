/**
 * Item Detail Page
 */
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useItemDetail, usePokemonEvolvingWithItem } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PokeballLoader from '@/components/ui/PokeballLoader';
import Link from 'next/link';
import Image from 'next/image';
import { getPokemonSprites } from '@/lib/sprites';

export default function ItemDetailPage() {
  const params = useParams();
  const name = params.name as string;
  const router = useRouter();

  const { data: item, isLoading: itemLoading, error } = useItemDetail(name);
  const { data: evolvingPokemon, isLoading: evoLoading } = usePokemonEvolvingWithItem(name);

  if (itemLoading) {
    return <PokeballLoader message="Inspecting item properties..." />;
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <Card className="text-center">
          <p className="text-2xl font-black font-display mb-2">Item not found</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-3">
            ← Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const effectText = item.effect_entries?.find((e: any) => e.language.name === 'en')?.effect || 
                     item.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.text || 
                     'No details available.';

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger-children">
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
        <div className="h-2 w-full bg-[var(--pokedex-red)]" />

        <div className="p-6 lg:p-10 flex flex-col md:flex-row gap-8 items-center relative z-10">
          {/* Large Sprite */}
          <div className="w-24 h-24 flex items-center justify-center bg-white/5 dark:bg-black/20 rounded-full border border-[var(--border-color)] flex-shrink-0">
            <Image
              src={spriteUrl}
              alt={item.name}
              width={56}
              height={56}
              className="object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent) {
                  const emoji = document.createElement('span');
                  emoji.textContent = '🎒';
                  emoji.style.fontSize = '36px';
                  parent.appendChild(emoji);
                }
              }}
              unoptimized
            />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg text-white bg-[var(--pokedex-red)] border border-[var(--text-primary)] shadow-sm">
                {item.category?.name?.replace(/-/g, ' ') || 'item'}
              </span>
              <h1 className="text-4xl font-black font-display capitalize mt-3">
                {item.name.replace(/-/g, ' ')}
              </h1>
            </div>

            <p className="text-base leading-relaxed text-secondary font-medium" style={{ color: 'var(--text-secondary)' }}>
              {effectText}
            </p>

            {/* Quick Specs */}
            <div className="flex gap-6 pt-1">
              {[
                { label: 'Cost', val: item.cost > 0 ? `₱${item.cost}` : 'Not For Sale' },
                { label: 'Attributes', val: item.attributes?.map((a: any) => a.name.replace(/-/g, ' ')).join(', ') || 'none' }
              ].map(spec => (
                <div key={spec.label}>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {spec.label}
                  </p>
                  <p className="text-sm font-black capitalize">{spec.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evolution triggers using this item */}
      {evolvingPokemon && (
        <Card>
          <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--accent-secondary)' }}>⬣</span> Evolving Pokémon
          </h2>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Pokémon that evolve when exposed to or holding this item
          </p>

          {evoLoading ? (
            <div className="text-xs font-bold text-muted animate-pulse">Analyzing evolution lines...</div>
          ) : evolvingPokemon.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {evolvingPokemon.map((poke: any) => {
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
            <p className="text-sm font-bold opacity-60">No Pokémon use this item for evolution.</p>
          )}
        </Card>
      )}
    </div>
  );
}
