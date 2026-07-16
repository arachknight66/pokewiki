'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks';
import { 
  Home, 
  BookOpen, 
  Swords, 
  Grid3x3, 
  Gem, 
  GitCompare, 
  MessageSquare, 
  Trophy,
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/',             label: 'Home',         icon: Home },
  { href: '/pokemon',      label: 'Pokédex',      icon: BookOpen },
  { href: '/team-builder', label: 'Team Builder',  icon: Swords },
  { href: '/type-chart',   label: 'Type Chart',    icon: Grid3x3 },
  { href: '/items',        label: 'Items',         icon: Gem },
  { href: '/compare',      label: 'Compare',       icon: GitCompare },
  { href: '/forum',        label: 'Forum',         icon: MessageSquare },
  { href: '/tournaments',  label: 'Tournaments',   icon: Trophy },
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
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="PokeWiki Home">
            {/* Pokéball logo */}
            <div className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 overflow-hidden">
              <Image 
                src="/image.png" 
                alt="" 
                width={40} 
                height={40} 
                className="w-full h-full object-contain"
                aria-hidden="true"
              />
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
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={`relative px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 ${
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
                    <Icon size={15} aria-hidden="true" />
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
                  <Link href="/profile" aria-label="Trainer Profile">
                    <button className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color-bold)] flex items-center justify-center hover:border-[var(--pokedex-red)] transition-all cursor-pointer overflow-hidden p-0">
                      <Image 
                        src="/profile.png" 
                        alt="" 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-cover"
                        aria-hidden="true"
                      />
                    </button>
                  </Link>
                </div>
                <button 
                  onClick={logout}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all active:scale-95"
                  title="Logout"
                  aria-label="Log out of Trainer Card session"
                >
                  <LogOut size={18} aria-hidden="true" />
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
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ml-2 cursor-pointer"
              style={{
                background: 'var(--bg-card)',
                border: '2px solid var(--border-color-bold)',
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400" aria-hidden="true" />
              ) : (
                <Moon size={18} className="text-indigo-600" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-amber-400" aria-hidden="true" />
              ) : (
                <Moon size={16} className="text-indigo-600" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)' }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
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
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
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
                  <Icon size={16} aria-hidden="true" />
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
