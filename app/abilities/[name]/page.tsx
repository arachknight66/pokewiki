/**
 * Ability Detail Server Page (Static ISR + SEO Metadata)
 */

import React from 'react';
import { Metadata } from 'next';
import { getAbilityDetail, getPokemonByAbility } from '@/lib/api/pokeApi';
import AbilityDetailClient from './AbilityDetailClient';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export const revalidate = 86400; // 24 hours ISR

interface PageProps {
  params: { name: string };
}

// Generate static pre-rendered routes for popular abilities
export async function generateStaticParams() {
  const popularAbilities = [
    'levitate',
    'intimidate',
    'overgrow',
    'blaze',
    'torrent',
    'static',
    'pressure',
    'guts',
    'chlorophyll'
  ];
  return popularAbilities.map((name) => ({ name }));
}

async function fetchAbilityData(name: string) {
  try {
    const ability = await getAbilityDetail(name);
    if (!ability) return null;
    const pokemonList = await getPokemonByAbility(name).catch(() => []);
    return { ability, pokemonList };
  } catch (err) {
    console.error('Error fetching ability server-side:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await fetchAbilityData(params.name);
  if (!data) {
    return { title: 'Ability Not Found | PokéWiki' };
  }

  const { ability } = data;
  const abilityName = ability.name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const descText = ability.shortEffect || ability.effect || 'No details available.';

  return {
    title: `${abilityName} — Ability Details — PokéWiki`,
    description: descText,
  };
}

export default async function AbilityPage({ params }: PageProps) {
  const data = await fetchAbilityData(params.name);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <Card className="text-center">
          <p className="text-2xl font-black font-display mb-2">Ability not found</p>
          <Link href={"/pokemon" as any}>
            <button className="mt-3 px-4 py-2 border-2 border-[var(--text-primary)] rounded-xl font-bold bg-[var(--bg-secondary)] shadow-[2px_2px_0px_var(--text-primary)]">
              ← Go Back
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  return <AbilityDetailClient initialData={data} />;
}
