/**
 * Homepage — Pokémon Anime-inspired with adventure theme
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16 stagger-children">
      {/* Hero Section — "Your journey begins" */}
      <section className="relative text-center space-y-8 py-16 lg:py-24 particle-bg rounded-3xl overflow-hidden">
        {/* Anime-style diagonal gradient background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(220,38,38,0.06) 0%, transparent 40%, rgba(37,99,235,0.06) 70%, rgba(245,158,11,0.04) 100%)',
          }}
        />

        {/* Big pokéball watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.02] dark:opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="2" y1="50" x2="38" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="62" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{
              background: 'rgba(var(--glow-color), 0.08)',
              border: '2px solid rgba(var(--glow-color), 0.15)',
              color: 'var(--pokedex-red)',
            }}>
            <span className="w-2 h-2 rounded-full animate-glow-pulse" style={{ background: 'var(--pokedex-red)' }} />
            YOUR POKÉMON JOURNEY STARTS HERE
          </div>

          <h1 className="text-5xl lg:text-7xl font-black font-display leading-tight pb-2">
            <span className="anime-heading">PokéWiki</span>
          </h1>

          <p className="text-lg lg:text-xl max-w-2xl mx-auto mt-4 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            Your ultimate companion for every Pokémon adventure —
            explore the complete Pokédex, master type matchups, and build championship teams
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 relative z-10">
          <Link
            href="/pokemon"
            className="anime-btn anime-btn-primary px-8 py-4 text-lg rounded-2xl inline-flex items-center justify-center gap-2.5"
          >
            <span className="text-xl">📖</span>
            Open Pokédex
          </Link>
          <Link
            href="/team-builder"
            className="anime-btn anime-btn-secondary px-8 py-4 text-lg rounded-2xl inline-flex items-center justify-center gap-2.5"
          >
            <span className="text-xl">⚔️</span>
            Build a Team
          </Link>
        </div>

        {/* Floating pokéball shapes */}
        <div className="absolute top-8 left-[12%] w-12 h-12 rounded-full opacity-[0.03] dark:opacity-[0.06] animate-float pointer-events-none"
          style={{ border: '2px solid var(--pokedex-red)' }} />
        <div className="absolute bottom-16 right-[18%] w-8 h-8 rounded-full opacity-[0.03] dark:opacity-[0.06] animate-float-delayed pointer-events-none"
          style={{ border: '2px solid var(--accent-secondary)' }} />
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-black font-display mb-3">
            Every Trainer&apos;s Toolkit
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
            Everything you need to become a Pokémon Master
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {features.map((feature, i) => (
            <div
              key={feature.id}
              className="glass-card-glow p-6 group hover:-translate-y-1 transition-all duration-300 energy-burst type-stripe-top"
              style={{ '--type-color': feature.accentColor } as React.CSSProperties}
            >
              <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 inline-block">
                {feature.icon}
              </div>
              <h3 className="text-lg font-extrabold font-display mb-2">{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section — "Choose your starter" energy */}
      <section className="relative rounded-3xl overflow-hidden p-10 lg:p-16 text-center pokedex-panel">
        <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(var(--glow-color),0.1) 20px, rgba(var(--glow-color),0.1) 21px)',
            animation: 'diagonalStripe 2s linear infinite',
          }}
        />

        <h2 className="text-3xl lg:text-4xl font-black font-display mb-4">
          <span className="anime-heading">Gotta catch &apos;em all!</span>
        </h2>
        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Dive into the world of Pokémon — browse every species, study their strengths,
          and forge the ultimate team
        </p>
        <Link
          href="/pokemon"
          className="anime-btn anime-btn-primary px-10 py-4 text-lg rounded-2xl inline-flex items-center gap-2.5"
        >
          Start Exploring
          <span className="text-xl">→</span>
        </Link>
      </section>
    </div>
  );
}

const features = [
  {
    id: 1,
    icon: '📖',
    title: 'Complete Pokédex',
    description: 'Every Pokémon from Gen I to IX — official artwork, game sprites, animated Showdown sprites, and shiny variants.',
    accentColor: '#DC2626',
  },
  {
    id: 2,
    icon: '⚔️',
    title: 'Team Builder',
    description: 'Build competitive teams with real-time type coverage analysis, role balance scoring, and synergy evaluation.',
    accentColor: '#2563EB',
  },
  {
    id: 3,
    icon: '📊',
    title: 'Battle Analytics',
    description: 'Detailed stat breakdowns, type effectiveness charts, and competitive tier data to sharpen your strategy.',
    accentColor: '#059669',
  },
  {
    id: 4,
    icon: '✨',
    title: 'Sprite Gallery',
    description: 'Switch between official artwork, 3D Home renders, animated Showdown sprites, and classic 2D — including shinies.',
    accentColor: '#F59E0B',
  },
  {
    id: 5,
    icon: '🔍',
    title: 'Smart Filters',
    description: 'Search by name, filter by type or generation, and sort to find exactly the Pokémon you need.',
    accentColor: '#8B5CF6',
  },
  {
    id: 6,
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built on Next.js with intelligent caching — Pokémon data loads instantly, pages feel native-smooth.',
    accentColor: '#EC4899',
  },
];
