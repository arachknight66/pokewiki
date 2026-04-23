/**
 * Login Page — Pokémon Anime Cinematic Experience
 * Full-screen animated scene with floating Pokéballs, plasma orbs,
 * electric particles, energy-glow inputs, and shimmer effects.
 */

'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

/* ── Inline SVG Pokéball ─────────────────────────────────────────────── */
function PokeballSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="5" />
      <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="5" />
      <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/* ── Login Form (uses useSearchParams, must be inside Suspense) ────── */
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-scene">
      {/* ── Animated background elements ────────────────────────── */}
      <div className="plasma-orb plasma-orb-red" />
      <div className="plasma-orb plasma-orb-blue" />
      <div className="plasma-orb plasma-orb-gold" />

      {/* Spinning Pokéballs */}
      <div className="auth-pokeball auth-pokeball-1" style={{ color: 'var(--pokedex-red)' }}>
        <PokeballSVG />
      </div>
      <div className="auth-pokeball auth-pokeball-2" style={{ color: 'var(--accent-secondary)' }}>
        <PokeballSVG />
      </div>
      <div className="auth-pokeball auth-pokeball-3" style={{ color: 'var(--accent-gold)' }}>
        <PokeballSVG />
      </div>

      {/* Electric particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="electric-particle" />
      ))}

      {/* ── Main Card ───────────────────────────────────────────── */}
      <div className="auth-card">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Animated Pokéball icon */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, var(--pokedex-red) 0%, var(--pokedex-red) 45%, var(--text-primary) 45%, var(--text-primary) 55%, var(--bg-card) 55%)',
              border: '3px solid var(--text-primary)',
              boxShadow: '4px 4px 0px var(--text-primary)',
              animation: 'bounceGentle 3s ease-in-out infinite',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
            <div className="w-4 h-4 rounded-full border-2 border-[var(--text-primary)] bg-white" />
          </div>
          <h1 className="auth-title mb-2">Trainer Login</h1>
          <p className="auth-subtitle">Resume your journey through the world of Pokémon</p>
        </div>

        {/* Success banner (after registration) */}
        {justRegistered && (
          <div className="auth-success mb-6">
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            Registration complete! Sign in with your new credentials.
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="auth-error mb-6">
            <span className="error-icon">⚡</span>
            {error}
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ash.ketchum@kanto.com"
                className="auth-input"
                id="login-email"
              />
              <div className="auth-input-glow" />
            </div>
          </div>

          {/* Password */}
          <div className="auth-input-group" style={{ animationDelay: '0.25s' }}>
            <label className="auth-label">Secret Password</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔑</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                style={{ paddingRight: '3rem' }}
                id="login-password"
              />
              <div className="auth-input-glow" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-40 hover:opacity-100 transition-opacity z-10"
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between auth-input-group" style={{ animationDelay: '0.35s' }}>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-2 border-[var(--border-color-bold)] bg-transparent accent-[var(--pokedex-red)] transition-all"
              />
              <span className="text-[11px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                Remember Me
              </span>
            </label>
            <button type="button" className="text-[11px] font-black text-[var(--pokedex-red)] hover:underline transition-all hover:brightness-125">
              Lost your badge?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn auth-submit-btn-red disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            id="login-submit"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                Authenticating...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                Sign Into Pokédex
              </span>
            )}
          </button>
        </form>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="auth-divider">
          <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            New to the region?{' '}
            <Link
              href="/register"
              className="font-black transition-all hover:brightness-125"
              style={{ color: 'var(--pokedex-red)' }}
            >
              Register as a Trainer →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Page Export (wraps LoginForm in Suspense) ────────────────────────── */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="auth-scene">
        <div className="auth-card">
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-[var(--pokedex-red)] border-t-transparent rounded-full spinner mx-auto mb-4" />
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
