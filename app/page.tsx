"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import PromptForm from "../components/PromptForm";
import { User } from "../lib/types";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login');
      } else {
        setUser(data.session.user as User);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setUser(sess?.user as User ?? null);
      if (!sess) router.push('/login');
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200/60">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-1">
            Welcome, <span className="text-indigo-600">{user?.email}</span>
          </h2>
          <p className="text-sm text-slate-600">Generate beautiful images for your restaurant - food, ambiance, menu items, and more</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </div>

      <PromptForm user={user} />
    </div>
  )
}
