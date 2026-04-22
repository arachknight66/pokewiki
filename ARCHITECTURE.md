# Pokémon Competitive Intelligence Platform - Architecture

## 1. SYSTEM OVERVIEW

### Core Modules
- **Pokémon Database**: Raw game data (stats, moves, abilities, types)
- **Team Builder**: Interactive team composition tool with real-time analysis
- **Rating Engine**: Mathematical scoring system for team viability
- **Tournament System**: Team submission, leaderboards, Elo tracking
- **Community Forum**: User authentication, threads, discussions

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Node.js/Express, PostgreSQL
- **Authentication**: JWT (custom) with secure password hashing
- **State Management**: TanStack Query (React Query) + Zustand for local state
- **Database**: PostgreSQL with normalized schema
- **Caching**: Redis (optional for leaderboards)

---

## 2. DATABASE SCHEMA

### Core Tables

#### pokemon
- id (PK)
- name
- generation
- hp, attack, defense, spa, spd, spe (stats)
- type_1, type_2
- abilities (JSON array)
- base_exp
- height, weight

#### moves
- id (PK)
- name
- type
- category (physical, special, status)
- power, accuracy
- priority

#### pokemon_moves (junction)
- pokemon_id (FK)
- move_id (FK)
- learn_method (level, tm, egg, etc.)

#### abilities
- id (PK)
- name
- description
- effect (JSON)

#### pokemon_abilities (junction)
- pokemon_id (FK)
- ability_id (FK)
- is_hidden (boolean)

#### users
- id (PK)
- email (UNIQUE)
- username (UNIQUE)
- password_hash
- created_at
- preferences (JSON: theme, etc.)

#### teams
- id (PK)
- user_id (FK)
- name
- description
- format (e.g., "Smogon OU")
- pokemon_ids (array of 6 pokemon IDs)
- created_at, updated_at
- rating_score (0-100)

#### team_ratings
- id (PK)
- team_id (FK)
- type_coverage_score (0-100)
- weakness_penalty (-50 to 0)
- role_balance_score (0-100)
- synergy_score (0-100)
- meta_relevance_score (0-100)
- final_score (0-100)
- warnings (JSON array)
- calculated_at

#### forum_threads
- id (PK)
- user_id (FK)
- category (strategy, team-building, meta-discussion)
- title
- body (markdown)
- created_at, updated_at
- views, replies_count

#### forum_replies
- id (PK)
- thread_id (FK)
- user_id (FK)
- body (markdown)
- upvotes, downvotes
- created_at, updated_at

#### user_votes
- id (PK)
- user_id (FK)
- reply_id (FK)
- type (upvote, downvote)

#### tournaments
- id (PK)
- name
- format
- status (open, in-progress, closed)
- start_date, end_date
- created_at

#### tournament_submissions
- id (PK)
- tournament_id (FK)
- team_id (FK)
- user_id (FK)
- rating_at_submission
- wins, losses (if updating)

---

## 3. API ARCHITECTURE

### Authentication Routes
- POST `/api/auth/register` - Sign up
- POST `/api/auth/login` - Sign in
- POST `/api/auth/logout` - Sign out
- GET `/api/auth/me` - Current user
- POST `/api/auth/refresh` - Refresh JWT

### Pokémon Routes
- GET `/api/pokemon` - List all (paginated)
- GET `/api/pokemon/:id` - Detail view
- GET `/api/pokemon/:id/moves` - Available moves
- GET `/api/pokemon/search` - Search/filter

### Team Routes
- POST `/api/teams` - Create team
- GET `/api/teams` - List user's teams
- GET `/api/teams/:id` - Get team detail
- PUT `/api/teams/:id` - Update team
- DELETE `/api/teams/:id` - Delete team

### Rating Routes
- POST `/api/teams/:id/rate` - Calculate team rating
- GET `/api/teams/:id/rating` - Get cached rating

### Forum Routes
- GET `/api/forum/threads` - List threads
- POST `/api/forum/threads` - Create thread
- GET `/api/forum/threads/:id` - Thread detail + replies
- POST `/api/forum/threads/:id/replies` - Add reply
- POST `/api/forum/replies/:id/vote` - Vote on reply

### Tournament Routes
- GET `/api/tournaments` - List all
- POST `/api/tournaments` - Create tournament
- POST `/api/tournaments/:id/submit` - Submit team
- GET `/api/tournaments/:id/leaderboard` - Standings

---

## 4. FRONTEND STRUCTURE

```
app/
├── layout.tsx                 # Root layout with theme, auth provider
├── page.tsx                   # Homepage/dashboard
├── auth/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── pokemon/
│   ├── page.tsx              # Pokémon list/database
│   ├── [id]/
│   │   └── page.tsx          # Detail view
│   └── layout.tsx
├── team-builder/
│   ├── page.tsx              # Main builder
│   ├── [id]/page.tsx          # Edit team
│   └── layout.tsx
├── tournaments/
│   ├── page.tsx              # List
│   ├── [id]/page.tsx         # Detail + leaderboard
│   └── create/page.tsx
├── forum/
│   ├── page.tsx              # Threads list
│   ├── create/page.tsx       # New thread
│   ├── [id]/page.tsx         # Thread detail
│   └── layout.tsx
├── dashboard/
│   └── page.tsx              # User dashboard
└── api/                       # All API routes

components/
├── ui/
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
├── pokemon/
│   ├── StatChart.tsx          # Radar chart
│   ├── TypeBadge.tsx
│   ├── PokemonCard.tsx
│   └── MoveSelector.tsx
├── team/
│   ├── TeamCard.tsx
│   ├── PokemonSlot.tsx        # Draggable/droppable
│   ├── TypeCoverageMap.tsx    # Heatmap
│   ├── RoleIndicator.tsx
│   └── RatingBreakdown.tsx
├── forum/
│   ├── ThreadCard.tsx
│   ├── ThreadForm.tsx
│   ├── ReplyCard.tsx
│   └── ReplyList.tsx
└── common/
    ├── Header.tsx
    ├── Navigation.tsx
    ├── Footer.tsx
    └── ThemeToggle.tsx

lib/
├── auth.ts                    # JWT utilities
├── db.ts                      # Database client
├── rating-engine.ts           # Scoring logic
├── type-coverage.ts           # Type analysis
├── synergy-calculator.ts      # Team synergy
└── validators.ts              # Zod schemas

hooks/
├── useAuth.ts
├── useTeam.ts
├── usePokemon.ts
├── useForumThreads.ts
└── useRating.ts

types/
├── pokemon.ts
├── team.ts
├── user.ts
├── forum.ts
├── rating.ts
└── api.ts

styles/
└── globals.css               # Global Tailwind styles
```

---

## 5. RATING ENGINE ALGORITHM

### Scoring Breakdown (Total: 100 points)

**Type Coverage Score (25 pts)**
- Analyze what types are covered by all moves in team
- Check if team has good offensive coverage
- Each Pokémon: contribution based on move pool diversity

**Weakness Penalty (25 pts, negative)**
- Identify team's weaknesses (types with many counters)
- Stack analysis: triple weakness = -20 pts
- Double weakness = -10 pts
- Consider resistances as mitigation

**Role Balance Score (20 pts)**
- Detect roles: Sweeper, Tank, Support, Wallbreaker, etc.
- Ideal: 2-4 different roles
- Imbalance penalty: e.g., all sweepers = -15 pts

**Synergy Score (20 pts)**
- Pairwise compatibility between Pokémon
- Common combos: +5 pts per synergy pair
- Ability interactions: Setup sweeper + screens setter = +3 pts

**Meta Relevance (10 pts)**
- Based on current tier usage rates
- OU = +5, UU = +3, RU = +2, PU = +1, Niche = 0

### Display
- Final score (0-100) with color gradient
- Breakdown chart
- Warnings: "No bulky water coverage", "Ice weakness stacking", etc.

---

## 6. AUTHENTICATION FLOW

### JWT-based (Custom)
1. User registers → Hash password with bcrypt → Store in DB
2. Login → Verify password → Issue JWT (access + refresh tokens)
3. Store tokens in httpOnly cookies
4. Middleware checks JWT on protected routes
5. Refresh token rotates automatically (7-day expiry)

---

## 7. DESIGN SYSTEM

### Color Palette (Light Theme)
- Background: #FFFFFF
- Surface: #F5F5F5
- Border: #E0E0E0
- Text: #1A1A1A
- Accent: #0F766E (teal)
- Secondary: #7C3AED (purple)

### Type Colors (Pokémon)
- Fire: #F08030
- Water: #6890F0
- Grass: #78C850
- Electric: #F8D030
- Psychic: #F85888
- (... etc for 18 types)

### Typography
- Headings: Inter, 600-700, tight line-height
- Body: Inter, 400, 16px
- Metrics: "Display" (16-40px), "Heading" (20-32px), "Body" (14-16px)

### Micro-interactions
- Hover: subtle shadow lift (2px)
- Click: brief scale (98%)
- Transitions: 150-200ms cubic-bezier
- Loading: skeleton or spinner

---

## 8. SECURITY CONSIDERATIONS

- CORS configured for frontend origin only
- Rate limiting on auth, team submission endpoints
- CSRF tokens for form submissions
- SQL injection prevention via prepared statements
- XSS protection: sanitize markdown in forum
- Password requirements: 12+ chars, uppercase, number

---

## 9. PERFORMANCE TARGETS

- Initial load: <2s (FCP <1.5s)
- Team builder rating: <500ms
- Type coverage calculation: <100ms
- Database queries indexed on frequently filtered columns
- Caching strategy:
  - Pokémon data: 24h cache (static)
  - User teams: 5m cache (user-specific)
  - Leaderboards: 1h cache

---

## 10. DEPLOYMENT STRATEGY

- Vercel for Next.js frontend/API
- Managed PostgreSQL (Vercel Postgres, Railway, or AWS RDS)
- Environment variables: DB_URL, JWT_SECRET, etc.
- Seed script for initial Pokémon data

---

## 11. DEVELOPMENT PHASES

### Phase 1: Core (Weeks 1-2)
- Auth system
- Pokémon DB + API
- Basic team builder

### Phase 2: Intelligence (Weeks 3-4)
- Rating engine
- Type coverage analysis
- Team validation

### Phase 3: Community (Weeks 5-6)
- Forum system
- Tournament scaffolding
- Leaderboards

### Phase 4: Polish (Weeks 7-8)
- UI refinement
- Dark mode
- Performance optimization

