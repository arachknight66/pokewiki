/**
 * EvolutionTree Component - Recursively renders the branching evolution chain
 */
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EvolutionNode } from '@/lib/types/pokemon';
import { getPokemonSprites } from '@/lib/sprites';
import { useEvolutionChain } from '@/hooks';

// Extracted from species url
function getIdFromSpeciesUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

// Convert evolution detail into a friendly description
function getEvolutionDetailsString(details: any[]): string {
  if (!details || details.length === 0) return 'Level Up';
  const detail = details[0];
  const trigger = detail.trigger?.name;
  
  if (trigger === 'level-up') {
    let parts: string[] = [];
    if (detail.min_level) parts.push(`Lv. ${detail.min_level}`);
    if (detail.min_happiness) parts.push('Friendship');
    if (detail.time_of_day) parts.push(detail.time_of_day);
    if (detail.location) parts.push(`at ${detail.location.name.replace('-', ' ')}`);
    if (detail.known_move) parts.push(`knowing ${detail.known_move.name.replace('-', ' ')}`);
    if (detail.held_item) parts.push(`holding ${detail.held_item.name.replace('-', ' ')}`);
    return parts.join(' ') || 'Level Up';
  }
  
  if (trigger === 'use-item') {
    return detail.item ? `Use ${detail.item.name.replace('-', ' ')}` : 'Use Item';
  }
  
  if (trigger === 'trade') {
    let parts = ['Trade'];
    if (detail.held_item) parts.push(`holding ${detail.held_item.name.replace('-', ' ')}`);
    return parts.join(' ');
  }

  if (trigger === 'shed') {
    return 'Level 20, empty slot';
  }
  
  return trigger ? trigger.replace('-', ' ') : 'Special';
}

function EvolutionNodeCard({ name, url }: { name: string; url: string }) {
  const id = getIdFromSpeciesUrl(url);
  const sprites = getPokemonSprites(id);
  
  return (
    <Link href={`/pokemon/${id}`}>
      <div 
        className="flex flex-col items-center p-3 rounded-xl transition-all duration-300 hover:scale-105 border-2 text-center select-none cursor-pointer"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color-bold)',
          boxShadow: '2px 2px 0px var(--text-primary)',
          minWidth: '110px'
        }}
      >
        <div className="w-16 h-16 relative flex items-center justify-center mb-1 bg-white/5 dark:bg-black/20 rounded-full border border-[var(--border-color)]">
          <Image 
            src={sprites.front2d}
            alt={name}
            width={56}
            height={56}
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="font-extrabold capitalize text-xs truncate max-w-[100px]">{name.replace('-', ' ')}</p>
        <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
          #{String(id).padStart(3, '0')}
        </span>
      </div>
    </Link>
  );
}

interface EvolutionTreeNodeProps {
  node: EvolutionNode;
}

function EvolutionTreeNode({ node }: EvolutionTreeNodeProps) {
  const hasEvolutions = node.evolves_to && node.evolves_to.length > 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-center">
      {/* Current species node */}
      <EvolutionNodeCard name={node.species.name} url={node.species.url} />

      {/* Children branches */}
      {hasEvolutions && (
        <div className="flex flex-col gap-4 justify-center w-full md:w-auto">
          {node.evolves_to.map((child, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
              {/* Connector trigger arrow */}
              <div className="flex flex-row md:flex-col items-center justify-center gap-1 min-w-[110px] text-center bg-white/5 dark:bg-black/20 p-2 rounded-lg border border-[var(--border-color)]">
                <span className="text-[8px] font-black uppercase tracking-wider text-muted max-w-[100px] break-words" style={{ color: 'var(--text-muted)' }}>
                  {getEvolutionDetailsString(child.evolution_details || [])}
                </span>
                <span className="text-sm md:text-lg font-black animate-pulse" style={{ color: 'var(--pokedex-red)' }}>
                  ➔
                </span>
              </div>

              {/* Child node */}
              <EvolutionTreeNode node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvolutionTree({ chainUrl }: { chainUrl: string }) {
  const { data, isLoading } = useEvolutionChain(chainUrl);
  const chain = data?.chain;

  if (isLoading) {
    return <div className="text-center py-4 font-bold text-xs" style={{ color: 'var(--text-muted)' }}>Loading evolution chain...</div>;
  }

  if (!chain || !chain.evolves_to || chain.evolves_to.length === 0) {
    return null; // Don't render anything if there's no evolution (e.g. single stage Pokémon)
  }

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="min-w-max flex items-center justify-center p-2">
        <EvolutionTreeNode node={chain} />
      </div>
    </div>
  );
}
