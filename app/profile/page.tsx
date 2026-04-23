'use client';

import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-black font-display animate-pulse">Loading Trainer Data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 stagger-children">
      {/* Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-black font-display">
          <span className="anime-heading">Trainer Profile</span>
        </h1>
        <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
          Manage your Trainer Card and activity
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Trainer Card */}
        <div className="md:col-span-1 space-y-6">
          <div 
            className="pokedex-panel rounded-[1.5rem] relative overflow-hidden"
            style={{ 
              background: 'var(--bg-card)', 
              border: '4px solid var(--text-primary)', 
              boxShadow: '8px 8px 0px var(--text-primary)' 
            }}
          >
            {/* Flat geometric background */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-white/5 dark:bg-black/10">
              <div className="absolute top-0 right-0 w-32 h-32 border-4" style={{ borderColor: 'var(--pokedex-red)', transform: 'rotate(15deg)', opacity: 0.2 }} />
              <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'var(--text-primary)', opacity: 0.05 }} />
            </div>

            <div className="relative z-10 p-6 flex flex-col items-center text-center">
              {/* Profile Image (AI Generated) */}
              <div className="relative w-32 h-32 mb-4 group cursor-pointer transition-transform hover:-translate-y-1">
                <div className="absolute inset-0 border-4 border-[var(--text-primary)] rounded-[1rem] bg-[var(--bg-secondary)] overflow-hidden" style={{ boxShadow: '4px 4px 0px var(--text-primary)' }}>
                  <Image 
                    src={user.avatarUrl || '/trainer-avatar.png'} 
                    alt="Trainer Avatar"
                    fill
                    sizes="(max-width: 128px) 100vw, 128px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <h2 className="text-2xl font-black font-display mb-1">{user.username}</h2>
              
              <div className="w-full mt-6 space-y-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[var(--border-color)]">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)]">Status</span>
                  <span className="text-sm font-bold text-[#10b981]">Active Trainer</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[var(--border-color)]">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)]">Joined</span>
                  <span className="text-sm font-bold">{user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)]">ID No.</span>
                  <span className="text-sm font-bold font-mono text-[var(--accent-secondary)]">{user.id.split('-')[0].toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content Links */}
        <div className="md:col-span-2 space-y-6">
          
          <h2 className="text-2xl font-black font-display flex items-center gap-3">
             <span style={{ color: 'var(--pokedex-red)' }}>⬣</span> Dashboard Hub
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Quick Link - My Teams */}
            <Link href="/teams" className="block group">
              <div className="p-6 rounded-[1.5rem] transition-all duration-300 min-h-[140px] flex flex-col justify-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '4px solid var(--text-primary)',
                  boxShadow: '6px 6px 0px var(--text-primary)',
                }}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 flex items-center justify-center text-2xl border-2 border-[var(--text-primary)] rounded-xl" style={{ background: 'var(--accent-secondary)', color: 'white', boxShadow: '2px 2px 0px var(--text-primary)' }}>
                    🎒
                  </div>
                  <h3 className="text-xl font-black group-hover:text-[var(--accent-secondary)] transition-colors">My Teams</h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your competitive Pokémon party loadouts.</p>
              </div>
            </Link>

            {/* Quick Link - Forum */}
            <Link href="/forum" className="block group">
              <div className="p-6 rounded-[1.5rem] transition-all duration-300 min-h-[140px] flex flex-col justify-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '4px solid var(--text-primary)',
                  boxShadow: '6px 6px 0px var(--text-primary)',
                }}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 flex items-center justify-center text-2xl border-2 border-[var(--text-primary)] rounded-xl" style={{ background: 'var(--accent-gold)', color: 'white', boxShadow: '2px 2px 0px var(--text-primary)' }}>
                    💬
                  </div>
                  <h3 className="text-xl font-black group-hover:text-[var(--accent-gold)] transition-colors">Forum</h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Join discussions, share strategies and connect.</p>
              </div>
            </Link>

          </div>

          <div className="p-6 rounded-[1.5rem] mt-6 flex flex-wrap gap-4 items-center justify-between"
             style={{
               background: 'var(--bg-secondary)',
               border: '4px solid var(--text-primary)',
               boxShadow: '6px 6px 0px var(--text-primary)',
             }}>
             <div>
               <h3 className="text-lg font-black mb-1">Account Actions</h3>
               <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Registered Email: {user.email}</p>
             </div>
             <button className="px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:-translate-y-1"
                style={{ background: 'var(--bg-card)', border: '2px solid var(--text-primary)', boxShadow: '2px 2px 0px var(--text-primary)' }}>
               Edit Settings
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
