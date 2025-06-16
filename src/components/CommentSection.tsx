"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

type Comment = Database['public']['Tables']['post_comments']['Row'] & {
  email?: string;
};

export default function CommentSection({ postId, initialComments = [] }: { 
  postId: string;
  initialComments?: Comment[];
}) {
  const supabase = createClientComponentClient<Database>();
  const PAGE_SIZE = 20;

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial batch and total count
    const fetchInitialComments = async () => {
      setLoading(true);
      try {
        // Get total count only once
        const { count } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        setTotalCount(count || 0);

        // Fetch first PAGE_SIZE comments (oldest first)
        const { data, error: fetchError } = await supabase
          .from('post_comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
          .range(0, PAGE_SIZE - 1);

        if (fetchError) throw fetchError;

        await attachEmailsAndSet(data || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialComments();

    // Set up realtime subscription
    const channel = supabase
      .channel(`comment-changes-${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_comments',
        eq: { post_id: postId }
      }, async (payload) => {
        console.log('🔔 comment payload', payload);
        if (payload.eventType === 'INSERT') {
          // Determine commenter email
          const { data: { user } } = await supabase.auth.getUser();
          let commenterEmail: string | undefined;
          if (payload.new.user_id === user?.id) {
            commenterEmail = user?.email || 'unknown@example.com';
          } else {
            const { data: otherUser } = await supabase
              .from('users')
              .select('email')
              .eq('id', payload.new.user_id)
              .single();
            commenterEmail = otherUser?.email || 'unknown@example.com';
          }

          // Avoid adding duplicate if already optimistically added
          setComments(prev => {
            if (prev.some(c => c.id === payload.new.id)) return prev;
            return [...prev, { 
              ...payload.new as Comment, 
              email: commenterEmail
            }];
          });
        } else if (payload.eventType === 'DELETE') {
          setComments(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase, initialComments]);

  // Helper to map user id -> email and set state
  const attachEmailsAndSet = async (data: Comment[]) => {
    if (data.length === 0) return;
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);
    const map = new Map(users?.map(u => [u.id, u.email]));
    const withEmails = data.map(c => ({ ...c, email: map.get(c.user_id) || 'unknown@example.com' }));
    setComments(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newOnes = withEmails.filter(c => !existingIds.has(c.id));
      return [...prev, ...newOnes];
    });
  };

  const loadMore = async () => {
    if (loadingMore || comments.length === (totalCount ?? 0)) return;
    setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .range(comments.length, comments.length + PAGE_SIZE - 1);
      if (error) throw error;
      await attachEmailsAndSet(data || []);
    } catch (err) {
      console.error('Error loading more comments', err);
      setError('Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: inserted, error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment.trim()
          }
        ])
        .select('*')
        .single();

      if (error) throw error;

      // Optimistically add new comment with user's email
      setComments(prev => [
        ...prev,
        {
          ...(inserted as Comment),
          email: user.email || 'unknown@example.com'
        }
      ]);
      
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  if (loading) return <div className="text-center py-4">Loading comments...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </div>
      </form>

      {/* Load More */}
      {totalCount !== null && comments.length < totalCount && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="text-sm text-blue-600 hover:underline mb-2"
        >
          {loadingMore ? 'Loading...' : `View more comments (${totalCount - comments.length} remaining)`}
        </button>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{comment.email}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-gray-800">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
