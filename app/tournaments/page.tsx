'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useTournaments } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { 
  Trophy, 
  Plus, 
  Swords, 
  Users, 
  Calendar, 
  User, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function TournamentsPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'open' | 'in-progress' | 'closed'>('open');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTournaments({ 
    status: statusFilter, 
    page,
    pageSize: 20 
  });

  const tournaments = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8 stagger-children">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-display flex items-center gap-3 justify-center sm:justify-start">
            <Trophy className="text-[var(--accent-gold)]" size={40} />
            <span className="anime-heading">Tournaments</span>
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            Submit your teams to compete in official and community tournaments
          </p>
        </div>
        {user && (
          <Link href={"/tournaments/create" as any}>
            <Button className="flex items-center gap-2 shadow-lg">
              <Plus size={16} /> Host Tournament
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b-4 border-[var(--text-primary)] pb-0.5">
        {(['open', 'in-progress', 'closed'] as const).map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              aria-selected={isActive}
              role="tab"
              className={`px-6 py-3 text-sm font-black uppercase tracking-wider transition-all border-t-4 border-x-4 rounded-t-xl -mb-1 relative z-10 ${
                isActive
                  ? 'bg-[var(--bg-card)] border-[var(--text-primary)] text-[var(--accent-gold)]'
                  : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={isActive ? {
                borderBottomColor: 'var(--bg-card)',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
              } : undefined}
            >
              {status === 'open' ? 'Open Registrations' : status === 'in-progress' ? 'Ongoing' : 'Completed'}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="animate-pulse flex items-center justify-center py-20 font-extrabold" style={{ color: 'var(--text-secondary)' }}>
          Loading arena...
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {tournaments.map((tournament: any) => {
            const hasStarted = tournament.start_date;
            const subCount = tournament._count?.submissions || 0;
            const maxPart = tournament.max_participants || 64;

            return (
              <Card 
                key={tournament.id} 
                className="p-6 transition-transform hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--pokedex-red)] to-[var(--accent-gold)]" />

                <div className="flex flex-col justify-between h-full space-y-4 pt-2">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--border-color-bold)] bg-[var(--bg-secondary)] flex items-center gap-1">
                        <Swords size={10} /> {tournament.format}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">
                        {tournament.status === 'open' ? 'Joinable' : tournament.status === 'in-progress' ? 'Playing' : 'Finished'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black font-display mb-2 capitalize group-hover:text-[var(--accent-secondary)]">
                      {tournament.name}
                    </h3>

                    {tournament.description && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {tournament.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-[var(--border-color)] pt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[var(--text-muted)]" />
                      <span className="font-bold">
                        Participants: <span className="text-[var(--text-primary)]">{subCount}</span> / {maxPart}
                      </span>
                    </div>

                    {hasStarted && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[var(--text-muted)]" />
                        <span className="font-bold">
                          Starts: <span className="text-[var(--text-primary)]">{format(new Date(tournament.start_date), 'MMM d, yyyy')}</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[var(--text-muted)]" />
                      <span className="font-bold">
                        Hosted by <span className="text-[var(--text-primary)]">@{tournament.creator?.username}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Link href={`/tournaments/${tournament.id}` as any}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
                        Enter Arena <ArrowRight size={12} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-20 border-2 border-dashed border-[var(--border-color-bold)] bg-[var(--bg-card)]">
          <ShieldAlert className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" size={48} />
          <h3 className="font-black font-display text-xl mb-1">No Tournaments Active</h3>
          <p className="text-xs font-bold leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            There are currently no tournaments listed under this category. Check back later or create your own!
          </p>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm font-bold">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === pagination.totalPages}
            onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
