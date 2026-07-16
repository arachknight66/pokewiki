import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pokewiki.com';

  // Core static and index routes
  const routes = [
    '',
    '/pokemon',
    '/type-chart',
    '/compare',
    '/forum',
    '/tournaments',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Pokémon static IDs (1-151, excluding 0)
  const pokemonRoutes = Array.from({ length: 151 }, (_, i) => ({
    url: `${baseUrl}/pokemon/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Popular moves static routes
  const popularMoves = [
    'tackle',
    'growl',
    'thunderbolt',
    'surf',
    'flamethrower',
    'psychic',
    'hyper-beam',
    'ice-beam',
    'earthquake'
  ];
  const moveRoutes = popularMoves.map((move) => ({
    url: `${baseUrl}/moves/${move}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Popular abilities static routes
  const popularAbilities = [
    'levitate',
    'intimidate',
    'overgrow',
    'blaze',
    'torrent',
    'static',
    'pressure',
    'guts',
    'chlorophyll'
  ];
  const abilityRoutes = popularAbilities.map((ability) => ({
    url: `${baseUrl}/abilities/${ability}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Popular items static routes
  const popularItems = [
    'poke-ball',
    'great-ball',
    'ultra-ball',
    'master-ball',
    'potion',
    'revive',
    'rare-candy',
    'leftovers'
  ];
  const itemRoutes = popularItems.map((item) => ({
    url: `${baseUrl}/items/${item}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...routes,
    ...pokemonRoutes,
    ...moveRoutes,
    ...abilityRoutes,
    ...itemRoutes,
  ];
}
