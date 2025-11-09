"use client";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Generation } from "../../lib/types";

export default function GenerationsPage() {
  const [gens, setGens] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        setGens([]);
        setLoading(false);
        router.push('/login');
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error(fetchError);
        setError("Failed to load generations. Please try again.");
      } else {
        setGens((data as Generation[]) || []);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your generations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">My Generations</h2>
          <p className="text-sm text-slate-600">
            {gens.length === 0 ? "No generations yet" : `${gens.length} generation${gens.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {gens.length === 0 && !loading ? (
        <div className="bg-white/70 backdrop-blur-sm p-12 rounded-xl shadow-sm border border-slate-200/60 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No generations yet</h3>
          <p className="text-slate-600 mb-6">Start creating amazing images to see them here!</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Create Your First Image
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gens.map((g) => (
            <div 
              key={g.id} 
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                  src={g.image_url} 
                  alt={g.original_prompt || "Generated image"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Prompt</div>
                  <div className="text-sm text-slate-900 line-clamp-2">{g.original_prompt}</div>
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  {new Date(g.created_at).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <a 
                    href={g.image_url} 
                    download 
                    className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
