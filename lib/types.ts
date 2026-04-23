/**
 * Types - All TypeScript interfaces and types
 */

// ============================================================================
// POKÉMON TYPES
// ============================================================================

export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'dark' | 'steel' | 'fairy';

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonSprites {
  officialArtwork: string;
  officialArtworkShiny: string;
  home3d: string;
  home3dShiny: string;
  showdownAnimated: string;
  showdownAnimatedShiny: string;
  front2d: string;
  frontShiny2d: string;
}

export interface Pokemon {
  id: number;
  name: string;
  pokedexNumber: number;
  description?: string;
  generation: number;
  stats: BaseStats;
  type1: PokemonType;
  type2?: PokemonType;
  abilities: string[];
  hiddenAbility?: string;
  height?: number;
  weight?: number;
  baseExp?: number;
  sprites?: PokemonSprites;
}

export interface Move {
  id: number;
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power?: number;
  accuracy?: number;
  pp: number;
  priority: number;
  description?: string;
  effect?: Record<string, any>;
}

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  profileBio?: string;
  avatarUrl?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// ============================================================================
// TEAM TYPES
// ============================================================================

export interface Team {
  id: string;
  userId: string;
  name: string;
  description?: string;
  format: 'OU' | 'Doubles' | 'LC' | 'Ubers' | 'Monotype' | string;
  pokemonIds: number[];
  ratingScore: number;
  isPublic: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamRating {
  id: string;
  teamId: string;
  typeCoverageScore: number;
  weaknessPenalty: number;
  roleBalanceScore: number;
  synergyScore: number;
  metaRelevanceScore: number;
  finalScore: number;
  weaknesses: PokemonType[];
  resistances: PokemonType[];
  roles: Role[];
  warnings: Warning[];
  calculatedAt: Date;
}

export type Role = 'sweeper' | 'tank' | 'support' | 'wallbreaker' | 'utility' | 'mixed';

export interface Warning {
  type: 'weakness' | 'missing-role' | 'redundancy' | 'speed-tier';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TeamCoverage {
  offensive: PokemonType[];
  defensive: PokemonType[];
  gaps: PokemonType[];
}

// ============================================================================
// FORUM TYPES
// ============================================================================

export interface ForumThread {
  id: string;
  userId: string;
  category: 'strategy' | 'team-building' | 'meta-discussion' | 'general';
  title: string;
  body: string;
  views: number;
  repliesCount: number;
  pinned: boolean;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumReply {
  id: string;
  threadId: string;
  userId: string;
  body: string;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
}

export interface ForumVote {
  id: string;
  userId: string;
  replyId: string;
  voteType: 'upvote' | 'downvote';
}

// ============================================================================
// TOURNAMENT TYPES
// ============================================================================

export interface Tournament {
  id: string;
  createdBy: string;
  name: string;
  description?: string;
  format: string;
  status: 'open' | 'in-progress' | 'closed';
  maxParticipants: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentSubmission {
  id: string;
  tournamentId: string;
  userId: string;
  teamId: string;
  ratingAtSubmission?: number;
  wins: number;
  losses: number;
  eloRating: number;
  submittedAt: Date;
}

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  totalTeamRating: number;
  tournamentWins: number;
  wins: number;
  losses: number;
  eloRating: number;
  updatedAt: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// TYPE MATCHUPS
// ============================================================================

export interface TypeChart {
  effective: PokemonType[];
  weak: PokemonType[];
  resistance: PokemonType[];
  immune: PokemonType[];
}

