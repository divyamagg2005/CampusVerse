"use client";

import { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const { session } = useSessionContext();
  const supabase = supabaseBrowser();

  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!session) {
      alert("Please sign in to like posts");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        // remove like
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .match({ post_id: postId, user_id: session.user.id });
        if (error) throw error;
        setLiked(false);
        setCount((c) => c - 1);
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: session.user.id });
        if (error) {
          // ignore duplicate like
          if (error.code !== "23505") throw error;
        }
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Error toggling like", err);
      alert("Failed to update like. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="flex items-center gap-1 select-none disabled:opacity-50"
    >
      <span className={liked ? "text-red-600" : "text-gray-600"}>
        {liked ? "♥" : "♡"}
      </span>
      <span>{count}</span>
    </button>
  );
}
