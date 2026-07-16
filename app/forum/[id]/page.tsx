/**
 * Thread Detail View
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, useForumThread } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

export default function ThreadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, refetch } = useForumThread(id as string);
  const queryClient = useQueryClient();
  
  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const thread = data?.thread;
  const replies = data?.replies || [];

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setIsSubmitting(true);
    try {
      await axios.post(`/api/forum/threads/${id}`, 
        { body: replyBody }
      );
      setReplyBody('');
      refetch(); // Refetch the detailed thread view
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] }); // Invalidate the thread list cache
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="animate-pulse flex items-center justify-center py-20 font-extrabold" style={{ color: 'var(--text-secondary)' }}>Loading discussion...</div>;
  if (!thread) return <div className="text-center py-20 font-extrabold" style={{ color: 'var(--text-secondary)' }}>Thread not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger-children">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        ← Back to Forum
      </Button>

      {/* Main Post */}
      <Card className="p-8 border-l-[6px]" style={{ borderLeftColor: 'var(--accent-secondary)' }}>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
             <span 
               className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border-2"
               style={{
                 backgroundColor: 'var(--bg-secondary)',
                 color: 'var(--text-secondary)',
                 borderColor: 'var(--border-color-bold)',
               }}
             >
                {thread.category}
             </span>
             <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Posted by <span className="font-bold" style={{ color: 'var(--text-primary)' }}>@{thread.username}</span> • {formatDistanceToNow(new Date(thread.created_at))} ago
             </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display mb-6">{thread.title}</h1>
          <div className="leading-relaxed whitespace-pre-wrap text-base" style={{ color: 'var(--text-secondary)' }}>
            {thread.body}
          </div>
        </div>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-xl font-black font-display px-2 pt-4">{replies.length} Replies</h3>
        {replies.map((reply: any) => (
          <Card key={reply.id} className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-sm">@{reply.username}</span>
              <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(reply.created_at))} ago</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {reply.body}
            </p>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <div className="pt-8">
        {user ? (
          <Card className="p-6">
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2"
                  style={{
                    backgroundColor: 'var(--accent-secondary)',
                    color: 'white',
                    borderColor: 'var(--text-primary)',
                  }}
                >
                  {user.username.substring(0, 1).toUpperCase()}
                </span>
                <span className="text-sm font-black font-display">Post a reply as @{user.username}</span>
              </div>
              <div className="auth-input-wrapper">
                <textarea
                  required
                  rows={4}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write your response..."
                  className="auth-input shadow-inner !p-4 resize-none min-h-[120px]"
                />
                <div className="auth-input-glow" />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="px-8"
                >
                  Post Reply 🚀
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-10 text-center" style={{ borderStyle: 'dashed', borderColor: 'var(--border-color-bold)' }}>
            <h3 className="font-black font-display mb-2 text-xl">Want to join the conversation?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>You must be logged in to post a reply.</p>
            <Link href="/login">
              <Button variant="outline">Login to Reply</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
