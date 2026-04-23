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
        { title, category, body },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
          } 
        }
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
    return <div className="h-96 flex items-center justify-center">Authenticating...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto stagger-children">
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 mb-4"
        >
          ← Back to Forum
        </button>
        <h1 className="text-3xl font-black">Start a Discussion</h1>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-100 text-red-600 font-bold text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Discussion Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to counter Flutter Mane in Reg G?"
              className="w-full text-lg font-bold p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-blue-500/50 rounded-2xl outline-none transition-all"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-blue-500/50 rounded-2xl outline-none transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Discussion Content</label>
            <textarea
              required
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts, strategies, or questions..."
              className="w-full p-6 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-blue-500/50 rounded-2xl outline-none transition-all resize-none"
            />
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
