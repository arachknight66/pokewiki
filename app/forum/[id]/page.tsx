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
        { body: replyBody },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
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

  if (isLoading) return <div className="animate-pulse flex items-center justify-center py-20">Loading discussion...</div>;
  if (!thread) return <div className="text-center py-20">Thread not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger-children">
      <button 
        onClick={() => router.back()}
        className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2"
      >
        ← Back to Forum
      </button>

      {/* Main Post */}
      <Card className="p-8 border-l-4 border-l-blue-600">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                {thread.category}
             </span>
             <span className="text-xs text-gray-400">
                Posted by <span className="font-bold text-gray-600 dark:text-gray-300">@{thread.username}</span> • {formatDistanceToNow(new Date(thread.created_at))} ago
             </span>
          </div>
          <h1 className="text-3xl font-black mb-6">{thread.title}</h1>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {thread.body}
          </div>
        </div>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2 pt-4">{replies.length} Replies</h3>
        {replies.map((reply: any) => (
          <Card key={reply.id} className="p-6 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-sm">@{reply.username}</span>
              <span className="text-[10px] text-gray-400 ml-auto">{formatDistanceToNow(new Date(reply.created_at))} ago</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {reply.body}
            </p>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <div className="pt-8">
        {user ? (
          <Card className="p-6 shadow-xl border-2 border-blue-500/20">
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.username.substring(0, 1).toUpperCase()}
                </span>
                <span className="text-sm font-bold">Post a reply as @{user.username}</span>
              </div>
              <textarea
                required
                rows={4}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your response..."
                className="w-full p-4 bg-gray-100 dark:bg-gray-950 border-transparent focus:border-blue-500/30 border-2 rounded-2xl outline-none transition-all resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="px-8 shadow-blue-500/20 shadow-lg"
                >
                  Post Reply 🚀
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-10 text-center border-dashed border-2 border-gray-200 dark:border-gray-800">
            <h3 className="font-bold mb-2">Want to join the conversation?</h3>
            <p className="text-sm text-gray-500 mb-6">You must be logged in to post a reply.</p>
            <Link href="/login">
              <Button variant="outline">Login to Reply</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
