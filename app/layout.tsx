/**
 * Root Layout - App wrapper with providers
 */

import type { Metadata } from 'next';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'PokéWiki — Pokémon Encyclopedia',
  description: 'Browse Pokémon with detailed stats, sprites, Pokédex entries from every game, and build competitive teams.',
  keywords: ['pokémon', 'pokédex', 'pokedex', 'wiki', 'sprites', 'team-builder'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-100 font-[Inter,system-ui,sans-serif]">
        <div className="min-h-screen flex flex-col">
          <Navbar />

          {/* Main content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
            <Providers>
              {children}
            </Providers>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <p>© 2026 PokéWiki · Pokémon data from <a href="https://pokeapi.co" className="underline hover:text-gray-800 dark:hover:text-gray-300">PokéAPI</a></p>
              <p>Pokémon and all related names are ™ & © Nintendo / Game Freak / Creatures Inc.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
