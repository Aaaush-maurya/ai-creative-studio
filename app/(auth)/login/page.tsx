"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-12">
      <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-slate-200/60">
        <h2 className="text-3xl font-bold mb-2 text-slate-900">Welcome Back</h2>
        <p className="text-sm text-slate-600 mb-6">Sign in to continue creating</p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input 
              id="email"
              type="email"
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }} 
              placeholder="you@example.com" 
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }} 
              placeholder="••••••••" 
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-300 disabled:to-purple-300 disabled:cursor-not-allowed text-white font-medium p-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <p className="text-sm mt-6 text-center text-slate-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
