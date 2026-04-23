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
          <h1 className="text-4xl font-extrabold tracking-tight">Community Forum</h1>
          <p className="text-gray-500 mt-2">Connect with trainers and discuss competitive strategies</p>
        </div>
        {user ? (
          <Link href="/forum/new">
            <Button className="shadow-lg shadow-blue-500/20">
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
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Categories</h3>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                category === cat.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/40'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content - Thread List */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : threads.length > 0 ? (
            threads.map((thread: any) => (
              <Link key={thread.id} href={`/forum/${thread.id}`}>
                <Card className="hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all group mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xl">
                      {CATEGORIES.find(c => c.id === thread.category)?.icon || '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {thread.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          by <span className="font-bold text-gray-600 dark:text-gray-300">@{thread.username || 'unknown'}</span> • {formatDistanceToNow(new Date(thread.created_at))} ago
                        </span>
                      </div>
                      <h2 className="text-lg font-bold group-hover:text-blue-600 transition-colors truncate">
                        {thread.title}
                      </h2>
                    </div>
                    <div className="hidden sm:flex flex-col items-center justify-center px-4 border-l border-gray-100 dark:border-gray-800">
                      <span className="text-xl font-bold">{thread.replies_count || 0}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Replies</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="text-center py-20 opacity-60">
              <div className="text-4xl mb-4">📭</div>
              <p className="font-bold">No discussions found in this category.</p>
              <p className="text-sm">Be the first to start a conversation!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
