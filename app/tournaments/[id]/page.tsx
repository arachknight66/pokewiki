'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useAuth, 
  useTournament, 
  useTournamentLeaderboard, 
  useTeams, 
  useSubmitTeamToTournament 
} from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Trophy, 
  ArrowLeft, 
  Swords, 
  Users, 
  Calendar, 
  User, 
  Send, 
  Medal, 
  UserCheck, 
  Info,
  CalendarDays
} from 'lucide-react';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tournament, isLoading: tLoading, refetch: tRefetch } = useTournament(id as string);
  const { data: leaderboard = [], isLoading: lLoading, refetch: lRefetch } = useTournamentLeaderboard(id as string);
  const { data: teamsData, isLoading: teamsLoading } = useTeams({ pageSize: 100 });
  const submitTeamMutation = useSubmitTeamToTournament();

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (tLoading || lLoading) {
    return (
      <div className="animate-pulse flex items-center justify-center py-20 font-extrabold" style={{ color: 'var(--text-secondary)' }}>
        Loading arena information...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20 font-extrabold" style={{ color: 'var(--text-secondary)' }}>
        Tournament not found
      </div>
    );
  }

  // Filter user's own teams
  const myTeams = teamsData?.data?.filter((team: any) => team.user_id === user?.id) || [];
  
  // Check if current user has already submitted a team
  const userSubmission = leaderboard?.find((sub: any) => sub.user_id === user?.id);
  const hasSubmitted = !!userSubmission;

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    setIsSubmitting(true);
    try {
      await submitTeamMutation.mutateAsync({
        tournamentId: id as string,
        teamId: selectedTeamId
      });
      setFeedback({ type: 'success', message: 'Registered successfully!' });
      setSelectedTeamId('');
      tRefetch();
      lRefetch();
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error?.message || 'Failed to submit team';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    'open': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    'in-progress': 'text-[var(--accent-gold)] border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/5',
    'closed': 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5'
  };

  const getStatusText = (status: string) => {
    if (status === 'open') return 'Registration Open';
    if (status === 'in-progress') return 'In Progress';
    return 'Completed';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 stagger-children">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.push('/tournaments' as any)}
        className="flex items-center gap-2"
        aria-label="Go back to tournaments page"
      >
        <ArrowLeft size={16} /> Back to Tournaments
      </Button>

      {/* Main Details Panel */}
      <Card className="p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--pokedex-red)] to-[var(--accent-gold)]" />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span 
                className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color-bold)',
                }}
              >
                 Format: {tournament.format}
              </span>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border-2 ${statusColors[tournament.status || 'open']}`}>
                {getStatusText(tournament.status)}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black font-display capitalize">{tournament.name}</h1>
            
            {tournament.description && (
              <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>
                {tournament.description}
              </p>
            )}
          </div>

          {/* Quick Stats Panel */}
          <div className="w-full md:w-64 bg-[var(--bg-secondary)] rounded-2xl border-2 border-[var(--border-color-bold)] p-5 space-y-4">
            <h3 className="font-extrabold text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] border-b pb-2">
              Arena Stats
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-muted)' }}>
                  <Users size={14} /> Slots filled
                </span>
                <span className="font-extrabold">
                  {tournament._count?.submissions || 0} / {tournament.max_participants || 64}
                </span>
              </div>

              {tournament.start_date && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={14} /> Start Date
                  </span>
                  <span className="font-bold">
                    {format(new Date(tournament.start_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-muted)' }}>
                  <User size={14} /> Organizer
                </span>
                <span className="font-bold">
                  @{tournament.creator?.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Submissions & Info */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Submit Team Panel */}
          {tournament.status === 'open' && (
            <Card className="p-6">
              <h2 className="text-lg font-black font-display mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-[var(--accent-gold)]" /> Register Team
              </h2>

              {!user ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    You must be logged in to submit a team to this tournament.
                  </p>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Login to Register
                    </Button>
                  </Link>
                </div>
              ) : hasSubmitted ? (
                <div className="bg-emerald-500/5 border-2 border-emerald-500/25 rounded-xl p-4 text-center space-y-2">
                  <UserCheck className="mx-auto text-emerald-500" size={32} />
                  <h4 className="font-black text-sm text-emerald-500">Registered</h4>
                  <p className="text-[10px] font-bold leading-normal text-[var(--text-secondary)]">
                    You have submitted team <span className="font-extrabold text-[var(--text-primary)]">&quot;{userSubmission.team?.name}&quot;</span> to this tournament. ELO: {Math.round(userSubmission.elo_rating)}
                  </p>
                </div>
              ) : myTeams.length > 0 ? (
                <form onSubmit={handleRegisterTeam} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="team-select" className="text-[10px] font-black uppercase tracking-wider block">
                      Select Your Team
                    </label>
                    <div className="auth-input-wrapper">
                      <select
                        id="team-select"
                        required
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="auth-input shadow-inner !p-3 text-xs w-full bg-[var(--bg-input)]"
                      >
                        <option value="">-- Choose a Team --</option>
                        {myTeams.map((team: any) => (
                          <option key={team.id} value={team.id}>
                            {team.name} (Rating: {Math.round(team.rating_score || 0)})
                          </option>
                        ))}
                      </select>
                      <div className="auth-input-glow" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Send size={14} /> Submit Registry
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    You don&apos;t have any teams available to register.
                  </p>
                  <Link href="/team-builder">
                    <Button size="sm" className="w-full">
                      Build a Team
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          )}

          {/* Rules/Info Board */}
          <Card className="p-6">
            <h2 className="text-lg font-black font-display mb-3 flex items-center gap-2">
              <Info size={18} className="text-[var(--accent-secondary)]" /> Rules Board
            </h2>
            <ul className="text-xs space-y-2 list-disc list-inside font-bold" style={{ color: 'var(--text-secondary)' }}>
              <li>Maximum team size is 6 Pokémon.</li>
              <li>Match matchups follow standard format clauses.</li>
              <li>Unsportsmanlike conduct results in DQ.</li>
              <li>Tournament results updates ELO rating stats.</li>
            </ul>
          </Card>
        </div>

        {/* Right Column: ELO Leaderboard Table */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-black font-display mb-6 flex items-center gap-2">
              <Medal size={24} className="text-[var(--accent-gold)]" /> ELO Rankings
            </h2>

            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto border-2 border-[var(--text-primary)] rounded-xl bg-[var(--bg-secondary)]">
                <table className="w-full border-collapse text-left text-xs font-bold">
                  <thead>
                    <tr className="border-b-2 border-[var(--text-primary)] bg-[var(--bg-primary)]">
                      <th className="p-3 font-black uppercase text-center w-12">Rank</th>
                      <th className="p-3 font-black uppercase">Trainer</th>
                      <th className="p-3 font-black uppercase">Team</th>
                      <th className="p-3 font-black uppercase text-center w-20">Record</th>
                      <th className="p-3 font-black uppercase text-center w-24">ELO Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((sub: any, idx: number) => {
                      const isCurrentUser = user && sub.user_id === user.id;
                      return (
                        <tr 
                          key={sub.id} 
                          className={`border-b border-[var(--border-color)] last:border-0 hover:bg-white/5 transition-colors ${
                            isCurrentUser ? 'bg-[var(--accent-secondary)]/5 text-[var(--accent-secondary)]' : ''
                          }`}
                        >
                          <td className="p-3 text-center font-black">{idx + 1}</td>
                          <td className="p-3 font-black">@{sub.user?.username}</td>
                          <td className="p-3 font-semibold truncate max-w-[150px]">{sub.team?.name}</td>
                          <td className="p-3 text-center">{sub.wins} - {sub.losses}</td>
                          <td className="p-3 text-center font-mono font-black">{Math.round(sub.elo_rating)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[var(--border-color-bold)] rounded-xl">
                <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  No registrations recorded yet. Be the first to enter the lobby!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {feedback && (
        <Toast
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
}
