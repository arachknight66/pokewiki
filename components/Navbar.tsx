'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks';

const NAV_LINKS = [
  { href: '/',             label: 'Home',         icon: '🏠' },
  { href: '/pokemon',      label: 'Pokédex',      icon: '📖' },
  { href: '/team-builder', label: 'Team Builder',  icon: '⚔️' },
  { href: '/teams',        label: 'My Teams',      icon: '🎒' },
  { href: '/forum',        label: 'Forum',         icon: '💬' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      {/* Pokédex red stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--pokedex-red), var(--accent-gold), var(--accent-secondary))' }} />

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Pokéball logo */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, var(--pokedex-red) 0%, var(--pokedex-red) 45%, #1a1a2e 45%, #1a1a2e 55%, var(--bg-card) 55%, var(--bg-card) 100%)',
                border: '2px solid #1a1a2e',
                boxShadow: '0 2px 10px rgba(var(--glow-color), 0.25)',
              }}>
              <div className="w-3 h-3 rounded-full border-2 border-[#1a1a2e] bg-white" />
            </div>
            <span className="text-lg font-black tracking-tight font-display">
              Poké<span style={{ color: 'var(--pokedex-red)' }}>Wiki</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, var(--pokedex-red), var(--pokedex-red-dark))',
                    border: '2px solid var(--pokedex-red-dark)',
                    boxShadow: '0 2px 10px rgba(var(--glow-color), 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                  } : undefined}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>{link.icon}</span>
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="w-px h-6 mx-2" style={{ background: 'var(--border-color-bold)' }} />

            {/* Auth Session */}
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Online</span>
                  <span className="text-xs font-bold leading-none">{user.username}</span>
                </div>
                <div className="group relative">
                  <button className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color-bold)] flex items-center justify-center text-xl hover:border-[var(--pokedex-red)] transition-all">
                    🧢
                  </button>
                  {/* Dropdown would go here */}
                </div>
                <button 
                  onClick={logout}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all active:scale-95"
                  title="Logout"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            ) : (
              <Link href="/login" className="ml-2">
                 <button className="anime-btn anime-btn-primary px-5 py-2 text-xs">
                    Start Journey
                 </button>
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ml-2"
              style={{
                background: 'var(--bg-card)',
                border: '2px solid var(--border-color-bold)',
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-amber-400">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-indigo-600">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-amber-400">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-indigo-600">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)' }}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {mobileOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1.5 pt-3 animate-slide-down">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, var(--pokedex-red), var(--pokedex-red-dark))',
                    color: 'white',
                    border: '2px solid var(--pokedex-red-dark)',
                  } : {
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border-color)',
                  }}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
