/**
 * Project Setup & Initialization Guide
 */

# Pokémon Competitive Intelligence Platform - Setup Guide

## Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```
DATABASE_URL=postgresql://user:password@localhost:5432/pokewiki
JWT_SECRET=generate-a-strong-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Database Setup

#### Create Database
```bash
createdb pokewiki
```

Or using psql:
```sql
CREATE DATABASE pokewiki;
```

#### Run Migrations
```bash
npm run db:migrate
```

This will:
- Create all tables from DATABASE_SCHEMA.sql
- Set up indexes and relationships
- Initialize audit logs

#### Seed Initial Data (Pokémon Data)
```bash
npm run db:seed
```

This populates:
- All 1,025 Pokémon with base stats
- 826+ moves
- Abilities
- Type data

### 4. Start Development Server
```bash
npm run dev
```

Server runs at: http://localhost:3000

### 5. Build for Production
```bash
npm run build
npm start
```

## Project Structure

```
pokewiki/
├── app/                       # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── pokemon/           # Pokémon database routes
│   │   ├── teams/             # Team management routes
│   │   ├── forum/             # Community forum routes
│   │   └── tournaments/       # Tournament routes
│   ├── pokemon/              # Pokémon database page
│   ├── team-builder/         # Team builder page
│   ├── forum/                # Forum pages
│   ├── tournaments/          # Tournament pages
│   ├── auth/                 # Auth pages (login, register)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/               # Reusable React components
│   ├── ui/                   # Atomic UI components
│   ├── pokemon/              # Pokémon-specific components
│   ├── team/                 # Team builder components
│   ├── forum/                # Forum components
│   └── common/               # Shared layout components
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities & business logic
│   ├── auth.ts               # JWT & password utilities
│   ├── db.ts                 # Database connection
│   ├── types.ts              # TypeScript interfaces
│   ├── validators.ts         # Zod schemas
│   ├── api-utils.ts          # API response helpers
│   ├── type-system.ts        # Pokémon type system
│   └── rating-engine.ts      # Team rating algorithm
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind CSS config
├── next.config.js            # Next.js config
└── DATABASE_SCHEMA.sql       # SQL schema
```

## Key Features

### 1. Team Rating Engine
Scores teams (0-100) based on:
- **Type Coverage** (25%): Move diversity and offensive coverage
- **Role Balance** (20%): Distribution of sweepers, tanks, support
- **Team Synergy** (20%): Pairwise type and ability compatibility
- **Meta Relevance** (10%): Usage rates of Pokémon
- **Defensive Profile** (25%): Weakness penalty and resistances

Location: `lib/rating-engine.ts`

### 2. Type System
- Complete type matchup chart (all 18 types)
- Weakness/resistance analysis
- Type synergy calculations
- Coverage gap detection

Location: `lib/type-system.ts`

### 3. Authentication
- JWT-based authentication
- bcrypt password hashing
- Refresh tokens with rotation
- Protected API routes

Location: `lib/auth.ts`

### 4. Database
- Normalized PostgreSQL schema
- Indexed for performance
- Transaction support
- Prepared statements for SQL injection prevention

Location: `DATABASE_SCHEMA.sql`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out

### Pokémon
- `GET /api/pokemon` - List Pokémon (paginated, searchable)
- `GET /api/pokemon/:id` - Get Pokémon details with moves

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `POST /api/teams/:id/rate` - Calculate team rating
- `DELETE /api/teams/:id` - Delete team

### Forum
- `GET /api/forum/threads` - List threads
- `POST /api/forum/threads` - Create thread
- `GET /api/forum/threads/:id` - Get thread with replies
- `POST /api/forum/threads/:id/replies` - Post reply
- `POST /api/forum/replies/:id/vote` - Vote on reply

### Tournaments
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament
- `POST /api/tournaments/:id/submit` - Submit team
- `GET /api/tournaments/:id/leaderboard` - Get standings

## Development Tips

### Database Debugging
```bash
# Connect to database
psql pokewiki

# List tables
\dt

# Describe table
\d pokemon

# View config
\conninfo
```

### Testing API Endpoints
```bash
# Using curl
curl -X GET http://localhost:3000/api/pokemon \
  -H "Authorization: Bearer YOUR_TOKEN"

# Using API client like Postman/Insomnia
Import the endpoints from this guide
```

### Performance Optimization
- Pokémon data is cached (24h) - mostly static
- Use pagination for large datasets
- Database queries are indexed on common filters
- Redis caching optional for leaderboards

## Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Deploy via Vercel dashboard
# Set environment variables in Vercel project settings
```

### Manual Deployment
```bash
# Build
npm run build

# Start production server
npm start

# Use process manager like PM2
pm2 start npm --name pokewiki -- start
```

### Environment Variables (Production)
```
DATABASE_URL=production_postgres_url
JWT_SECRET=strong-random-secret
NEXT_PUBLIC_API_URL=https://yourapp.com
NODE_ENV=production
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format
- Ensure database exists: `createdb pokewiki`

### JWT Token Issues
- Ensure JWT_SECRET is set in .env.local
- Check token expiry (24h for access, 7d for refresh)
- Verify Authorization header format: `Bearer TOKEN`

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## Testing

### Unit Tests (Recommended additions)
```bash
npm install --save-dev vitest @testing-library/react
```

### API Testing
Use Thunder Client VS Code extension or Postman

## Performance Metrics

- Initial load: Target <2s (FCP <1.5s)
- Team rating calculation: <500ms
- Type coverage analysis: <100ms
- Database query response: <200ms

## Security Checklist

- [ ] Set strong JWT_SECRET in production
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS protection (sanitize markdown)
- [ ] CSRF tokens on forms
- [ ] Password requirements enforced (12+ chars, uppercase, number)

## Next Steps

1. **Seed Pokémon Data** - Run the seed script to populate Pokémon
2. **Create Auth Pages** - Build login/register UI
3. **Implement Team Builder UI** - Interactive team composition
4. **Build Team Display Pages** - Show team details with ratings
5. **Add Forum Pages** - Discussion threads
6. **Create Leaderboard** - Rank teams and users

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [React Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev/)

---

**Last Updated**: April 2024
**Platform Version**: 1.0.0-alpha
