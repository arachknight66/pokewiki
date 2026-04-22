/**
 * Pokémon Type System - Type matchups and coverage analysis
 */

import { PokemonType, TypeChart, Move } from './types';

/**
 * Type chart - What each type is effective against
 */
export const TYPE_MATCHUPS: Record<PokemonType, TypeChart> = {
  normal: {
    effective: [],
    weak: ['fighting'],
    resistance: [],
    immune: ['ghost'],
  },
  fire: {
    effective: ['bug', 'steel', 'grass', 'ice'],
    weak: ['water', 'ground', 'rock'],
    resistance: ['bug', 'steel', 'grass', 'ice', 'fairy'],
    immune: [],
  },
  water: {
    effective: ['fire', 'ground', 'rock'],
    weak: ['grass', 'electric'],
    resistance: ['steel', 'fire', 'water', 'ice'],
    immune: [],
  },
  grass: {
    effective: ['water', 'ground', 'rock'],
    weak: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistance: ['ground', 'water', 'grass', 'electric'],
    immune: [],
  },
  electric: {
    effective: ['water', 'flying'],
    weak: ['ground'],
    resistance: ['flying', 'steel', 'electric'],
    immune: [],
  },
  ice: {
    effective: ['grass', 'flying', 'ground', 'dragon'],
    weak: ['fire', 'fighting', 'rock', 'steel'],
    resistance: ['ice'],
    immune: [],
  },
  fighting: {
    effective: ['normal', 'ice', 'rock', 'dark', 'steel'],
    weak: ['flying', 'psychic', 'fairy'],
    resistance: ['rock', 'bug', 'dark'],
    immune: [],
  },
  poison: {
    effective: ['grass', 'fairy'],
    weak: ['ground', 'psychic'],
    resistance: ['fighting', 'poison', 'bug', 'grass'],
    immune: [],
  },
  ground: {
    effective: ['fire', 'electric', 'poison', 'rock', 'steel'],
    weak: ['water', 'grass', 'ice'],
    resistance: ['poison', 'rock'],
    immune: ['electric'],
  },
  flying: {
    effective: ['fighting', 'bug', 'grass'],
    weak: ['electric', 'ice', 'rock'],
    resistance: ['fighting', 'bug', 'grass'],
    immune: ['ground'],
  },
  psychic: {
    effective: ['fighting', 'poison'],
    weak: ['bug', 'ghost', 'dark'],
    resistance: ['fighting', 'psychic'],
    immune: [],
  },
  bug: {
    effective: ['grass', 'psychic', 'dark'],
    weak: ['fire', 'flying', 'rock'],
    resistance: ['fighting', 'ground', 'grass'],
    immune: [],
  },
  rock: {
    effective: ['flying', 'bug', 'fire', 'ice'],
    weak: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistance: ['normal', 'flying', 'poison', 'fire'],
    immune: [],
  },
  ghost: {
    effective: ['ghost', 'psychic'],
    weak: ['ghost', 'dark'],
    resistance: ['poison', 'bug'],
    immune: ['normal', 'fighting'],
  },
  dragon: {
    effective: ['dragon'],
    weak: ['ice', 'dragon', 'fairy'],
    resistance: ['fire', 'water', 'grass', 'electric'],
    immune: [],
  },
  dark: {
    effective: ['ghost', 'psychic'],
    weak: ['fighting', 'bug', 'fairy'],
    resistance: ['ghost', 'dark'],
    immune: ['psychic'],
  },
  steel: {
    effective: ['ice', 'rock', 'fairy'],
    weak: ['fire', 'water', 'ground'],
    resistance: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
    immune: ['poison'],
  },
  fairy: {
    effective: ['fighting', 'dragon', 'dark'],
    weak: ['poison', 'steel'],
    resistance: ['fighting', 'bug', 'dark'],
    immune: [],
  },
};

/**
 * Get all type combinations that can hit a given type
 */
export function getTypesCoveringType(type: PokemonType): PokemonType[] {
  const covering: PokemonType[] = [];

  for (const [attackType, chart] of Object.entries(TYPE_MATCHUPS)) {
    if (chart.effective.includes(type)) {
      covering.push(attackType as PokemonType);
    }
  }

  return covering;
}

/**
 * Analyze offensive type coverage of a team
 * Returns types the team can hit for super-effective damage
 */
export function analyzeOffensiveCoverage(moves: Move[]): PokemonType[] {
  const coverage = new Set<PokemonType>();

  for (const move of moves) {
    const matchup = TYPE_MATCHUPS[move.type];
    if (matchup?.effective) {
      matchup.effective.forEach(t => coverage.add(t));
    }
  }

  return Array.from(coverage) as PokemonType[];
}

/**
 * Get gaps in offensive coverage
 */
export function getCoverageGaps(covered: PokemonType[]): PokemonType[] {
  const allTypes = Object.keys(TYPE_MATCHUPS) as PokemonType[];
  return allTypes.filter(type => !covered.includes(type));
}

/**
 * Analyze team's defensive profile
 */
export function analyzeDefensiveProfile(types: (PokemonType | undefined)[]): {
  weaknesses: PokemonType[];
  resistances: PokemonType[];
} {
  const weaknesses = new Map<PokemonType, number>();
  const resistances = new Set<PokemonType>();

  for (const type of types) {
    if (!type) continue;

    const chart = TYPE_MATCHUPS[type];

    // Add weaknesses
    for (const weak of chart.weak) {
      weaknesses.set(weak, (weaknesses.get(weak) || 0) + 1);
    }

    // Add resistances
    for (const resist of chart.resistance) {
      resistances.add(resist);
    }
  }

  // Weight weaknesses by frequency
  const sortedWeaknesses = Array.from(weaknesses.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);

  return {
    weaknesses: sortedWeaknesses,
    resistances: Array.from(resistances),
  };
}

/**
 * Calculate weakness penalty for team rating
 * Multiple weaknesses to the same type = higher penalty
 */
export function calculateWeaknessPenalty(weaknesses: PokemonType[]): number {
  const weaknessCount = new Map<PokemonType, number>();

  for (const weakness of weaknesses) {
    weaknessCount.set(weakness, (weaknessCount.get(weakness) || 0) + 1);
  }

  let penalty = 0;

  // Triple weakness (3+ same type): -20 pts
  // Double weakness: -10 pts each
  // Single weakness: -2 pts each
  for (const [, count] of weaknessCount) {
    if (count >= 3) {
      penalty -= 20;
    } else if (count === 2) {
      penalty -= 10;
    } else {
      penalty -= 2;
    }
  }

  return Math.max(penalty, -50); // Cap at -50
}

/**
 * Check if two types have beneficial synergy
 * (e.g., one resists what the other is weak to)
 */
export function checkTypeSynergy(type1: PokemonType, type2: PokemonType): {
  isSynergistic: boolean;
  score: number; // -10 to +10
} {
  const chart1 = TYPE_MATCHUPS[type1];
  const chart2 = TYPE_MATCHUPS[type2];

  let score = 0;

  // Check if type1 resists type2's weaknesses
  for (const weakness of chart2.weak) {
    if (chart1.resistance?.includes(weakness) || chart1.immune?.includes(weakness)) {
      score += 5;
    }
  }

  // Check if type2 covers type1's weaknesses
  for (const weakness of chart1.weak) {
    if (chart2.effective?.includes(weakness)) {
      score += 3;
    }
  }

  // Check for overlapping weaknesses (bad)
  for (const weakness of chart1.weak) {
    if (chart2.weak?.includes(weakness)) {
      score -= 2;
    }
  }

  return {
    isSynergistic: score > 0,
    score,
  };
}

/**
 * Type effectiveness ratio - useful for move selection
 */
export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

/**
 * Get contrast-friendly text color for type badge
 */
export function getTypeTextColor(type: PokemonType): string {
  const darkTypes = ['normal', 'fire', 'grass', 'bug', 'rock', 'ghost', 'dark'];
  return darkTypes.includes(type) ? '#ffffff' : '#000000';
}
