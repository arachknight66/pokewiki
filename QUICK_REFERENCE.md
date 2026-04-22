# 🔥 Quick Reference - Common Commands & Patterns

## ⚡ Most Used Commands

```bash
# Development
npm run dev                # Start dev server (localhost:3000)
npm run build             # Compile for production
npm start                 # Run production build

# Database
npm run db:migrate        # Create tables & indexes
npm run db:seed           # Populate Pokémon data
psql pokewiki            # Connect to database

# Code Quality
npm run lint              # Check code quality
npm run type-check        # TypeScript validation

# Testing
npm run test              # Run tests (when added)
```

---

## 📚 File Locations (Quick Navigation)

| What I Need | File Path |
|------------|-----------|
| API Routes | `app/api/**/route.ts` |
| React Pages | `app/**/page.tsx` |
| UI Components | `components/ui/*.tsx` |
| Hooks | `hooks/index.ts` |
| Database | `lib/db.ts` |
| Auth Logic | `lib/auth.ts` |
| Team Ratings | `lib/rating-engine.ts` |
| Type System | `lib/type-system.ts` |
| Validation | `lib/validators.ts` |
| Types Definition | `lib/types.ts` |
| Global Styles | `app/globals.css` |
| Config | Root folder config files |

---

## 🎨 Component Usage Patterns

### Using Button Component
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, danger, ghost
// Sizes: sm, md, lg
// Props: isLoading, disabled, className
```

### Using Card Component
```tsx
import { Card } from '@/components/ui/Card';

<Card hoverable className="p-6">
  Content here
</Card>

// Props: hoverable, className, and all HTML div props
```

### Using TypeBadge
```tsx
import { TypeBadge, TypeBadgeGroup } from '@/components/ui/TypeBadge';

<TypeBadge type="fire" size="md" />
<TypeBadgeGroup types={['fire', 'flying']} size="sm" />

// Types: 'fire', 'water', 'grass', etc. (18 total)
// Sizes: sm, md, lg
```

---

## 🪝 Hook Usage Patterns

### Using useAuth
```tsx
import { useAuth } from '@/hooks';

const { user, isLoading, error, login, logout } = useAuth();

if (isLoading) return <div>Loading...</div>;
if (!user) return <div>Not logged in</div>;

return <div>Welcome, {user.username}</div>;
```

### Using usePokemonList
```tsx
import { usePokemonList } from '@/hooks';

const { data, isLoading, error } = usePokemonList({
  page: 1,
  pageSize: 20,
  search: 'charizard',
  type1: 'fire',
});

data?.data?.map(pokemon => (
  <div key={pokemon.id}>{pokemon.name}</div>
))
```

### Using useCreateTeam
```tsx
import { useCreateTeam } from '@/hooks';

const createTeam = useCreateTeam();

const handleSave = async () => {
  await createTeam.mutateAsync({
    name: 'My Team',
    format: 'OU',
    pokemonIds: [6, 25, 39], // Charizard, Pikachu, Jigglypuff
  });
};
```

---

## 📝 API Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { /* actual data */ },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email address"],
      "password": ["Password must be at least 12 characters"]
    }
  }
}
```

---

## 🔐 Authentication Patterns

### Checking Auth in Page
```tsx
'use client';

import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return <div>Welcome, {user.username}</div>;
}
```

### Making Authenticated API Call
```tsx
const response = await axios.get('/api/teams', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🗄️ Database Patterns

### Running a Query
```ts
import { query } from '@/lib/db';

// Get single row
const result = await query(
  'SELECT * FROM pokemon WHERE id = $1',
  [123]
);
const pokemon = result.rows[0];

// Get multiple rows
const result = await query(
  'SELECT * FROM pokemon WHERE type_1 = $1 LIMIT 20',
  ['fire']
);
const pokemon = result.rows;
```

### Transaction Pattern
```ts
import { transaction } from '@/lib/db';

await transaction(async (query) => {
  // All queries here are in one transaction
  await query('INSERT INTO teams ...', params);
  await query('INSERT INTO team_ratings ...', params);
  // Automatically commits or rolls back
});
```

---

## ✅ Validation Patterns

### Using Zod Schema
```ts
import { RegisterSchema } from '@/lib/validators';

const validation = RegisterSchema.safeParse(req.body);

if (!validation.success) {
  return sendValidationError(res, validation.error.flatten().fieldErrors);
}

const { email, username, password } = validation.data;
```

### Creating New Schema
```ts
import { z } from 'zod';

export const MySchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});
```

---

## 🎨 Styling Patterns

### Using Tailwind Classes
```tsx
<div className="
  px-4 py-2 rounded-lg
  bg-primary-600 text-white
  hover:bg-primary-700
  transition-colors duration-200
  dark:bg-primary-700 dark:hover:bg-primary-800
">
  Styled with Tailwind
</div>
```

### Using Type Colors
```tsx
import { TYPE_COLORS } from '@/lib/type-system';

<span style={{ backgroundColor: TYPE_COLORS.fire }}>
  Fire Type
</span>
```

### Dark Mode Support
```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Supports light and dark modes
</div>
```

---

## 🔍 Testing Patterns

### Testing API with curl
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "username":"testuser",
    "password":"Password123!",
    "confirmPassword":"Password123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get Pokémon (with token)
curl http://localhost:3000/api/pokemon \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Testing in Browser Console
```js
// Fetch Pokémon
fetch('/api/pokemon?page=1&pageSize=10')
  .then(r => r.json())
  .then(d => console.log(d));

// Create Team
fetch('/api/teams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  },
  body: JSON.stringify({
    name: 'Test Team',
    format: 'OU',
    pokemonIds: [6, 25, 39]
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## 🐛 Debugging Tips

### Check Database Connection
```bash
psql pokewiki

# In psql prompt:
\dt                    # List all tables
SELECT COUNT(*) FROM pokemon;   # Check Pokémon count
\q                     # Quit
```

### Check Logs
```bash
# Browser console (F12)
console.log()          # General logging
console.error()        # Error logging

# Server logs
npm run dev            # See server output in terminal
```

### TypeScript Errors
```bash
npm run type-check     # Find all type errors
```

### Linting Issues
```bash
npm run lint           # Check code quality
```

---

## 🚀 Deployment Checklist

Before deploying:
```
- [ ] npm run build succeeds
- [ ] npm run type-check passes
- [ ] npm run lint passes  
- [ ] DATABASE_URL set in environment
- [ ] JWT_SECRET set in environment
- [ ] Database migrations run (npm run db:migrate)
- [ ] Database seeded (npm run db:seed)
- [ ] Tested on staging
- [ ] Error monitoring configured
- [ ] Backups configured
```

Vercel Deployment:
```bash
git push origin main   # Deploy automatically
```

---

## 📊 Common Development Tasks

### Add New Page
```ts
// Create app/mypage/page.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

export default function MyPage() {
  return (
    <div className="space-y-6">
      <h1>My Page</h1>
      <Card>Content here</Card>
    </div>
  );
}
```

### Add New API Route
```ts
// Create app/api/myroute/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({
      success: true,
      data: { /* ... */ }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'ERROR', message: 'Error message' }
    }, { status: 500 });
  }
}
```

### Add New Component
```tsx
// Create components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  items: string[];
}

export function MyComponent({ title, items }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Add New Hook
```ts
// Add to hooks/index.ts
import { useQuery } from '@tanstack/react-query';

export function useMyData(id: string) {
  return useQuery({
    queryKey: ['my-data', id],
    queryFn: async () => {
      const response = await fetch(`/api/mydata/${id}`);
      return response.json();
    },
  });
}
```

---

## 🎯 Performance Optimization Tips

### For Pages
- Use dynamic imports for heavy components
- Implement proper pagination
- Cache static assets

### For Database
- Use indexes (already done!)
- Limit query results with LIMIT/OFFSET
- Use connection pooling (already done!)

### For API
- Return only needed fields
- Implement caching (via React Query)
- Use compression

---

## 🔗 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Zod Docs](https://zod.dev/)

---

## 💬 Common Questions

**Q: How do I add Pokémon to a team?**  
A: Use the Team Builder page (`/team-builder`). Click "Add Pokémon", search for one, click it. Up to 6 allowed.

**Q: How do I save a team?**  
A: Must be logged in. Fill team name, add Pokémon, click "Save Team".

**Q: Where are my teams stored?**  
A: In PostgreSQL `teams` table. Access via `/api/teams` endpoint.

**Q: How is team rating calculated?**  
A: 5-factor algorithm in `lib/rating-engine.ts`: coverage (25%), role balance (20%), synergy (20%), meta relevance (10%), defense (25%).

**Q: Can I change the rating formula?**  
A: Yes! Edit `lib/rating-engine.ts`, adjust weights and logic, test with `npm run type-check`.

**Q: How do I add more Pokémon?**  
A: Edit `scripts/seed.js` to fetch more from PokéAPI, run `npm run db:seed`.

---

**Happy coding! 🚀**

For more detailed help, see:
- SETUP.md - Installation help
- ARCHITECTURE.md - System design
- IMPLEMENTATION_GUIDE.md - Building features
