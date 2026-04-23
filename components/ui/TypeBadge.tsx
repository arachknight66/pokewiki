/**
 * UI Components - Type Badge — Pokémon Anime-inspired
 */

'use client';

import { PokemonType } from '@/lib/types';
import { TYPE_COLORS, getTypeTextColor } from '@/lib/type-system';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2.5 py-0.5 text-[9px]',
  md: 'px-3.5 py-1 text-[10px]',
  lg: 'px-5 py-1.5 text-xs',
};

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const bgColor = TYPE_COLORS[type];
  const textColor = getTypeTextColor(type);

  return (
    <span
      className={`
        inline-block rounded-lg font-black capitalize tracking-widest
        transition-all duration-200 hover:scale-110 cursor-default
        border-2 shadow-sm
        ${sizeClasses[size]}
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: 'rgba(0,0,0,0.15)',
        boxShadow: `0 2px 8px ${bgColor}44, inset 0 1px 0 rgba(255,255,255,0.2)`,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}
      title={type}
    >
      {type}
    </span>
  );
}

/**
 * Type Badge Group - Display multiple types
 */
interface TypeBadgeGroupProps {
  types: (PokemonType | undefined)[];
  size?: 'sm' | 'md' | 'lg';
}

export function TypeBadgeGroup({ types, size = 'md' }: TypeBadgeGroupProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {types
        .filter((t): t is PokemonType => t !== undefined)
        .map(type => (
          <TypeBadge key={type} type={type} size={size} />
        ))}
    </div>
  );
}
