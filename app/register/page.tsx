/**
 * Register Page — Pokémon Anime-inspired
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();
 
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        confirmPassword,
      });
      
      if (response.data.success) {
        const { tokens } = response.data.data;
        localStorage.setItem('accessToken', tokens.accessToken);
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      console.error(err);
      const data = err.response?.data;
      if (data?.error?.code === 'VALIDATION_ERROR' && data.error.details) {
        // Flatten validation errors into a string
        const details = data.error.details;
        const firstError = Object.values(details)[0] as string[];
        setLocalError(firstError[0] || 'Validation failed');
      } else {
        setLocalError(data?.error?.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 stagger-children">
      <Card className="w-full max-w-md relative overflow-hidden pokedex-panel">
        {/* Background animation for register */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-[0.05] animate-float text-[var(--accent-secondary)]">
           <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black font-display mb-2">
            <span className="anime-heading text-4xl">Trainer License</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Start your new adventure today
          </p>
        </div>

        {localError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/20 text-red-500 text-xs font-bold">
             ⚡ {localError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Trainer Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🧢</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="eg. Red"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Email Contact
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@kanto.org"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Security Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🛡️</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Confirm Secret
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔒</span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat code"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <p className="text-[10px] leading-tight text-center opacity-60" style={{ color: 'var(--text-muted)' }}>
               Hint: Use at least one uppercase letter, one number, and one special character.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-[10px] leading-relaxed text-center" style={{ color: 'var(--text-muted)' }}>
               By registering, you agree to become a certified Pokémon Trainer and follow the League rules.
            </p>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-4 text-lg mt-4 shadow-xl anime-btn-secondary border-blue-700 hover:shadow-blue-500/30"
            size="lg"
          >
            Obtain Trainer License
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t-2 border-[var(--border-color)]">
           <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              Already have a license?{' '}
              <Link href="/login" className="text-[var(--accent-secondary)] font-black hover:underline">
                Portal Login
              </Link>
           </p>
        </div>
      </Card>
    </div>
  );
}
