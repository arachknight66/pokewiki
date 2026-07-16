import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pokewiki.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/pokemon/0',
        '/teams/new',
        '/forum/new',
        '/tournaments/create',
        '/profile',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
