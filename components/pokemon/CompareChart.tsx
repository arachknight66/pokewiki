'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TYPE_COLORS } from '@/lib/type-system';
import { PokemonType } from '@/lib/types';

interface CompareChartProps {
  chartData: any[];
  pokemonList: any[];
}

export default function CompareChart({ chartData, pokemonList }: CompareChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="var(--border-color)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-primary)', fontWeight: 'bold', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 255]} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
        {pokemonList.map((p) => {
          const color = TYPE_COLORS[p.pokemon.type1 as PokemonType] || '#A8A878';
          return (
            <Radar
              key={p.pokemon.id}
              name={p.pokemon.name}
              dataKey={p.pokemon.name}
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2.5}
            />
          );
        })}
        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
