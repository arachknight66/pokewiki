/**
 * Login Page — Pokémon Anime-inspired
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

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
    <div className="min-h-[70vh] flex items-center justify-center p-4 stagger-children">
      <Card className="w-full max-w-md relative overflow-hidden pokedex-panel">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <svg width="60" height="60" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"/>
             <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="8"/>
             <circle cx="50" cy="50" r="15" fill="white" stroke="currentColor" strokeWidth="8"/>
           </svg>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black font-display mb-2">
            <span className="anime-heading text-4xl">Trainer Login</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Resume your journey through the world of Pokémon
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/20 text-red-500 text-xs font-bold">
             ⚡ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ash.ketchum@kanto.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
              Secret Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔑</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
             <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-2 border-[var(--border-color-bold)] bg-transparent checked:bg-[var(--pokedex-red)] transition-all" />
                <span className="text-[11px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">Remember Me</span>
             </label>
             <button type="button" className="text-[11px] font-black text-[var(--pokedex-red)] hover:underline">
                Lost your badge?
             </button>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-4 text-lg mt-4 shadow-xl"
            size="lg"
          >
            Sign Into Pokédex
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t-2 border-[var(--border-color)]">
           <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              New to the region?{' '}
              <Link href="/register" className="text-[var(--pokedex-red)] font-black hover:underline">
                Register as a Trainer
              </Link>
           </p>
        </div>
      </Card>
    </div>
  );
}
