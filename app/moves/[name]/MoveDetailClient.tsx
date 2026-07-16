'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoveEffectivenessPreview } from '@/components/pokemon/MoveEffectivenessPreview';
import { TYPE_COLORS, hexToRgb } from '@/lib/type-system';
import { PokemonType } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { getPokemonSprites } from '@/lib/sprites';
import { useShinyMode } from '@/app/ShinyModeContext';
import { ArrowLeft } from 'lucide-react';

interface MoveDetailClientProps {
  initialData: {
    move: any;
    pokemonList: any[];
  };
}

export default function MoveDetailClient({ initialData }: MoveDetailClientProps) {
  const { move, pokemonList } = initialData;
  const router = useRouter();
  const { isShinyMode } = useShinyMode();

  const bgColor = TYPE_COLORS[move.type.name as PokemonType] || '#A8A878';
  const rgb = hexToRgb(bgColor);
  const effectText = move.effect_entries?.find((e: any) => e.language.name === 'en')?.effect || 
                     move.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.flavor_text || 
                     'No details available.';

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
        <div className="h-2 w-full" style={{ backgroundColor: bgColor }} />

        <div className="p-6 lg:p-10 space-y-6 relative z-10">
          <div>
            <span 
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg text-white border border-[var(--text-primary)] shadow-sm"
              style={{ backgroundColor: bgColor }}
            >
              {move.type.name}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black font-display capitalize mt-3">
              {move.name.replace(/-/g, ' ')}
            </h1>
          </div>

          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            {effectText.replace(/\$effect_chance%?/g, `${move.effect_chance}%`)}
          </p>

          {/* Stats HUD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { label: 'Category', val: move.damage_class?.name || 'status', icon: '⚡' },
              { label: 'Power', val: move.power || '—', icon: '💥' },
              { label: 'Accuracy', val: move.accuracy ? `${move.accuracy}%` : '—', icon: '🎯' },
              { label: 'PP', val: move.pp, icon: '🔋' }
            ].map(item => (
              <div 
                key={item.label}
                className="p-4 rounded-xl border-2 text-center"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color-bold)',
                  boxShadow: '2px 2px 0px var(--text-primary)'
                }}
              >
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {item.icon} {item.label}
                </p>
                <p className="text-xl font-black font-display capitalize mt-1">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Effectiveness Widget */}
      <Card>
        <MoveEffectivenessPreview moveType={move.type.name as PokemonType} />
      </Card>

      {/* Learned by Section */}
      <Card>
        <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
          <span style={{ color: 'var(--accent-secondary)' }}>⬣</span> Learned By
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
          <p className="text-sm font-bold opacity-60">No Pokémon learn this move naturally.</p>
        )}
      </Card>
    </div>
  );
}
