/**
 * MoveEffectivenessPreview Component - Interactive damage multiplier widget
 */
'use client';

import React, { useState } from 'react';
import { PokemonType } from '@/lib/types';
import { TYPE_MATCHUPS, TYPE_COLORS } from '@/lib/type-system';

export function getMoveEffectiveness(moveType: PokemonType, targetType: PokemonType): number {
  const chart = TYPE_MATCHUPS[targetType];
  if (!chart) return 1;
  
  if (chart.immune?.includes(moveType)) return 0;
  if (chart.weak?.includes(moveType)) return 2;
  if (chart.resistance?.includes(moveType)) return 0.5;
  
  return 1;
}

interface MoveEffectivenessPreviewProps {
  moveType: PokemonType;
}

const typesList: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export function MoveEffectivenessPreview({ moveType }: MoveEffectivenessPreviewProps) {
  const [selectedTarget, setSelectedTarget] = useState<PokemonType | null>(null);

  const getMultiplierLabel = (mult: number) => {
    if (mult === 0) return '0x (No Damage)';
    if (mult === 0.5) return '½x (Not Very Effective)';
    if (mult === 2) return '2x (Super Effective)';
    return '1x (Normal)';
  };

  const getMultiplierColorClass = (mult: number) => {
    if (mult === 0) return 'bg-gray-500 text-white border-gray-700';
    if (mult === 0.5) return 'bg-orange-500/20 text-orange-600 border-orange-400 dark:text-orange-400';
    if (mult === 2) return 'bg-green-500/20 text-green-600 border-green-400 dark:text-green-400';
    return 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Type Effectiveness Calculator
        </p>
        {selectedTarget && (
          <div className="text-xs font-black flex items-center gap-1.5 animate-pulse">
            <span className="capitalize">{moveType}</span> ➔ <span className="capitalize">{selectedTarget}</span> : 
            <span 
              className={`px-2 py-0.5 rounded border-2 font-black ${getMultiplierColorClass(getMoveEffectiveness(moveType, selectedTarget))}`}
              style={{ boxShadow: '1px 1px 0px var(--text-primary)' }}
            >
              {getMultiplierLabel(getMoveEffectiveness(moveType, selectedTarget))}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {typesList.map((t) => {
          const mult = getMoveEffectiveness(moveType, t);
          const isSelected = selectedTarget === t;
          const typeColor = TYPE_COLORS[t];
          
          return (
            <button
              key={t}
              onClick={() => setSelectedTarget(isSelected ? null : t)}
              className="p-2 rounded-xl text-xs font-black capitalize border-2 transition-all duration-200 select-none cursor-pointer flex flex-col items-center gap-1"
              style={{
                background: isSelected ? typeColor : 'var(--bg-secondary)',
                color: isSelected ? 'white' : 'var(--text-secondary)',
                borderColor: isSelected ? 'var(--text-primary)' : 'var(--border-color)',
                boxShadow: isSelected ? '2px 2px 0px var(--text-primary)' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'none',
              }}
            >
              <span>{t}</span>
              {isSelected && (
                <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.2 rounded">
                  {mult}x
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
