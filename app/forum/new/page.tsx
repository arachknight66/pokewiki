/**
 * Create New Forum Thread
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

const CATEGORIES = [
  { id: 'strategy', label: 'Strategy Discussion', icon: '⚔️' },
  { id: 'team-building', label: 'Team Building', icon: '🧬' },
  { id: 'meta-discussion', label: 'Meta Discussion', icon: '📊' },
  { id: 'general', label: 'General / Off-topic', icon: '🍵' },
];

export default function NewThreadPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/forum/new');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/forum/threads', 
        { title, category, body }
      );

      if (response.data.success) {
        router.push(`/forum/${response.data.data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      const data = err.response?.data;
      if (data?.error?.code === 'VALIDATION_ERROR' && data.error.details) {
        const details = data.error.details;
        const firstError = Object.values(details)[0] as string[];
        setError(firstError[0] || 'Validation failed');
      } else {
        setError(data?.error?.message || 'Failed to create discussion');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="h-96 flex items-center justify-center font-extrabold" style={{ color: 'var(--text-secondary)' }}>Authenticating...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto stagger-children">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4"
        >
          ← Back to Forum
        </Button>
        <h1 className="text-3xl lg:text-4xl font-black font-display">
          <span className="anime-heading">Start a Discussion</span>
        </h1>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
              Discussion Title
            </label>
            <div className="auth-input-wrapper">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How to counter Flutter Mane in Reg G?"
                className="auth-input shadow-inner !pl-4"
              />
              <div className="auth-input-glow" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Category
              </label>
              <div className="auth-input-wrapper">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="auth-input shadow-inner !pl-4 appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</span>
                <div className="auth-input-glow" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
              Discussion Content
            </label>
            <div className="auth-input-wrapper">
              <textarea
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts, strategies, or questions..."
                className="auth-input shadow-inner !p-4 resize-none min-h-[200px]"
              />
              <div className="auth-input-glow" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              className="px-8"
              size="lg"
            >
              Post Discussion
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
