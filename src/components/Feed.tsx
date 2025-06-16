"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";
import { useRouter } from "next/navigation";

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
}

export default function Feed() {
  const { session } = useSessionContext();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // 7. Combine posts with user emails
        const postsWithEmails = data.map(post => ({
          ...post,
          profiles: {
            email: userMap.get(post.user_id) || 'unknown@example.com'
          }
        }));
        
        // 8. Update the posts state with the combined data
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
    <ul className="flex flex-col gap-6 w-full max-w-xl">
      {posts.map((post) => (
        <li
          key={post.id}
          className="border rounded-lg p-4 bg-white dark:bg-black/20 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
            <span>{post.anonymous ? "Anonymous" : "By a fellow student"}</span>
            <span>
              {new Intl.DateTimeFormat("default", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(post.created_at))}
            </span>
          </div>
          <p className="whitespace-pre-line mb-3">{post.content}</p>
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt="Post image"
              className="max-h-80 w-full object-contain rounded"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
