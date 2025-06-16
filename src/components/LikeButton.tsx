"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
  initialLiked: boolean;
}

export default function LikeButton({ 
  postId, 
  initialLikesCount, 
  initialLiked 
}: LikeButtonProps) {
  const supabase = createClientComponentClient<Database>();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  // Handle like/unlike with optimistic UI update
  const toggleLike = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to like posts");
        return;
      }

      if (isLiked) {
        // Optimistically update UI
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));

        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });

        if (error) {
          // Revert on error
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
          throw error;
        }
      } else {
        // Optimistically update UI
        setIsLiked(true);
        setLikesCount(prev => prev + 1);

        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) {
          // Revert on error
          setIsLiked(false);
          setLikesCount(prev => Math.max(0, prev - 1));
          throw error;
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription for likes
  useEffect(() => {
    const channel = supabase
      .channel(`like-changes-${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_likes',
        eq: { post_id: postId }
      }, async (payload) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (payload.eventType === 'INSERT') {
          setLikesCount(prev => prev + 1);
          if (payload.new.user_id === user?.id) {
            setIsLiked(true);
          }
        } else if (payload.eventType === 'DELETE') {
          setLikesCount(prev => Math.max(0, prev - 1));
          if (payload.old.user_id === user?.id) {
            setIsLiked(false);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase]);

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill={isLiked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isLiked ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span className="text-sm">{likesCount}</span>
    </button>
  );
}
