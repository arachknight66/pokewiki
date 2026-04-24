/**
 * Homepage — Polished anime-inspired landing
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const FEATURES = [
  {
    label: 'Pokédex',
    detail: '1000+ Pokémon catalogued with stats, abilities & sprites',
    icon: '📖',
    href: '/pokemon',
    color: 'var(--pokedex-red)',
  },
  {
    label: 'Team Builder',
    detail: 'Craft the perfect squad & analyze type coverage',
    icon: '⚔️',
    href: '/team-builder',
    color: 'var(--accent-secondary)',
  },
  {
    label: 'Forum',
    detail: 'Discuss strategies, share discoveries & connect',
    icon: '💬',
    href: '/forum',
    color: 'var(--accent-gold)',
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]"
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease' }}
    >
      {/* Hero */}
      <section className="w-full max-w-3xl mx-auto text-center space-y-10 py-12 lg:py-20">

        {/* Pokéball mark — animated */}
        <div
          className="mx-auto w-20 h-20 lg:w-24 lg:h-24"
          style={{
            animation: 'heroPokeballIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards, pokeballHover 4s ease-in-out 1.2s infinite',
            opacity: 0,
          }}
        >
          <Image
            src="/image.png"
            alt="Pokeball"
            width={96}
            height={96}
            className="w-full h-full"
          />
        </div>

        {/* Title */}
        <div
          style={{
            animation: 'heroTitleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
            opacity: 0,
          }}
        >
          <h1 className="text-7xl lg:text-9xl font-black font-display leading-none tracking-tight">
            Poké<span className="hero-title-accent">Wiki</span>
          </h1>
          <p
            className="mt-6 text-lg lg:text-xl max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Explore every Pokémon. Build your dream team.
            <br />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>Your journey starts here.</span>
          </p>
        </div>

        {/* Primary Actions */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
          style={{
            animation: 'heroActionsIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards',
            opacity: 0,
          }}
        >
          <Link href="/pokemon" className="flex-1">
            <button
              className="hero-btn hero-btn-primary w-full px-8 py-4 text-sm font-black uppercase tracking-widest"
            >
              <span className="hero-btn-content">
                <Image
                  src="/image.png"
                  alt="Pokeball"
                  width={16}
                  height={16}
                  style={{ opacity: 0.7 }}
                />
                Open Pokédex
              </span>
            </button>
          </Link>
          <Link href="/team-builder" className="flex-1">
            <button
              className="hero-btn hero-btn-secondary w-full px-8 py-4 text-sm font-black uppercase tracking-widest"
            >
              <span className="hero-btn-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5Z" />
                </svg>
                Build a Team
              </span>
            </button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section
        className="w-full max-w-3xl mx-auto mt-4 mb-8"
        style={{
          animation: 'heroFeaturesIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.65s forwards',
          opacity: 0,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((item) => (
            <Link key={item.label} href={item.href as any}>
              <div className="hero-feature-card group">
                {/* Color accent stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-all duration-300 group-hover:h-1.5"
                  style={{ background: item.color }}
                />
                <span className="text-3xl block mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  {item.icon}
                </span>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em] block"
                  style={{ color: item.color }}
                >
                  {item.label}
                </span>
                <span
                  className="text-xs block mt-2 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.detail}
                </span>
                {/* Arrow indicator */}
                <span
                  className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-70 group-hover:translate-y-0"
                  style={{ color: item.color }}
                >
                  Explore
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
