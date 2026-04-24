/**
 * Register Page — Pokémon Anime Cinematic Experience
 * Full-screen animated scene with floating Pokéballs, plasma orbs,
 * electric particles, password strength meter, and energy-glow inputs.
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

/* ── Inline SVG Pokéball ─────────────────────────────────────────────── */
function PokeballSVG({ className }: { className?: string }) {
  return (
    <Image 
      src="/image.png" 
      alt="Pokeball" 
      width={100} 
      height={100} 
      className={className} 
    />
  );
}

/* ── Password Strength ───────────────────────────────────────────────── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[!@#$%^&*]/.test(pw)) s++;

  const labels = ['', 'Weak', 'Fair', 'Strong', 'Ultra 💎'];
  const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#6366F1'];
  return { score: s, label: labels[s] || '', color: colors[s] || '' };
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

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
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      console.error(err);
      const data = err.response?.data;
      if (data?.error?.code === 'VALIDATION_ERROR' && data.error.details) {
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
    <div className="auth-scene">
      {/* ── Animated background elements ────────────────────────── */}
      <div className="plasma-orb plasma-orb-red" style={{ top: '25%', left: '70%' }} />
      <div className="plasma-orb plasma-orb-blue" style={{ bottom: '10%', left: '5%' }} />
      <div className="plasma-orb plasma-orb-gold" style={{ top: '10%', left: '20%' }} />

      {/* Spinning Pokéballs */}
      <div className="auth-pokeball auth-pokeball-1" style={{ color: 'var(--accent-secondary)' }}>
        <PokeballSVG />
      </div>
      <div className="auth-pokeball auth-pokeball-2" style={{ color: 'var(--pokedex-red)' }}>
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
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="text-center mb-7">
          {/* Animated star / badge icon */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--accent-secondary)',
              border: '3px solid var(--text-primary)',
              boxShadow: '4px 4px 0px var(--text-primary)',
              animation: 'bounceGentle 3s ease-in-out infinite',
            }}>
            <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,1))' }}>⭐</span>
          </div>
          <h1 className="auth-title mb-2" style={{ fontSize: '2.25rem' }}>Trainer License</h1>
          <p className="auth-subtitle">Begin your new adventure today</p>
        </div>

        {/* Error banner */}
        {localError && (
          <div className="auth-error mb-5">
            <span className="error-icon">⚡</span>
            {localError}
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────── */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <div className="auth-input-group">
            <label className="auth-label">Trainer Name</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🧢</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="eg. Red"
                className="auth-input"
                id="register-username"
              />
              <div className="auth-input-glow" />
            </div>
          </div>

          {/* Email */}
          <div className="auth-input-group" style={{ animationDelay: '0.25s' }}>
            <label className="auth-label">Email Contact</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@kanto.org"
                className="auth-input"
                id="register-email"
              />
              <div className="auth-input-glow" />
            </div>
          </div>

          {/* Password */}
          <div className="auth-input-group" style={{ animationDelay: '0.35s' }}>
            <label className="auth-label">Security Password</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🛡️</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="auth-input"
                style={{ paddingRight: '3rem' }}
                id="register-password"
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

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="password-strength">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`password-strength-bar ${strength.score >= level ? 'active' : ''}`}
                      style={{
                        background: strength.score >= level ? strength.color : undefined,
                        transition: 'all 0.4s ease',
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-bold mt-1 transition-all" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-input-group" style={{ animationDelay: '0.45s' }}>
            <label className="auth-label">Confirm Secret</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="auth-input"
                style={{
                  borderColor: !passwordsMatch ? '#EF4444' : undefined,
                  boxShadow: !passwordsMatch ? '0 0 0 3px rgba(239,68,68,0.1)' : undefined,
                }}
                id="register-confirm-password"
              />
              <div className="auth-input-glow" />
              {confirmPassword.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base transition-all z-10">
                  {passwordsMatch ? '✅' : '❌'}
                </span>
              )}
            </div>
          </div>

          {/* Hints */}
          <div className="auth-input-group" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {[
                { label: '8+ chars', met: password.length >= 8 },
                { label: 'Uppercase', met: /[A-Z]/.test(password) },
                { label: 'Number', met: /\d/.test(password) },
                { label: 'Special', met: /[!@#$%^&*]/.test(password) },
              ].map((req) => (
                <span
                  key={req.label}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all duration-300"
                  style={{
                    borderColor: req.met ? '#10B981' : 'var(--border-color)',
                    color: req.met ? '#10B981' : 'var(--text-muted)',
                    background: req.met ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  }}
                >
                  {req.met ? '✓' : '○'} {req.label}
                </span>
              ))}
            </div>
          </div>

          {/* Terms */}
          <p className="text-[10px] leading-relaxed text-center opacity-50" style={{ color: 'var(--text-muted)' }}>
            By registering, you agree to become a certified Pokémon Trainer and follow the League rules.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn auth-submit-btn-blue disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            id="register-submit"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                Creating License...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span style={{ fontSize: '1.2rem' }}>⭐</span>
                Obtain Trainer License
              </span>
            )}
          </button>
        </form>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="auth-divider">
          <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            Already have a license?{' '}
            <Link
              href="/login"
              className="font-black transition-all hover:brightness-125"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Portal Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
