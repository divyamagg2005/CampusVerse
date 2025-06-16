"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  email: string;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { session } = useSessionContext();
  const supabase = supabaseBrowser();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching comments", error);
      return;
    }

    const commentsData = data as unknown as Comment[];
    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    const { data: usersData, error: usersErr } = await supabase
      .from("users")
      .select("id, email")
      .in("id", userIds);
    if (usersErr) {
      console.error("Error fetching comment user emails", usersErr);
    }
    const userMap = new Map((usersData || []).map(u => [u.id, u.email]));

    const enriched = commentsData.map(c => ({
      ...c,
      email: userMap.get(c.user_id) || "unknown@example.com"
    }));
    setComments(enriched);
  };

  useEffect(() => {
    fetchComments();
    // realtime
    const channel = supabase.channel("realtime comments");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` },
      () => fetchComments()
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const addComment = async () => {
    if (!session) {
      alert("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: session.user.id,
      content: newComment.trim(),
    });
    if (error) {
      console.error("Error adding comment", error);
      alert("Failed to add comment");
    }
    setNewComment("");
    setLoading(false);
  };

  return (
    <div className="mt-4 border-t pt-2">
      <h4 className="text-sm font-semibold mb-2">Comments ({comments.length})</h4>
      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="text-sm">
            <span className="font-semibold mr-1">{c.email}</span>
            <span>{c.content}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded p-1 text-sm"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={addComment}
          disabled={loading || !newComment.trim()}
          className="px-2 py-1 text-sm bg-foreground text-background rounded disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>
  );
}
