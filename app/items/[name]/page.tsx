/**
 * Item Detail Server Page (Static ISR + SEO Metadata)
 */

import React from 'react';
import { Metadata } from 'next';
import { getItemDetail, getPokemonEvolvingWithItem } from '@/lib/api/pokeApi';
import ItemDetailClient from './ItemDetailClient';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export const revalidate = 86400; // 24 hours ISR

interface PageProps {
  params: { name: string };
}

// Generate static pre-rendered routes for popular items
export async function generateStaticParams() {
  const popularItems = [
    'poke-ball',
    'great-ball',
    'ultra-ball',
    'master-ball',
    'potion',
    'revive',
    'rare-candy',
    'leftovers'
  ];
  return popularItems.map((name) => ({ name }));
}

async function fetchItemData(name: string) {
  try {
    const item = await getItemDetail(name);
    if (!item) return null;
    const evolvingPokemon = await getPokemonEvolvingWithItem(name).catch(() => []);
    return { item, evolvingPokemon };
  } catch (err) {
    console.error('Error fetching item server-side:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await fetchItemData(params.name);
  if (!data) {
    return { title: 'Item Not Found | PokéWiki' };
  }

  const { item } = data;
  const itemName = item.name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const effectText = item.effect_entries?.find((e: any) => e.language.name === 'en')?.effect || 
                     item.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.text || 
                     'No details available.';

  return {
    title: `${itemName} — Item Details — PokéWiki`,
    description: effectText,
  };
}

export default async function ItemPage({ params }: PageProps) {
  const data = await fetchItemData(params.name);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <Card className="text-center">
          <p className="text-2xl font-black font-display mb-2">Item not found</p>
          <Link href={"/pokemon" as any}>
            <button className="mt-3 px-4 py-2 border-2 border-[var(--text-primary)] rounded-xl font-bold bg-[var(--bg-secondary)] shadow-[2px_2px_0px_var(--text-primary)]">
              ← Go Back
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  return <ItemDetailClient initialData={data} />;
}
