/**
 * My Teams Page — Browse your saved Pokémon teams
 */

'use client';

import { useTeams, useAuth } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import PokeballLoader from '@/components/ui/PokeballLoader';
import { Team } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

export default function TeamsPage() {
  const { user } = useAuth();
  const { data: teamsData, isLoading } = useTeams({ pageSize: 12 });

  if (isLoading) return <PokeballLoader message="Retrieving your teams..." />;

  const teams = teamsData?.data || [];

  return (
    <div className="space-y-8 stagger-children">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-display">
            <span className="anime-heading">My Teams</span>
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            Your calculated parties and strategic lineups
          </p>
        </div>
        <Link href="/team-builder">
          <Button size="lg">⚔️ Build New Team</Button>
        </Link>
      </div>

      {!user ? (
        <Card className="text-center py-16">
          <div className="text-5xl mb-4 grayscale opacity-30">🔐</div>
          <h2 className="text-2xl font-black font-display mb-2">Login Required</h2>
          <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
            Sign in to view your saved teams and build new ones with real-time analysis.
          </p>
          <div className="flex justify-center gap-3">
             <Button variant="primary">Login</Button>
             <Button variant="secondary">Register</Button>
          </div>
        </Card>
      ) : teams.length === 0 ? (
        <Card className="text-center py-20">
          <div className="text-6xl mb-6 opacity-20">🎒</div>
          <h2 className="text-2xl font-black font-display mb-2">No Teams Found</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            You haven&apos;t built any championship teams yet. Start your journey in the Team Builder!
          </p>
          <Link href="/team-builder">
            <Button size="lg">Get Started</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: Team) => (
            <Link key={team.id} href={`/team-builder/${team.id}`}>
              <Card hoverable className="group h-full flex flex-col p-0 overflow-hidden">
                 {/* Team Header */}
                 <div className="p-5 pb-3">
                   <div className="flex justify-between items-start mb-1">
                     <h3 className="text-lg font-black font-display group-hover:text-[var(--pokedex-red)] transition-colors">
                        {team.name}
                     </h3>
                     <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white" 
                        style={{ background: team.ratingScore && team.ratingScore >= 70 ? '#10b981' : '#3b82f6' }}>
                        {team.format}
                     </span>
                   </div>
                   <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {team.description || 'No description provided'}
                   </p>
                 </div>

                 {/* Pokémon Row */}
                 <div className="px-5 py-4 flex -space-x-4 hover:space-x-1 transition-all duration-300 bg-[var(--bg-secondary)]/50 mt-auto">
                    {team.pokemonIds.slice(0, 6).map((pid, i) => (
                      <div key={i} className="relative w-12 h-12 rounded-full border-2 border-white dark:border-[#1a1a2e] bg-white overflow-hidden shadow-md">
                         {/* This would normally fetch actual sprites, showing placeholder for now or using a generic sprite if known */}
                         <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black opacity-20">
                            #{pid}
                         </div>
                      </div>
                    ))}
                    {team.pokemonIds.length < 6 && Array.from({ length: 6 - team.pokemonIds.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent" />
                    ))}
                 </div>

                 {/* Rating & Stats */}
                 <div className="p-4 flex items-center justify-between border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-1.5">
                       <span className="text-xs font-bold uppercase tracking-widest opacity-40">Rating</span>
                       <span className="text-lg font-black" style={{ color: team.ratingScore && team.ratingScore >= 70 ? '#10b981' : '#3b82f6' }}>
                          {team.ratingScore || '??'}
                       </span>
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                       {new Date(team.createdAt).toLocaleDateString()}
                    </div>
                 </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
