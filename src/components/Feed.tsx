"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";
import { useRouter } from "next/navigation";

import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  anonymous: boolean;
  user_id: string;
  profiles?: {
    email: string;
  };
  likes_count?: number;
  liked_by_me?: boolean;
}

export default function Feed() {
  const { session } = useSessionContext();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Get user's college
        const { data: profiles, error: profileErr } = await supabase
          .from("users")
          .select("college")
          .eq("id", session.user.id);
          
        if (profileErr) {
          throw new Error(profileErr.message || "Could not load your profile");
        }

        // Handle case where no profile or multiple profiles exist
        if (!profiles || profiles.length === 0) {
          // Create a default profile if none exists
          const { error: createErr } = await supabase
            .from('users')
            .upsert({ 
              id: session.user.id, 
              email: session.user.email,
              college: null 
            });
            
          if (createErr) throw createErr;
          
          router.push("/select-college");
          setLoading(false);
          return;
        }
        
        const profile = profiles[0];
        
        if (!profile.college) {
          router.push("/select-college");
          setLoading(false);
          return;
        }

        // 2. First, get the user's college
        const college = profile.college;
        
        // 3. Fetch posts for the user's college
        const { data, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('college', college)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (postsError) throw postsError;
        
        // 4. Get unique user IDs from posts
        const userIds = [...new Set(data.map(post => post.user_id))];
        
        // 5. Fetch user emails in a single query
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds);
          
        if (usersError) throw usersError;
        
        // 6. Create a map of user IDs to emails
        const userMap = new Map(usersData.map(user => [user.id, user.email]));
        
        // 7. Fetch likes info
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id, user_id');

        const likesMap = new Map<string, string[]>();
        likesData?.forEach(like => {
          const arr = likesMap.get(like.post_id) || [];
          arr.push(like.user_id);
          likesMap.set(like.post_id, arr);
        });

        // 8. Combine posts with user emails and likes
        const postsWithEmails = data.map(post => {
          const likeUsers = likesMap.get(post.id) || [];
          return {
            ...post,
            likes_count: likeUsers.length,
            liked_by_me: likeUsers.includes(session.user.id),
            profiles: {
              email: userMap.get(post.user_id) || 'unknown@example.com'
            }
          };
        });
        
        // 9. Update the posts state with the combined data
        setPosts(postsWithEmails as unknown as Post[]);
        
      } catch (err: any) {
        console.error("Error fetching posts:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
          cause: err.cause
        });
        setError("Failed to load posts. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('realtime posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, () => {
        fetchPosts(); // Refresh posts when new ones are added
      })
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, supabase]);

  if (!session) {
    return <p className="text-center text-sm text-gray-600">Sign in to view the feed.</p>;
  }

  if (loading) return <p className="text-center">Loading feed...</p>;
  if (error) return <p className="text-center text-red-600 text-sm">{error}</p>;
  if (!posts.length) return <p className="text-center text-sm">No posts yet.</p>;

  return (
    <ul className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {posts.map((post) => (
        <li
          key={post.id}
          className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
            <span className="font-medium">
              {post.profiles?.email || 'Unknown User'}
            </span>
            <span className="text-xs">
              {new Intl.DateTimeFormat("default", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(post.created_at))}
            </span>
          </div>
          <p className="whitespace-pre-line mb-3 text-gray-800 dark:text-gray-200">{post.content}</p>
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt="Post image"
              className="max-h-96 w-full object-contain rounded-lg border border-gray-200 dark:border-gray-700"
            />
          )}
          
          {/* Like and Comment Actions */}
          <div className="mt-3 flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-gray-700">
            <LikeButton 
              postId={post.id} 
              initialLikesCount={post.likes_count || 0} 
              initialLiked={post.liked_by_me || false} 
            />
            <button 
              className={`flex items-center gap-1 ${openCommentsPostId === post.id ? 'text-blue-600' : 'text-gray-500'} hover:text-gray-700 dark:hover:text-gray-300`}
              onClick={(e) => {
                e.preventDefault();
                setOpenCommentsPostId(prev => prev === post.id ? null : post.id);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm">Comment</span>
            </button>
          </div>
          
          {/* Comment Section (toggle) */}
          {openCommentsPostId === post.id && (
            <div className="mt-2">
              <CommentSection 
                postId={post.id} 
                initialComments={[]} 
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
