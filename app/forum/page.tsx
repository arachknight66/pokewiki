/**
 * Forum - Community Discussion Board
 */

'use client';

import { useState } from 'react';
import { useForumThreads, useAuth } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { id: '', label: 'All Discussions', icon: '🌐' },
  { id: 'strategy', label: 'Strategy', icon: '⚔️' },
  { id: 'team-building', label: 'Team Building', icon: '🧬' },
  { id: 'meta-discussion', label: 'Meta Discussion', icon: '📊' },
  { id: 'general', label: 'General', icon: '🍵' },
];

export default function ForumPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const { data, isLoading } = useForumThreads({ category });

  const threads = data?.data || [];

  return (
    <div className="space-y-8 stagger-children">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-display">
            <span className="anime-heading">Community Forum</span>
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            Connect with trainers and discuss competitive strategies
          </p>
        </div>
        {user ? (
          <Link href="/forum/new">
            <Button>
              <span className="mr-2">✍️</span> Start New Discussion
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline">Login to Join Discussion</Button>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-4 px-2" style={{ color: 'var(--text-muted)' }}>
            Categories
          </h3>
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all duration-300"
                style={{
                  background: isActive ? 'var(--pokedex-red)' : 'var(--bg-card)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${isActive ? 'var(--text-primary)' : 'var(--border-color)'}`,
                  boxShadow: isActive ? '2px 2px 0px var(--text-primary)' : 'none',
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main Content - Thread List */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className="h-32 rounded-2xl animate-pulse border-[3px]" 
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
              ))}
            </div>
          ) : threads.length > 0 ? (
            threads.map((thread: any) => (
              <Link key={thread.id} href={`/forum/${thread.id}`}>
                <Card hoverable className="group mb-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-color-bold)' 
                      }}
                    >
                      {CATEGORIES.find(c => c.id === thread.category)?.icon || '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            borderColor: 'var(--border-color-bold)',
                          }}
                        >
                          {thread.category}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          by <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>@{thread.username || 'unknown'}</span> • {formatDistanceToNow(new Date(thread.created_at))} ago
                        </span>
                      </div>
                      <h2 className="text-lg font-black font-display group-hover:text-[var(--pokedex-red)] transition-colors truncate">
                        {thread.title}
                      </h2>
                    </div>
                    <div 
                      className="hidden sm:flex flex-col items-center justify-center px-4 border-l-2"
                      style={{ borderLeftColor: 'var(--border-color-bold)' }}
                    >
                      <span className="text-xl font-black font-display">{thread.replies_count || 0}</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Replies</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="text-center py-20 opacity-60">
              <div className="text-4xl mb-4">📭</div>
              <p className="font-black font-display text-lg mb-1">No discussions found in this category.</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Be the first to start a conversation!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
