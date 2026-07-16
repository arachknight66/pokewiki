'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useCreateTournament } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { ArrowLeft, Trophy, Save } from 'lucide-react';

export default function CreateTournamentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const createMutation = useCreateTournament();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('OU');
  const [maxParticipants, setMaxParticipants] = useState(64);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      // Validate dates
      const dataPayload: any = {
        name,
        description: description.trim() || undefined,
        format,
        maxParticipants: Number(maxParticipants),
      };

      if (startDate) {
        dataPayload.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        dataPayload.endDate = new Date(endDate).toISOString();
      }

      await createMutation.mutateAsync(dataPayload);
      setFeedback({ type: 'success', message: 'Tournament created successfully!' });
      
      setTimeout(() => {
        router.push('/tournaments' as any);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error?.message || 'Failed to host tournament';
      setFeedback({ type: 'error', message: errMsg });
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-black font-display animate-pulse">Loading Arena...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 stagger-children">
      <Link href={"/tournaments" as any}>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Tournaments
        </Button>
      </Link>

      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-black font-display flex items-center gap-3 justify-center lg:justify-start">
          <Trophy className="text-[var(--accent-gold)]" size={32} />
          <span className="anime-heading">Host Tournament</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Launch a custom arena bracket for trainers to fight in
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tournament Name */}
          <div className="space-y-1.5">
            <label htmlFor="tournament-name-input" className="text-xs font-black uppercase tracking-wider block">
              Tournament Name
            </label>
            <div className="auth-input-wrapper">
              <input
                id="tournament-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer OU Master Cup"
                className="auth-input shadow-inner !p-3 text-sm w-full"
              />
              <div className="auth-input-glow" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="tournament-desc-input" className="text-xs font-black uppercase tracking-wider block">
              Description / Rules
            </label>
            <div className="auth-input-wrapper">
              <textarea
                id="tournament-desc-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rules, match setup details, and notes..."
                className="auth-input shadow-inner !p-3 resize-none w-full min-h-[100px] text-sm"
              />
              <div className="auth-input-glow" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Format */}
            <div className="space-y-1.5">
              <label htmlFor="tournament-format-input" className="text-xs font-black uppercase tracking-wider block">
                Format Tier
              </label>
              <div className="auth-input-wrapper">
                <select
                  id="tournament-format-input"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="auth-input shadow-inner !p-3 text-sm w-full bg-[var(--bg-input)]"
                >
                  <option value="OU">OU (Overused)</option>
                  <option value="UU">UU (Underused)</option>
                  <option value="VGC">VGC Series</option>
                  <option value="LC">LC (Little Cup)</option>
                  <option value="Randoms">Random Battle</option>
                </select>
                <div className="auth-input-glow" />
              </div>
            </div>

            {/* Max Participants */}
            <div className="space-y-1.5">
              <label htmlFor="tournament-participants-input" className="text-xs font-black uppercase tracking-wider block">
                Max Particpants
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="tournament-participants-input"
                  type="number"
                  required
                  min={2}
                  max={256}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="auth-input shadow-inner !p-3 text-sm w-full"
                />
                <div className="auth-input-glow" />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label htmlFor="tournament-start-input" className="text-xs font-black uppercase tracking-wider block">
                Start Date
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="tournament-start-input"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="auth-input shadow-inner !p-3 text-sm w-full"
                />
                <div className="auth-input-glow" />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label htmlFor="tournament-end-input" className="text-xs font-black uppercase tracking-wider block">
                End Date
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="tournament-end-input"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="auth-input shadow-inner !p-3 text-sm w-full"
                />
                <div className="auth-input-glow" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="px-8 flex items-center gap-2"
            >
              <Save size={16} /> Save & Open Lobby
            </Button>
          </div>
        </form>
      </Card>

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
