"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";

export default function PostCreator() {
  const { session } = useSessionContext();
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return (
      <p className="text-center text-sm text-gray-600">
        Please sign in to create a post.
      </p>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    let imageUrl: string | null = null;
    try {
      // 1. Upload image if exists
      if (imageFile) {
        try {
          const filePath = `${session.user.id}/${Date.now()}_${imageFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("post-images")
            .getPublicUrl(filePath);
            
          imageUrl = publicUrl;
        } catch (uploadErr: any) {
          console.error("Image upload failed:", uploadErr);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // 2. Get user's college
      const { data: profile, error: profileErr } = await supabase
        .from("users")
        .select("college")
        .eq("id", session.user.id)
        .single();
        
      if (profileErr || !profile) {
        console.error("Profile fetch failed:", profileErr);
        throw new Error("Could not load your profile. Please refresh and try again.");
      }

      if (!profile.college) {
        router.push("/select-college");
        setError("Please select your college first.");
        setLoading(false);
        return;
      }

      // 3. Create post
      const { error: insertErr } = await supabase
        .from("posts")
        .insert({
          user_id: session.user.id,
          content: content.trim(),
          image_url: imageUrl,
          college: profile.college,
          anonymous,
        });

      if (insertErr) {
        console.error("Post creation failed:", insertErr);
        throw insertErr;
      }

      // Reset form on success
      setContent("");
      setImageFile(null);
      setAnonymous(false);
      
      // Refresh the page to show new post
      window.location.reload();
      
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl bg-white dark:bg-black/20 border rounded-lg p-4 shadow-sm flex flex-col gap-4"
    >
      <textarea
        className="w-full border rounded p-2 resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-foreground/50"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="flex-1 cursor-pointer text-sm text-center sm:text-left">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <span className="inline-block px-4 py-2 border rounded w-full">
            {imageFile ? imageFile.name : "Upload Image"}
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4"
          />
          Post anonymously
        </label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="self-end bg-foreground text-background px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
