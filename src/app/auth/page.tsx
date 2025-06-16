"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { supabaseBrowser } from "@/utils/supabaseBrowser";

function AuthPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp && (!fullName.trim() || !college.trim())) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const authFn = isSignUp
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });

      const { data, error } = await authFn;

      if (error) throw error;

      if (isSignUp && data.user) {
        // Save full name; college will be chosen on next page
        await supabase
          .from("users")
          .update({ full_name: fullName })
          .eq("id", data.user.id);
        router.push("/select-college");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <div className="w-full max-w-sm space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h1 className="text-2xl font-bold">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {isSignUp && (
          <input
            type="text"
            placeholder="Full name"
            className="border p-2 rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        {isSignUp && (
          <input
            type="text"
            placeholder="College"
            className="border p-2 rounded"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />
        )}

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-foreground text-background py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Create account" : "Sign In"}
        </button>
      </form>
      <button
        className="text-sm underline"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}

export default dynamic(() => Promise.resolve(AuthPage), {
  ssr: false,
});
