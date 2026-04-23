/**
 * Validation schemas using Zod
 */

import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscore, and hyphen'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================================================
// POKÉMON SCHEMAS
// ============================================================================

export const PokemonFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(2000).default(20),
  search: z.string().optional(),
  type1: z.string().optional(),
  type2: z.string().optional(),
  generation: z.number().int().min(1).max(9).optional(),
  sortBy: z.enum(['name', 'id']).default('id'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================================
// TEAM SCHEMAS
// ============================================================================

export const CreateTeamSchema = z.object({
  name: z.string()
    .min(3, 'Team name must be at least 3 characters')
    .max(150, 'Team name must be less than 150 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  format: z.string().default('OU'),
  pokemonIds: z.array(z.number().int().positive())
    .min(1, 'Team must have at least 1 Pokémon')
    .max(6, 'Team must have at most 6 Pokémon'),
});

export const UpdateTeamSchema = CreateTeamSchema.partial();

export const TeamListSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(2000).default(20),
  sortBy: z.enum(['rating', 'created', 'name']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// FORUM SCHEMAS
// ============================================================================

export const CreateThreadSchema = z.object({
  category: z.enum(['strategy', 'team-building', 'meta-discussion', 'general']),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  body: z.string()
    .min(20, 'Post must be at least 20 characters')
    .max(5000, 'Post must be less than 5000 characters'),
});

export const UpdateThreadSchema = CreateThreadSchema.partial();

export const CreateReplySchema = z.object({
  body: z.string()
    .min(5, 'Reply must be at least 5 characters')
    .max(2000, 'Reply must be less than 2000 characters'),
});

export const ThreadListSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(2000).default(20),
  category: z.enum(['strategy', 'team-building', 'meta-discussion', 'general']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['latest', 'popular', 'trending']).default('latest'),
});

export const VoteSchema = z.object({
  voteType: z.enum(['upvote', 'downvote']),
});

// ============================================================================
// TOURNAMENT SCHEMAS
// ============================================================================

export const CreateTournamentSchema = z.object({
  name: z.string()
    .min(5, 'Tournament name must be at least 5 characters')
    .max(150, 'Tournament name must be less than 150 characters'),
  description: z.string().max(500).optional(),
  format: z.string().default('OU'),
  maxParticipants: z.number().int().min(2).max(256).default(64),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const TournamentSubmissionSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UpdateProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .optional(),
  profileBio: z.string().max(500).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    notifications: z.boolean().optional(),
  }).optional(),
});

// ============================================================================
// PAGINATION SCHEMA
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(2000).default(20),
});
