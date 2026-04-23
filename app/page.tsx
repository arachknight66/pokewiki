/**
 * Homepage — Pokémon Anime-inspired with adventure theme
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16 stagger-children">
      {/* Hero Section — "Your journey begins" */}
      <section className="relative text-center space-y-8 py-20 lg:py-32 rounded-[2rem] overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '4px solid var(--text-primary)',
          boxShadow: '12px 12px 0px var(--text-primary)',
        }}>
        {/* Flat geometric background elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 border-4" style={{ borderColor: 'var(--pokedex-red)', transform: 'rotate(15deg)' }} />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-4" style={{ borderColor: 'var(--accent-secondary)', transform: 'rotate(-10deg)' }} />
          
          {/* Flat speed lines */}
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 80px, var(--border-color-bold) 80px, var(--border-color-bold) 84px)',
            opacity: 0.1
          }} />

          {/* Big pokéball watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full text-current">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
              <line x1="2" y1="50" x2="38" y2="50" stroke="currentColor" strokeWidth="3" />
              <line x1="62" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="3" />
              <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="50" cy="50" r="6" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black tracking-widest uppercase mb-8"
            style={{
              background: 'var(--bg-secondary)',
              border: '3px solid var(--text-primary)',
              boxShadow: '4px 4px 0px var(--text-primary)',
              color: 'var(--pokedex-red)',
            }}>
            YOUR POKÉMON JOURNEY STARTS HERE
          </div>

          <h1 className="text-6xl lg:text-8xl font-black font-display leading-[1.1] pb-2 drop-shadow-2xl">
            <span className="anime-heading block">PokéWiki</span>
          </h1>

          <p className="text-xl lg:text-2xl max-w-2xl mx-auto mt-6 leading-relaxed font-medium"
            style={{ color: 'var(--text-secondary)' }}>
            Your ultimate companion for every Pokémon adventure —
            explore the complete Pokédex, master type matchups, and build championship teams
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8 relative z-10 w-full max-w-2xl mx-auto px-4">
          <Link href="/pokemon" className="flex-1">
            <button className="auth-submit-btn auth-submit-btn-red text-xl py-5 rounded-2xl w-full shadow-2xl flex items-center justify-center gap-3">
              <span className="text-2xl drop-shadow-lg">📖</span>
              Open Pokédex
            </button>
          </Link>
          <Link href="/team-builder" className="flex-1">
            <button className="auth-submit-btn auth-submit-btn-blue text-xl py-5 rounded-2xl w-full shadow-2xl flex items-center justify-center gap-3">
              <span className="text-2xl drop-shadow-lg">⚔️</span>
              Build a Team
            </button>
          </Link>
        </div>
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
