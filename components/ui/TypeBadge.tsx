/**
 * UI Components - Type Badge for Pokémon types
 */

'use client';

import { PokemonType } from '@/lib/types';
import { TYPE_COLORS, getTypeTextColor } from '@/lib/type-system';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const bgColor = TYPE_COLORS[type];
  const textColor = getTypeTextColor(type);

  return (
    <span
      className={`
        inline-block rounded-full font-semibold capitalize
        transition-transform duration-150 hover:scale-110
        ${sizeClasses[size]}
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
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
    <div className="flex gap-2 flex-wrap">
      {types
        .filter((t): t is PokemonType => t !== undefined)
        .map(type => (
          <TypeBadge key={type} type={type} size={size} />
        ))}
    </div>
  );
}
