import React from 'react';
import InteractiveTypeChart from '@/components/pokemon/InteractiveTypeChart';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Type Effectiveness Chart | PokéWiki',
  description: 'Interactive Pokémon Type matchups, strengths, weaknesses, and defensive synergies matrix.',
};

export default function TypeChartPage() {
  return (
    <div className="space-y-8 stagger-children">
      {/* Page Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl font-black font-display">
          <span className="anime-heading">Type Matchups Chart</span>
        </h1>
        <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
          Analyze offensive multipliers and defensive effectiveness profiles
        </p>
      </div>

      {/* Grid Component */}
      <InteractiveTypeChart />
    </div>
  );
}
