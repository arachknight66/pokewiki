-- Pokémon Competitive Intelligence Platform - Database Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- CORE POKÉMON DATA TABLES
-- ============================================================================

CREATE TABLE pokemon (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  pokedex_number INT NOT NULL UNIQUE,
  description TEXT,
  generation INT NOT NULL,
  
  -- Base Stats
  hp INT NOT NULL,
  attack INT NOT NULL,
  defense INT NOT NULL,
  spa INT NOT NULL,
  spd INT NOT NULL,
  spe INT NOT NULL,
  
  -- Classification
  type_1 VARCHAR(20) NOT NULL,
  type_2 VARCHAR(20),
  
  -- Physical Data
  height DECIMAL(3, 1),
  weight DECIMAL(5, 1),
  base_exp INT,
  
  -- Abilities (JSON array)
  abilities JSONB NOT NULL DEFAULT '[]',
  hidden_ability VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX pokemon_name_idx (name),
  INDEX pokemon_type_idx (type_1, type_2),
  INDEX pokemon_generation_idx (generation)
);

CREATE TABLE moves (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('physical', 'special', 'status')),
  
  power INT,
  accuracy INT,
  pp INT NOT NULL,
  priority INT DEFAULT 0,
  
  description TEXT,
  effect JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX moves_type_idx (type),
  INDEX moves_category_idx (category)
);

-- Junction table: Pokémon can learn many moves
CREATE TABLE pokemon_moves (
  id SERIAL PRIMARY KEY,
  pokemon_id INT NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  move_id INT NOT NULL REFERENCES moves(id) ON DELETE CASCADE,
  learn_method VARCHAR(50) NOT NULL, -- 'level', 'tm', 'egg', 'move-tutor', 'evolution'
  learn_level INT, -- Only for level-up moves
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(pokemon_id, move_id, learn_method, learn_level),
  INDEX pokemon_moves_pokemon_idx (pokemon_id),
  INDEX pokemon_moves_move_idx (move_id)
);

CREATE TABLE abilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  effect JSONB, -- Ability mechanics
  is_hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  profile_bio TEXT,
  avatar_url TEXT,
  
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  -- Security
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX users_email_idx (email),
  INDEX users_username_idx (username)
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX refresh_tokens_user_idx (user_id),
  INDEX refresh_tokens_expires_idx (expires_at)
);

-- ============================================================================
-- TEAM SYSTEM
-- ============================================================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(150) NOT NULL,
  description TEXT,
  format VARCHAR(50) DEFAULT 'OU', -- 'OU', 'Doubles', 'LC', etc.
  
  -- Team composition (store pokemon IDs as array)
  pokemon_ids INT[] NOT NULL CHECK (array_length(pokemon_ids, 1) <= 6),
  
  -- Rating metadata
  rating_score DECIMAL(5, 2) DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX teams_user_idx (user_id),
  INDEX teams_rating_idx (rating_score DESC),
  INDEX teams_created_idx (created_at DESC)
);

CREATE TABLE team_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Subscores (0-100 each)
  type_coverage_score DECIMAL(5, 2) NOT NULL,
  weakness_penalty DECIMAL(5, 2) NOT NULL DEFAULT 0, -- Negative score
  role_balance_score DECIMAL(5, 2) NOT NULL,
  synergy_score DECIMAL(5, 2) NOT NULL,
  meta_relevance_score DECIMAL(5, 2) NOT NULL,
  
  -- Final score
  final_score DECIMAL(5, 2) NOT NULL,
  
  -- Analysis data
  weaknesses VARCHAR(20)[] DEFAULT '{}', -- Types the team is weak to
  resistances VARCHAR(20)[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}', -- Role distribution
  warnings JSONB DEFAULT '[]', -- Alert messages
  
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX team_ratings_team_idx (team_id)
);

-- ============================================================================
-- FORUM SYSTEM
-- ============================================================================

CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  category VARCHAR(50) NOT NULL CHECK (category IN ('strategy', 'team-building', 'meta-discussion', 'general')),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL, -- Markdown
  
  views INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX forum_threads_category_idx (category),
  INDEX forum_threads_user_idx (user_id),
  INDEX forum_threads_created_idx (created_at DESC),
  INDEX forum_threads_views_idx (views DESC)
);

CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  body TEXT NOT NULL, -- Markdown
  
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  net_votes INT DEFAULT 0,
  
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX forum_replies_thread_idx (thread_id),
  INDEX forum_replies_user_idx (user_id),
  INDEX forum_replies_net_votes_idx (net_votes DESC),
  INDEX forum_replies_created_idx (created_at DESC)
);

-- Track user votes on replies to prevent duplicate voting
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reply_id UUID NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, reply_id), -- One vote per user per reply
  INDEX forum_votes_user_idx (user_id),
  INDEX forum_votes_reply_idx (reply_id)
);

-- ============================================================================
-- TOURNAMENT SYSTEM
-- ============================================================================

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES users(id),
  
  name VARCHAR(150) NOT NULL,
  description TEXT,
  format VARCHAR(50) DEFAULT 'OU',
  
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'closed')),
  max_participants INT DEFAULT 64,
  
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX tournaments_status_idx (status),
  INDEX tournaments_created_idx (created_at DESC)
);

-- Track team submissions to tournaments
CREATE TABLE tournament_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  rating_at_submission DECIMAL(5, 2),
  
  -- Tournament results
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  elo_rating DECIMAL(6, 2) DEFAULT 1600,
  
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tournament_id, user_id, team_id),
  INDEX tournament_submissions_tournament_idx (tournament_id),
  INDEX tournament_submissions_user_idx (user_id),
  INDEX tournament_submissions_elo_idx (elo_rating DESC)
);

-- ============================================================================
-- LEADERBOARD CACHE
-- ============================================================================

CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  rank INT,
  total_team_rating DECIMAL(10, 2),
  tournament_wins INT,
  wins INT,
  losses INT,
  elo_rating DECIMAL(6, 2),
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id),
  INDEX leaderboard_rank_idx (rank),
  INDEX leaderboard_elo_idx (elo_rating DESC)
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  
  details JSONB,
  ip_address INET,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX audit_log_user_idx (user_id),
  INDEX audit_log_created_idx (created_at DESC),
  INDEX audit_log_action_idx (action)
);

-- ============================================================================
-- INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Type coverage analysis
CREATE INDEX pokemon_type_1_type_2_idx ON pokemon(type_1, type_2);

-- Team rating lookups
CREATE INDEX teams_user_rating_idx ON teams(user_id, rating_score DESC);

-- Forum discovery
CREATE INDEX forum_threads_category_created_idx ON forum_threads(category, created_at DESC);
CREATE INDEX forum_replies_thread_created_idx ON forum_replies(thread_id, created_at ASC);

-- Tournament participation
CREATE INDEX tournament_submissions_tournament_user_idx ON tournament_submissions(tournament_id, user_id);

