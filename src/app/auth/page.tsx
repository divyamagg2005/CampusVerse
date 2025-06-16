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
      <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen p-4 gap-6">
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
    <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <div className="absolute inset-0 gradient-overlay animate-gradientMove" aria-hidden="true"></div>
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-accent via-secondary to-success animate-textShine">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="Email"
          className="rounded-lg border border-transparent bg-white/80 dark:bg-gray-900/60 px-4 py-2 shadow-lg focus:outline-none focus:ring-4 focus:ring-accent/50 backdrop-blur-md placeholder:text-gray-400 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {isSignUp && (
          <input
            type="text"
            placeholder="Full name"
            className="rounded-lg border border-transparent bg-white/80 dark:bg-gray-900/60 px-4 py-2 shadow-lg focus:outline-none focus:ring-4 focus:ring-accent/50 backdrop-blur-md placeholder:text-gray-400 transition"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        {isSignUp && (
           <select
             value={college}
             onChange={(e) => setCollege(e.target.value)}
             className="rounded-lg border border-transparent bg-white/80 dark:bg-gray-900/60 px-4 py-2 shadow-lg focus:outline-none focus:ring-4 focus:ring-accent/50 backdrop-blur-md placeholder:text-gray-400 transition"
             required
           >
             <option value="" disabled>Select your college</option>
             <option value="Stanford University">Stanford University</option>
             <option value="MIT">MIT</option>
             <option value="Harvard University">Harvard University</option>
             <option value="IIT Bombay">IIT Bombay</option>
             <option value="Delhi University">Delhi University</option>
             <option value="Other">Other</option>
           </select>
         )}

        <input
          type="password"
          placeholder="Password"
          className="rounded-lg border border-transparent bg-white/80 dark:bg-gray-900/60 px-4 py-2 shadow-lg focus:outline-none focus:ring-4 focus:ring-accent/50 backdrop-blur-md placeholder:text-gray-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="relative bg-gradient-to-r from-accent via-secondary to-success text-background py-2 rounded-lg shadow-xl hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-primary/50 active:scale-95 disabled:opacity-50 transition-transform"
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Create account" : "Sign In"}
        </button>
      </form>
      <button
        className="text-sm underline text-primary hover:text-accent transition-colors"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </button>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(AuthPage), {
  ssr: false,
});
