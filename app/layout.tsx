/**
 * Root Layout - App wrapper with providers and anime-styled shell
 */

import type { Metadata } from 'next';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('pokewiki-theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen transition-colors duration-300">
        {/* Background pattern */}
        <div className="bg-pattern" />

        <div className="min-h-screen flex flex-col relative">
          <Providers>
            <Navbar />
            <BackToTop />

            {/* Main content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="relative mt-auto">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(var(--glow-color),0.2)] to-transparent" />
              <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-3" style={{ color: 'var(--text-muted)' }}>
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-glow-pulse" />
                  © 2026 PokéWiki · Pokémon data from{' '}
                  <a href="https://pokeapi.co" className="underline decoration-dotted hover:text-[var(--accent-primary)] transition-colors">
                    PokéAPI
                  </a>
                </p>
                <p>Pokémon and all related names are ™ & © Nintendo / Game Freak / Creatures Inc.</p>
              </div>
            </footer>
          </Providers>
        </div>
      </body>
    </html>
  );
}
