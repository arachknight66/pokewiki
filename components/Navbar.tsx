'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
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
  X,
  ChevronDown
} from 'lucide-react';

const EXPLORE_LINKS = [
  { href: '/pokemon',      label: 'Pokédex',      icon: BookOpen },
  { href: '/type-chart',   label: 'Type Chart',    icon: Grid3x3 },
  { href: '/items',        label: 'Items',         icon: Gem },
  { href: '/compare',      label: 'Compare',       icon: GitCompare },
];

const COMMUNITY_LINKS = [
  { href: '/forum',        label: 'Forum',         icon: MessageSquare },
  { href: '/tournaments',  label: 'Tournaments',   icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const exploreTriggerRef = useRef<HTMLButtonElement>(null);
  const communityTriggerRef = useRef<HTMLButtonElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
      if (communityRef.current && !communityRef.current.contains(event.target as Node)) {
        setCommunityOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (exploreOpen) {
          setExploreOpen(false);
          exploreTriggerRef.current?.focus();
        }
        if (communityOpen) {
          setCommunityOpen(false);
          communityTriggerRef.current?.focus();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [exploreOpen, communityOpen]);

  // Check active states
  const isHomeActive = pathname === '/';
  const isTeamBuilderActive = pathname.startsWith('/team-builder');
  const isExploreActive = EXPLORE_LINKS.some(link => pathname.startsWith(link.href));
  const isCommunityActive = COMMUNITY_LINKS.some(link => pathname.startsWith(link.href));

  const activeStyle = {
    background: 'linear-gradient(135deg, var(--pokedex-red), var(--pokedex-red-dark))',
    border: '2px solid var(--pokedex-red-dark)',
    boxShadow: '0 2px 10px rgba(var(--glow-color), 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
  };

  return (
    <nav className="sticky top-0 z-nav glass-nav">
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
            {/* Home link */}
            <Link
              href="/"
              className={`relative px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 ${
                isHomeActive
                  ? 'text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={isHomeActive ? activeStyle : undefined}
            >
              <span className="relative z-content flex items-center gap-1.5">
                <Home size={15} aria-hidden="true" />
                Home
              </span>
            </Link>

            {/* Team Builder link */}
            <Link
              href="/team-builder"
              className={`relative px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 ${
                isTeamBuilderActive
                  ? 'text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={isTeamBuilderActive ? activeStyle : undefined}
            >
              <span className="relative z-content flex items-center gap-1.5">
                <Swords size={15} aria-hidden="true" />
                Team Builder
              </span>
            </Link>

            {/* Explore Dropdown */}
            <div ref={exploreRef} className="relative">
              <button
                ref={exploreTriggerRef}
                onClick={() => { setExploreOpen(!exploreOpen); setCommunityOpen(false); }}
                aria-haspopup="true"
                aria-expanded={exploreOpen}
                className={`relative px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isExploreActive
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={isExploreActive ? activeStyle : undefined}
              >
                <span className="relative z-content flex items-center gap-1.5">
                  <BookOpen size={15} aria-hidden="true" />
                  Explore
                  <ChevronDown size={14} className={`transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </span>
              </button>

              {exploreOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 rounded-xl border-3 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] bg-[var(--bg-card)] p-1.5 z-dropdown flex flex-col gap-0.5"
                  role="menu"
                >
                  {EXPLORE_LINKS.map((link) => {
                    const isSubActive = pathname.startsWith(link.href);
                    const SubIcon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href as any}
                        onClick={() => setExploreOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          isSubActive
                            ? 'bg-[var(--bg-secondary)] text-[var(--pokedex-red)] border-l-4 border-[var(--pokedex-red)] pl-2'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                        role="menuitem"
                      >
                        <SubIcon size={14} aria-hidden="true" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Community Dropdown */}
            <div ref={communityRef} className="relative">
              <button
                ref={communityTriggerRef}
                onClick={() => { setCommunityOpen(!communityOpen); setExploreOpen(false); }}
                aria-haspopup="true"
                aria-expanded={communityOpen}
                className={`relative px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isCommunityActive
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={isCommunityActive ? activeStyle : undefined}
              >
                <span className="relative z-content flex items-center gap-1.5">
                  <MessageSquare size={15} aria-hidden="true" />
                  Community
                  <ChevronDown size={14} className={`transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </span>
              </button>

              {communityOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 rounded-xl border-3 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] bg-[var(--bg-card)] p-1.5 z-dropdown flex flex-col gap-0.5"
                  role="menu"
                >
                  {COMMUNITY_LINKS.map((link) => {
                    const isSubActive = pathname.startsWith(link.href);
                    const SubIcon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href as any}
                        onClick={() => setCommunityOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          isSubActive
                            ? 'bg-[var(--bg-secondary)] text-[var(--pokedex-red)] border-l-4 border-[var(--pokedex-red)] pl-2'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                        role="menuitem"
                      >
                        <SubIcon size={14} aria-hidden="true" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

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
          <div className="md:hidden pb-4 space-y-3 pt-3 animate-slide-down">
            {/* Primary flat items */}
            <div className="space-y-1.5">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={isHomeActive ? {
                  background: 'linear-gradient(135deg, var(--pokedex-red), var(--pokedex-red-dark))',
                  color: 'white',
                  border: '2px solid var(--pokedex-red-dark)',
                } : {
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color)',
                }}
              >
                <Home size={16} aria-hidden="true" />
                Home
              </Link>

              <Link
                href="/team-builder"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={isTeamBuilderActive ? {
                  background: 'linear-gradient(135deg, var(--pokedex-red), var(--pokedex-red-dark))',
                  color: 'white',
                  border: '2px solid var(--pokedex-red-dark)',
                } : {
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color)',
                }}
              >
                <Swords size={16} aria-hidden="true" />
                Team Builder
              </Link>
            </div>

            {/* Explore Section */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-4">
                Explore
              </div>
              {EXPLORE_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
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

            {/* Community Section */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-4">
                Community
              </div>
              {COMMUNITY_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
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

            {/* Mobile Auth Session */}
            {user ? (
              <div className="border-t border-[var(--border-color)] pt-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color-bold)] flex items-center justify-center overflow-hidden p-0">
                    <Image 
                      src="/profile.png" 
                      alt="" 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#10b981] block">Online</span>
                    <span className="text-xs font-bold leading-none">{user.username}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500 font-bold text-xs"
                >
                  <LogOut size={14} aria-hidden="true" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-[var(--border-color)] pt-3 px-4">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full">
                  <button className="anime-btn anime-btn-primary w-full py-2.5 text-xs">
                    Start Journey
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
