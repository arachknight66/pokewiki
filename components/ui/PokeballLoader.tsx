/**
 * PokéBall Loading Spinner — Anime-styled loading screen
 */

'use client';

import Image from 'next/image';

export default function PokeballLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      {/* Pokéball SVG with animation */}
      <div className="relative w-24 h-24 animate-bounce-gentle">
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl animate-glow-pulse"
          style={{ background: 'rgba(var(--glow-color), 0.15)' }}
        />

        <Image
          src="/image.png"
          alt="Loading..."
          width={96}
          height={96}
          className="w-24 h-24 drop-shadow-xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.3))' }}
        />

        {/* Rotating sparkle ring */}
        <div className="absolute inset-[-12px] animate-spin-slow pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-glow-pulse" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400 animate-glow-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-pink-400 animate-glow-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p className="font-bold font-display text-lg animate-glow-pulse" style={{ color: 'var(--text-primary)' }}>
          {message}
        </p>
        <div className="flex gap-1 justify-center mt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce-gentle"
              style={{
                background: 'var(--accent-primary)',
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
