/**
 * UI Components - BackToTop — Floating Pokéball button
 */

'use client';

import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-[60] w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none animate-in fade-in slide-in-from-bottom-10"
      style={{
        background: 'linear-gradient(180deg, var(--pokedex-red) 0%, var(--pokedex-red) 45%, #1a1a2e 45%, #1a1a2e 55%, #ffffff 55%, #ffffff 100%)',
        border: '3px solid #1a1a2e',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}
      title="Back to top"
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-3 border-[#1a1a2e] bg-white group-hover:bg-amber-400 transition-colors" />
      <div className="absolute -top-1 right-2 text-xs font-black text-white group-hover:-translate-y-1 transition-transform">TOP</div>
    </button>
  );
}
