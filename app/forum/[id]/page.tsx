/**
 * Thread Detail View
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useAuth, 
  useForumThread, 
  useVoteReply, 
  useReportContent, 
  useEditReply 
} from '@/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  Flag, 
  Edit, 
  Eye, 
  MessageSquare, 
  Send,
  CornerDownRight
} from 'lucide-react';

export default function ThreadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, refetch } = useForumThread(id as string);
  const queryClient = useQueryClient();

  const voteReplyMutation = useVoteReply();
  const reportContentMutation = useReportContent();
  const editReplyMutation = useEditReply();

  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit reply state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const thread = data?.thread;
  const replies = data?.replies || [];

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setIsSubmitting(true);
    try {
      await axiosPostReply(id as string, replyBody);
      setReplyBody('');
      refetch(); // Refetch the detailed thread view
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] }); // Invalidate list cache
      setFeedback({ type: 'success', message: 'Reply posted successfully!' });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to post reply' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper because we import axios inside functions if we want or just use window.fetch/axios
  const axiosPostReply = async (threadId: string, body: string) => {
    const res = await fetch(`/api/forum/threads/${threadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error('Failed to post reply');
    return res.json();
  };

  const handleVote = async (replyId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      router.push('/login');
      return;
    }

    const queryKey = ['forum-thread', id];
    const previousData = queryClient.getQueryData<any>(queryKey);

    // Optimistically update the UI
    if (previousData) {
      const updatedReplies = previousData.replies.map((reply: any) => {
        if (reply.id !== replyId) return reply;

        let netVotesDiff = 0;
        let nextUserVote: 'upvote' | 'downvote' | null = voteType;

        if (!reply.userVote) {
          // No previous vote: +1 for upvote, -1 for downvote
          netVotesDiff = voteType === 'upvote' ? 1 : -1;
        } else if (reply.userVote === voteType) {
          // Toggle off if clicking the same vote type again
          netVotesDiff = voteType === 'upvote' ? -1 : 1;
          nextUserVote = null;
        } else {
          // Switching vote: shift by 2
          netVotesDiff = voteType === 'upvote' ? 2 : -2;
        }

        return {
          ...reply,
          net_votes: (reply.net_votes || 0) + netVotesDiff,
          userVote: nextUserVote,
        };
      });

      queryClient.setQueryData(queryKey, {
        ...previousData,
        replies: updatedReplies,
      });
    }

    try {
      await voteReplyMutation.mutateAsync({ replyId, voteType });
      // Invalidate to fetch exact database count
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      setFeedback({ type: 'error', message: 'Failed to record vote' });
    }
  };

  const handleReport = async (targetType: 'thread' | 'reply', targetId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await reportContentMutation.mutateAsync({ targetType, targetId });
      setFeedback({
        type: 'success',
        message: 'Reported. Thanks for helping keep the community safe.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to submit report' });
    }
  };

  const startEditing = (replyId: string, currentBody: string) => {
    setEditingReplyId(replyId);
    setEditingBody(currentBody);
  };

  const handleSaveEdit = async (replyId: string) => {
    if (!editingBody.trim()) return;

    setIsSavingEdit(true);
    try {
      await editReplyMutation.mutateAsync({ replyId, body: editingBody });
      setEditingReplyId(null);
      setEditingBody('');
      refetch();
      setFeedback({ type: 'success', message: 'Reply updated!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to save changes' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center justify-center py-20 font-extrabold" style={{ color: 'var(--text-secondary)' }}>
        Loading discussion...
      </div>
    );
  }
  if (!thread) {
    return (
      <div className="text-center py-20 font-extrabold" style={{ color: 'var(--text-secondary)' }}>
        Thread not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger-children">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.back()}
        className="flex items-center gap-2"
        aria-label="Go back to previous page"
      >
        <ArrowLeft size={16} /> Back to Forum
      </Button>

      {/* Main Post */}
      <Card className="p-8 border-l-[6px]" style={{ borderLeftColor: 'var(--accent-secondary)' }}>
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
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
             <span className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                <span>Posted by</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>@{thread.username}</span>
                <span>• {formatDistanceToNow(new Date(thread.created_at))} ago</span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><Eye size={12} /> {thread.views || 0} views</span>
             </span>
             
             {user && (
               <button
                 onClick={() => handleReport('thread', thread.id)}
                 className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 hover:underline flex items-center gap-1 ml-auto"
                 aria-label="Report thread"
               >
                 <Flag size={12} /> Report
               </button>
             )}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display mb-6">{thread.title}</h1>
          <div className="leading-relaxed whitespace-pre-wrap text-base" style={{ color: 'var(--text-secondary)' }}>
            {thread.body}
          </div>
        </div>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-xl font-black font-display px-2 pt-4 flex items-center gap-2">
          <MessageSquare size={20} />
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>
        
        {replies.map((reply: any) => {
          const isOwnReply = user && user.id === reply.user_id;

          return (
            <Card key={reply.id} className="p-6 relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-sm">@{reply.username}</span>
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <span>{formatDistanceToNow(new Date(reply.created_at))} ago</span>
                  {reply.is_edited && (
                    <span title={reply.edited_at ? `Edited ${formatDistanceToNow(new Date(reply.edited_at))} ago` : 'Edited'}>
                      (edited)
                    </span>
                  )}
                </span>
              </div>

              {/* Editing block */}
              {editingReplyId === reply.id ? (
                <div className="space-y-3 mt-2">
                  <div className="auth-input-wrapper">
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      className="auth-input shadow-inner !p-3 resize-none w-full min-h-[85px] text-sm"
                      rows={3}
                      aria-label="Edit your reply content"
                    />
                    <div className="auth-input-glow" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingReplyId(null)}
                      disabled={isSavingEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(reply.id)}
                      isLoading={isSavingEdit}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)] mt-2">
                  {reply.body}
                </p>
              )}

              {/* Reply controls bar */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
                {/* Vote Buttons */}
                <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border-color)]">
                  <button
                    onClick={() => handleVote(reply.id, 'upvote')}
                    aria-label="Upvote reply"
                    aria-pressed={reply.userVote === 'upvote'}
                    className={`p-1 rounded transition-all hover:bg-emerald-500/10 ${reply.userVote === 'upvote' ? 'text-emerald-500' : 'text-[var(--text-muted)] hover:text-emerald-500'}`}
                  >
                    <ArrowUp size={15} className={reply.userVote === 'upvote' ? 'fill-current' : ''} />
                  </button>
                  <span className={`text-xs font-black min-w-[18px] text-center ${reply.userVote === 'upvote' ? 'text-emerald-500' : reply.userVote === 'downvote' ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                    {reply.net_votes || 0}
                  </span>
                  <button
                    onClick={() => handleVote(reply.id, 'downvote')}
                    aria-label="Downvote reply"
                    aria-pressed={reply.userVote === 'downvote'}
                    className={`p-1 rounded transition-all hover:bg-rose-500/10 ${reply.userVote === 'downvote' ? 'text-rose-500' : 'text-[var(--text-muted)] hover:text-rose-500'}`}
                  >
                    <ArrowDown size={15} className={reply.userVote === 'downvote' ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {isOwnReply && editingReplyId !== reply.id && (
                    <button
                      onClick={() => startEditing(reply.id, reply.body)}
                      className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-secondary)] hover:underline flex items-center gap-1"
                      aria-label="Edit reply"
                    >
                      <Edit size={11} /> Edit
                    </button>
                  )}
                  
                  {user && (
                    <button
                      onClick={() => handleReport('reply', reply.id)}
                      className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:underline flex items-center gap-1"
                      aria-label="Report reply"
                    >
                      <Flag size={11} /> Report
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
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
                <label htmlFor="reply-body-input" className="text-sm font-black font-display cursor-pointer">
                  Post a reply as @{user.username}
                </label>
              </div>
              
              <div className="auth-input-wrapper">
                <textarea
                  id="reply-body-input"
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
                  className="px-8 flex items-center gap-2"
                >
                  <Send size={14} /> Post Reply
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-10 text-center" style={{ borderStyle: 'dashed', borderColor: 'var(--border-color-bold)' }}>
            <h3 className="font-black font-display mb-2 text-xl">Want to join the conversation?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>You must be logged in to post a reply.</p>
            <Link href="/login">
              <Button variant="outline" className="flex items-center gap-2">
                <CornerDownRight size={14} /> Login to Reply
              </Button>
            </Link>
          </Card>
        )}
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
