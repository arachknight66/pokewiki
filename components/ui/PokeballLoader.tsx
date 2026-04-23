/**
 * PokéBall Loading Spinner — Anime-styled loading screen
 */

'use client';

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

        <svg
          viewBox="0 0 100 100"
          className="w-24 h-24 drop-shadow-xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.3))' }}
        >
          {/* Top half — red */}
          <path
            d="M 50 5 A 45 45 0 0 1 95 50 L 62 50 A 12 12 0 0 0 38 50 L 5 50 A 45 45 0 0 1 50 5 Z"
            fill="#EF4444"
            stroke="#1a1a2e"
            strokeWidth="3"
          >
            <animate
              attributeName="fill"
              values="#EF4444;#F87171;#EF4444"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>

          {/* Bottom half — white/cream */}
          <path
            d="M 50 95 A 45 45 0 0 1 5 50 L 38 50 A 12 12 0 0 0 62 50 L 95 50 A 45 45 0 0 1 50 95 Z"
            fill="var(--bg-card, #f5f5f5)"
            stroke="#1a1a2e"
            strokeWidth="3"
          />

          {/* Center line */}
          <line
            x1="5" y1="50" x2="38" y2="50"
            stroke="#1a1a2e"
            strokeWidth="3"
          />
          <line
            x1="62" y1="50" x2="95" y2="50"
            stroke="#1a1a2e"
            strokeWidth="3"
          />

          {/* Center button — outer ring */}
          <circle
            cx="50" cy="50" r="12"
            fill="var(--bg-card, #f5f5f5)"
            stroke="#1a1a2e"
            strokeWidth="3"
          />

          {/* Center button — inner circle with glow */}
          <circle cx="50" cy="50" r="6" fill="#1a1a2e">
            <animate
              attributeName="r"
              values="6;7;6"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Shine effect */}
          <ellipse
            cx="36" cy="28"
            rx="8" ry="5"
            fill="white"
            opacity="0.3"
            transform="rotate(-30 36 28)"
          >
            <animate
              attributeName="opacity"
              values="0.3;0.5;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Outer border */}
          <circle
            cx="50" cy="50" r="46.5"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="3"
          />
        </svg>

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
