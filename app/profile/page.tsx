'use client';

import { useAuth, useProfileStats } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Trophy, 
  MessageSquare, 
  Package, 
  Settings, 
  User, 
  Calendar, 
  Hash, 
  Activity,
  FileText,
  MessageCircle,
  Plus
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: statsData, isLoading: statsLoading } = useProfileStats();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-black font-display animate-pulse">Loading Trainer Data...</div>
      </div>
    );
  }

  const stats = statsData?.stats || { teams: 0, threads: 0, replies: 0, submissions: 0 };
  const submissions = statsData?.submissions || [];

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
                    src="/profile.png" 
                    alt="Trainer Avatar"
                    fill
                    sizes="(max-width: 128px) 100vw, 128px"
                    className="object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-black font-display mb-1">{user.username}</h2>
              
              <div className="w-full mt-6 space-y-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[var(--border-color)]">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
                    <Activity size={12} /> Status
                  </span>
                  <span className="text-sm font-bold text-[#10b981]">Active Trainer</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[var(--border-color)]">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
                    <Calendar size={12} /> Joined
                  </span>
                  <span className="text-sm font-bold">
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
                    <Hash size={12} /> ID No.
                  </span>
                  <span className="text-sm font-bold font-mono text-[var(--accent-secondary)]">
                    {user.id.split('-')[0].toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content Links */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-black font-display flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[var(--pokedex-red)] inline-block" /> Dashboard Hub
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Quick Link - My Teams */}
            <Link href="/teams" className="block group">
              <div className="p-5 rounded-[1.2rem] transition-all duration-300 min-h-[120px] flex flex-col justify-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '3px solid var(--text-primary)',
                  boxShadow: '4px 4px 0px var(--text-primary)',
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-[var(--text-primary)] rounded-xl" style={{ background: 'var(--accent-secondary)', color: 'white', boxShadow: '2px 2px 0px var(--text-primary)' }}>
                    <Package size={20} />
                  </div>
                  <h3 className="text-lg font-black group-hover:text-[var(--accent-secondary)] transition-colors">My Teams</h3>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Manage your competitive Pokémon loadouts.</p>
              </div>
            </Link>

            {/* Quick Link - Forum */}
            <Link href="/forum" className="block group">
              <div className="p-5 rounded-[1.2rem] transition-all duration-300 min-h-[120px] flex flex-col justify-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '3px solid var(--text-primary)',
                  boxShadow: '4px 4px 0px var(--text-primary)',
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-[var(--text-primary)] rounded-xl" style={{ background: 'var(--accent-gold)', color: 'white', boxShadow: '2px 2px 0px var(--text-primary)' }}>
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-lg font-black group-hover:text-[var(--accent-gold)] transition-colors">Forum</h3>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Join discussions and share strategies.</p>
              </div>
            </Link>

            {/* Quick Link - Tournaments */}
            <Link href={"/tournaments" as any} className="block group">
              <div className="p-5 rounded-[1.2rem] transition-all duration-300 min-h-[120px] flex flex-col justify-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '3px solid var(--text-primary)',
                  boxShadow: '4px 4px 0px var(--text-primary)',
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-[var(--text-primary)] rounded-xl bg-gradient-to-br from-[var(--pokedex-red)] to-[var(--accent-gold)]" style={{ color: 'white', boxShadow: '2px 2px 0px var(--text-primary)' }}>
                    <Trophy size={20} />
                  </div>
                  <h3 className="text-lg font-black group-hover:text-[var(--pokedex-red)] transition-colors">Tournaments</h3>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Register your squads and claim glory.</p>
              </div>
            </Link>
          </div>

          {/* Activity Stats Pass */}
          <div className="space-y-4">
            <h3 className="text-lg font-black font-display flex items-center gap-2">
              <Activity size={18} className="text-[var(--accent-secondary)]" /> Trainer Statistics
            </h3>
            
            {statsLoading ? (
              <div className="grid grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-20 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-black font-mono text-[var(--accent-secondary)]">{stats.teams}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mt-1">Teams Built</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-black font-mono text-[var(--accent-gold)]">{stats.threads}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mt-1">Threads Started</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-black font-mono text-[#10b981]">{stats.replies}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mt-1">Forum Replies</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-black font-mono text-[var(--pokedex-red)]">{stats.submissions}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mt-1">Tourney Entries</div>
                </Card>
              </div>
            )}
          </div>

          {/* Account Actions Bar */}
          <div className="p-6 rounded-[1.5rem] mt-6 flex flex-wrap gap-4 items-center justify-between"
             style={{
               background: 'var(--bg-secondary)',
               border: '4px solid var(--text-primary)',
               boxShadow: '6px 6px 0px var(--text-primary)',
             }}>
             <div>
               <h3 className="text-lg font-black mb-1">Account Actions</h3>
               <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Registered Email: {user.email}</p>
             </div>
             <button 
               className="px-5 py-2.5 rounded-xl text-xs font-black transition-all hover:-translate-y-1 flex items-center gap-1.5"
               style={{ background: 'var(--bg-card)', border: '2px solid var(--text-primary)', boxShadow: '2px 2px 0px var(--text-primary)' }}
               aria-label="Edit account settings"
             >
               <Settings size={14} /> Edit Settings
             </button>
          </div>
        </div>
      </div>

      {/* Tournament Entries History Table */}
      <Card className="p-6">
        <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-[var(--accent-gold)]" /> Tournament History & Standings
        </h2>

        {statsLoading ? (
          <div className="animate-pulse h-24 bg-[var(--bg-secondary)] rounded-xl" />
        ) : submissions.length > 0 ? (
          <div className="overflow-x-auto border-2 border-[var(--text-primary)] rounded-xl bg-[var(--bg-secondary)] text-xs font-bold">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-[var(--text-primary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-black uppercase">
                  <th className="p-3">Tournament</th>
                  <th className="p-3">Squad Name</th>
                  <th className="p-3 text-center">Format</th>
                  <th className="p-3 text-center">Record</th>
                  <th className="p-3 text-center">ELO Rating</th>
                  <th className="p-3 text-center">Date Joined</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-black">
                      <Link href={`/tournaments/${sub.tournamentId}` as any} className="hover:underline flex items-center gap-1">
                        {sub.tournamentName}
                      </Link>
                    </td>
                    <td className="p-3 text-[var(--text-secondary)]">{sub.teamName}</td>
                    <td className="p-3 text-center uppercase">{sub.tournamentFormat}</td>
                    <td className="p-3 text-center font-mono">{sub.wins} - {sub.losses}</td>
                    <td className="p-3 text-center font-mono font-black text-[var(--accent-secondary)]">{sub.elo}</td>
                    <td className="p-3 text-center font-semibold text-[var(--text-muted)]">
                      {format(new Date(sub.submittedAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-[var(--border-color-bold)] rounded-xl bg-[var(--bg-secondary)]">
            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
              No tournament records found. Join your first match inside the Tournaments Lobby!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
