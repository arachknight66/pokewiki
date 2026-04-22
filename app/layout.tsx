/**
 * Root Layout - App wrapper with providers
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pokémon Competitive Intelligence Platform',
  description: 'Build, rate, and share competitive Pokémon teams with advanced analytics',
  keywords: ['pokémon', 'competitive', 'team-builder', 'smogon', 'rating'],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-100">
        <div className="min-h-screen flex flex-col">
          {/* Navigation placeholder */}
          <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="text-xl font-bold text-primary-600">PokéIntel</div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
              <p>© 2024 Pokémon Competitive Intelligence Platform</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
