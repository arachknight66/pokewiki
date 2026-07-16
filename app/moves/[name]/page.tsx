/**
 * Move Detail Server Page (Static ISR + SEO Metadata)
 */

import React from 'react';
import { Metadata } from 'next';
import { getMoveDetail, getPokemonThatLearnMove } from '@/lib/api/pokeApi';
import MoveDetailClient from './MoveDetailClient';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export const revalidate = 86400; // 24 hours ISR

interface PageProps {
  params: { name: string };
}

// Generate static pre-rendered routes for popular moves
export async function generateStaticParams() {
  const popularMoves = [
    'tackle',
    'growl',
    'thunderbolt',
    'surf',
    'flamethrower',
    'psychic',
    'hyper-beam',
    'ice-beam',
    'earthquake'
  ];
  return popularMoves.map((name) => ({ name }));
}

async function fetchMoveData(name: string) {
  try {
    const move = await getMoveDetail(name);
    if (!move) return null;
    const pokemonList = await getPokemonThatLearnMove(name).catch(() => []);
    return { move, pokemonList };
  } catch (err) {
    console.error('Error fetching move server-side:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await fetchMoveData(params.name);
  if (!data) {
    return { title: 'Move Not Found | PokéWiki' };
  }

  const { move } = data;
  const moveName = move.name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const effectText = move.effect_entries?.find((e: any) => e.language.name === 'en')?.short_effect || 
                     move.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.flavor_text || 
                     'No details available.';

  return {
    title: `${moveName} — Move Details — PokéWiki`,
    description: effectText.replace(/\$effect_chance%?/g, `${move.effect_chance}%`),
  };
}

export default async function MovePage({ params }: PageProps) {
  const data = await fetchMoveData(params.name);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <Card className="text-center">
          <p className="text-2xl font-black font-display mb-2">Move not found</p>
          <Link href={"/pokemon" as any}>
            <button className="mt-3 px-4 py-2 border-2 border-[var(--text-primary)] rounded-xl font-bold bg-[var(--bg-secondary)] shadow-[2px_2px_0px_var(--text-primary)]">
              ← Go Back
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  return <MoveDetailClient initialData={data} />;
}
