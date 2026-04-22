/**
 * Team Rating Engine - Comprehensive team evaluation system
 */

import { Pokemon, Team, Move, Role, Warning } from './types';
import { 
  analyzeDefensiveProfile, 
  calculateWeaknessPenalty, 
  checkTypeSynergy,
  getCoverageGaps,
} from './type-system';

interface RatingInput {
  team: Team;
  pokemon: Pokemon[];
  moves: Move[];
}

interface RatingOutput {
  typeCoverageScore: number;
  weaknessPenalty: number;
  roleBalanceScore: number;
  synergyScore: number;
  metaRelevanceScore: number;
  finalScore: number;
  roles: Role[];
  warnings: Warning[];
  weaknesses: string[];
  resistances: string[];
}

/**
 * Calculate type coverage score (0-100)
 * Measures how much of the metagame the team can hit
 */
export function calculateTypeCoverageScore(moves: Move[]): number {
  if (moves.length === 0) return 0;

  const coveredTypes = new Set<string>();
  const allTypes = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
  ];

  // Simulate coverage (in real implementation, check actual move effects)
  // This is simplified for STAB coverage
  for (const move of moves) {
    coveredTypes.add(move.type);
  }

  // Add bonus for move diversity
  const uniqueMoveTypes = new Set(moves.map(m => m.type)).size;
  const diversityBonus = Math.min(uniqueMoveTypes * 3, 15);

  // Coverage: (types covered / total types) * 100, with diversity bonus
  const baseScore = (coveredTypes.size / allTypes.length) * 85;
  return Math.min(baseScore + diversityBonus, 100);
}

/**
 * Detect Pokémon role based on stats and typing
 */
export function detectRole(pokemon: Pokemon): Role[] {
  const { hp, attack, defense, spa, spd, spe } = pokemon.stats;
  const statTotal = hp + attack + defense + spa + spd + spe;

  const roles: Role[] = [];

  // Sweeper: High Spe + high offenses
  if (spe >= 90 && (attack >= 90 || spa >= 90)) {
    roles.push('sweeper');
  }

  // Physical Wallbreaker
  if (attack >= 110 && spe < 90) {
    roles.push('wallbreaker');
  }

  // Tank: High defenses + HP
  if ((defense >= 90 || spd >= 90) && hp >= 80) {
    roles.push('tank');
  }

  // Utility/Support: Lower offenses, good defenses
  if ((attack < 80 && spa < 80) && (defense >= 80 || spd >= 80)) {
    roles.push('support');
  }

  // Mixed: Good at multiple things
  if (statTotal >= 530 && roles.length === 0) {
    roles.push('mixed');
  }

  // Default fallback
  if (roles.length === 0) {
    if (spe >= 90) {
      roles.push('sweeper');
    } else {
      roles.push('utility');
    }
  }

  return roles;
}

/**
 * Calculate role balance score (0-100)
 * Penalizes teams with too many of same role
 */
export function calculateRoleBalanceScore(pokemon: Pokemon[]): number {
  if (pokemon.length === 0) return 0;

  const roles: Role[] = [];
  
  for (const p of pokemon) {
    const pRoles = detectRole(p);
    roles.push(pRoles[0] || 'utility');
  }

  const roleCount = new Map<Role, number>();
  for (const role of roles) {
    roleCount.set(role, (roleCount.get(role) || 0) + 1);
  }

  // Ideal distribution: diverse roles
  const uniqueRoles = roleCount.size;
  const maxDuplicates = Math.max(...roleCount.values());

  // Score: more diverse = higher score
  // Penalty for heavy duplication
  const diversityScore = (uniqueRoles / 6) * 60; // Up to 60 pts
  const duplicationPenalty = maxDuplicates > 3 ? 20 : maxDuplicates > 2 ? 10 : 0;

  return Math.min(diversityScore + 40 - duplicationPenalty, 100);
}

/**
 * Calculate team synergy score (0-100)
 * Based on pairwise type synergies and ability combos
 */
export function calculateSynergyScore(pokemon: Pokemon[]): number {
  if (pokemon.length < 2) return 50; // Neutral for single/no pokemon

  let synergyPoints = 0;
  let pairsEvaluated = 0;

  // Check all pairwise combinations
  for (let i = 0; i < pokemon.length - 1; i++) {
    for (let j = i + 1; j < pokemon.length; j++) {
      const p1 = pokemon[i];
      const p2 = pokemon[j];

      // Type synergy check
      const typeSynergyScore = checkTypeSynergy(p1.type1, p2.type1);
      synergyPoints += typeSynergyScore.score + 5; // Base 5 pts per pair

      // Ability synergy (simplified)
      // In real implementation: setup sweeper + screen setter = +5 pts
      if (p1.abilities.includes('Dragon Dance') && p2.abilities.includes('Stealth Rock')) {
        synergyPoints += 5;
      }

      pairsEvaluated++;
    }
  }

  const maxPoints = pairsEvaluated * 15;
  const rawScore = (synergyPoints / maxPoints) * 100;
  return Math.min(Math.max(rawScore, 20), 100); // Between 20-100
}

/**
 * Calculate meta relevance score (0-100)
 * Higher for meta-relevant Pokémon
 */
export function calculateMetaRelevanceScore(pokemon: Pokemon[]): number {
  // In production: would fetch from usage statistics API
  // For now, use generation and viability as proxy

  const metaPokemon = ['Landorus-T', 'Gliscor', 'Incineroar', 'Cloyster'];
  const relevantCount = pokemon.filter(p => metaPokemon.includes(p.name)).length;

  // Use rate as percentage
  const usageScore = (relevantCount / pokemon.length) * 40;

  // Bonus for modern generations
  const modernUniquePokemon = pokemon.filter(p => p.generation >= 5).length;
  const generationBonus = (modernUniquePokemon / pokemon.length) * 30;

  return Math.min(usageScore + generationBonus + 30, 100);
}

/**
 * Main rating function - Calculate complete team rating
 */
export function rateTeam(input: RatingInput): RatingOutput {
  const { pokemon, moves } = input;

  if (pokemon.length === 0) {
    return {
      typeCoverageScore: 0,
      weaknessPenalty: 0,
      roleBalanceScore: 0,
      synergyScore: 0,
      metaRelevanceScore: 0,
      finalScore: 0,
      roles: [],
      warnings: [],
      weaknesses: [],
      resistances: [],
    };
  }

  // Calculate subscores
  const typeCoverageScore = calculateTypeCoverageScore(moves);
  const roleBalanceScore = calculateRoleBalanceScore(pokemon);
  const synergyScore = calculateSynergyScore(pokemon);
  const metaRelevanceScore = calculateMetaRelevanceScore(pokemon);

  // Defensive analysis
  const defensiveProfile = analyzeDefensiveProfile([
    pokemon[0]?.type1,
    pokemon[0]?.type2,
    pokemon[1]?.type1,
    pokemon[1]?.type2,
    pokemon[2]?.type1,
  ]);

  const weaknessPenalty = calculateWeaknessPenalty(defensiveProfile.weaknesses);

  // Detect roles
  const roles: Role[] = [];
  for (const p of pokemon) {
    const pRoles = detectRole(p);
    roles.push(pRoles[0] || 'utility');
  }

  // Generate warnings
  const warnings: Warning[] = [];

  if (defensiveProfile.weaknesses.length > 3) {
    warnings.push({
      type: 'weakness',
      message: `Team weak to ${defensiveProfile.weaknesses.slice(0, 2).join(', ')}`,
      severity: 'high',
    });
  }

  if (roleBalanceScore < 40) {
    warnings.push({
      type: 'missing-role',
      message: 'Imbalanced team composition - consider adding support/wall',
      severity: 'medium',
    });
  }

  const uniqueMoveTypes = new Set(moves.map(m => m.type)).size;
  if (uniqueMoveTypes < 3) {
    warnings.push({
      type: 'missing-role',
      message: 'Limited type coverage - team may struggle with common threats',
      severity: 'high',
    });
  }

  // Calculate final score
  // Weights: Coverage 25%, Role Balance 20%, Synergy 20%, Meta 10%, Rest 25%
  const finalScore = 
    (typeCoverageScore * 0.25) +
    (roleBalanceScore * 0.20) +
    (synergyScore * 0.20) +
    (metaRelevanceScore * 0.10) +
    (Math.max(75 + weaknessPenalty, 0) * 0.25);

  return {
    typeCoverageScore: Math.round(typeCoverageScore),
    weaknessPenalty: Math.round(weaknessPenalty),
    roleBalanceScore: Math.round(roleBalanceScore),
    synergyScore: Math.round(synergyScore),
    metaRelevanceScore: Math.round(metaRelevanceScore),
    finalScore: Math.round(Math.min(Math.max(finalScore, 0), 100)),
    roles: [...new Set(roles)],
    warnings,
    weaknesses: defensiveProfile.weaknesses,
    resistances: defensiveProfile.resistances,
  };
}
