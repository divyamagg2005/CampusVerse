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
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 bg-black/20 backdrop-blur-xl rounded-3xl p-10 border border-white/10">
          <div className="space-y-4">
            <div className="h-8 bg-white/10 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-white/8 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-white/8 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-white/8 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-white/8 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs with darker theme */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#80ED99]/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-[#57CC99]/15 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#38A3A5]/8 rounded-full blur-2xl animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-[#80ED99]/12 rounded-full blur-lg animate-bounce delay-300"></div>
        
        {/* Enhanced Geometric Shapes */}
        <div className="absolute top-1/3 left-1/4 w-8 h-8 border-2 border-[#80ED99]/30 rotate-45 animate-spin"></div>
        <div className="absolute top-1/2 right-1/3 w-6 h-6 bg-[#57CC99]/20 transform rotate-12 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/2 w-10 h-10 border border-[#38A3A5]/40 rounded-full animate-ping"></div>
        
        {/* Additional dark theme elements */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 border border-[#80ED99]/20 transform rotate-45 animate-spin delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-[#57CC99]/30 rounded-full animate-bounce delay-700"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(128, 237, 153, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md transform transition-all duration-700 hover:scale-105">
          {/* Enhanced Glass Card with darker theme */}
          <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Enhanced Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#80ED99]/5 via-[#57CC99]/5 to-[#38A3A5]/5 rounded-3xl blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-3xl"></div>
            
            <div className="relative z-10">
              {/* Animated Title */}
              <div className="text-center mb-10 relative">
                {/* Decorative elements around title */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <div className="w-2 h-2 bg-[#80ED99] rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-[#57CC99] rounded-full animate-ping delay-100"></div>
                  <div className="w-2 h-2 bg-[#38A3A5] rounded-full animate-ping delay-200"></div>
                </div>
                
                {/* Main title with enhanced styling */}
                <div className="relative">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-[#80ED99] via-[#57CC99] to-[#38A3A5] bg-clip-text text-transparent mb-3 relative z-10 animate-pulse">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h1>
                  
                  {/* Glowing text shadow effect */}
                  <div className="absolute inset-0 text-5xl font-black text-[#80ED99]/20 blur-lg animate-pulse delay-300">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </div>
                </div>
                
                {/* Subtitle */}
                <p className="text-white/70 text-sm mb-4 animate-fadeIn delay-500">
                  {isSignUp ? "Join our community today" : "Sign in to continue your journey"}
                </p>
                
                {/* Animated decorative line */}
                <div className="relative mx-auto w-32 h-1 bg-gradient-to-r from-transparent via-[#80ED99] to-transparent rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#80ED99] to-[#57CC99] animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#57CC99] to-[#38A3A5] animate-ping opacity-75"></div>
                </div>
                
                {/* Floating particles around title */}
                <div className="absolute -top-4 -left-4 w-1 h-1 bg-[#80ED99] rounded-full animate-bounce delay-700"></div>
                <div className="absolute -top-2 -right-6 w-1 h-1 bg-[#57CC99] rounded-full animate-bounce delay-1000"></div>
                <div className="absolute -bottom-2 -left-8 w-1 h-1 bg-[#38A3A5] rounded-full animate-bounce delay-300"></div>
                <div className="absolute -bottom-4 -right-4 w-1 h-1 bg-[#80ED99] rounded-full animate-bounce delay-900"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-[#80ED99]/60 focus:bg-black/30 transition-all duration-300 group-hover:border-[#57CC99]/40 group-hover:bg-black/25"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#80ED99]/10 to-[#57CC99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-lg"></div>
                </div>

                {/* Full Name Input (Sign Up Only) */}
                {isSignUp && (
                  <div className="relative group transform transition-all duration-500 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-[#80ED99]/60 focus:bg-black/30 transition-all duration-300 group-hover:border-[#57CC99]/40 group-hover:bg-black/25"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#80ED99]/10 to-[#57CC99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-lg"></div>
                  </div>
                )}

                {/* College Select (Sign Up Only) */}
                {isSignUp && (
                  <div className="relative group transform transition-all duration-500 animate-fadeIn">
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#80ED99]/60 focus:bg-black/30 transition-all duration-300 group-hover:border-[#57CC99]/40 group-hover:bg-black/25 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled className="bg-[#1a1a2e] text-white/80">Select your college</option>
                      <option value="Stanford University" className="bg-[#1a1a2e] text-white">Stanford University</option>
                      <option value="MIT" className="bg-[#1a1a2e] text-white">MIT</option>
                      <option value="Harvard University" className="bg-[#1a1a2e] text-white">Harvard University</option>
                      <option value="IIT Bombay" className="bg-[#1a1a2e] text-white">IIT Bombay</option>
                      <option value="Delhi University" className="bg-[#1a1a2e] text-white">Delhi University</option>
                      <option value="Other" className="bg-[#1a1a2e] text-white">Other</option>
                    </select>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#80ED99]/10 to-[#57CC99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-lg"></div>
                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/50"></div>
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-[#80ED99]/60 focus:bg-black/30 transition-all duration-300 group-hover:border-[#57CC99]/40 group-hover:bg-black/25"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#80ED99]/10 to-[#57CC99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-lg"></div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 animate-shake backdrop-blur-sm">
                    <p className="text-red-300 text-sm text-center font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#80ED99] via-[#57CC99] to-[#38A3A5] text-[#1a1a2e] font-bold rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#80ED99]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#38A3A5] to-[#80ED99] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-lg">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      isSignUp ? "Create Account" : "Sign In"
                    )}
                  </span>
                </button>
              </form>

              {/* Toggle Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-white/80 hover:text-[#80ED99] transition-all duration-300 hover:scale-105 relative group"
                >
                  <span className="relative z-10">
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#80ED99] to-[#57CC99] group-hover:w-full transition-all duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default dynamic(() => Promise.resolve(AuthPage), {
  ssr: false,
});