"use client";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { User } from "../lib/types";

type Props = { user: User | null }

export default function PromptForm({ user }: Props) {
  const [prompt, setPrompt] = useState("");
  const [enhanced, setEnhanced] = useState<string | null>(null);
  const [loadingEnhance, setLoadingEnhance] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enhancePrompt() {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoadingEnhance(true);
    setError(null);
    try {
      const res = await axios.post('/api/enhance', { prompt });
      const enhancedText = res.data?.enhanced;
      if (enhancedText) {
        setEnhanced(enhancedText);
        setPrompt(enhancedText);
      } else {
        setError('Failed to enhance prompt. Please try again.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || 'Failed to enhance prompt. Please try again.');
      console.error(err);
    } finally {
      setLoadingEnhance(false);
    }
  }

  async function generateImage() {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoadingGen(true);
    setImageUrl(null);
    setError(null);
    try {
      const res = await axios.post('/api/generate', { prompt, userId: user?.id, save: true });
      const imageUrl = res.data?.imageUrl;
      if (imageUrl) {
        setImageUrl(imageUrl);
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || 'Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setLoadingGen(false);
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200/60">
      <div className="mb-6">
        <label htmlFor="prompt" className="block mb-2 text-sm font-semibold text-slate-700">
          Describe what you want to generate
        </label>
        <textarea 
          id="prompt"
          className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none" 
          rows={5} 
          value={prompt} 
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          placeholder="Describe your restaurant image... (e.g., 'a gourmet burger with crispy fries on a wooden table', 'cozy Italian restaurant interior with warm lighting', 'fresh sushi platter on a modern plate')"
        />
        {enhanced && enhanced !== prompt && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-1">Enhanced prompt:</p>
            <p className="text-sm text-blue-800">{enhanced}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={enhancePrompt} 
          disabled={loadingEnhance || loadingGen || !prompt.trim()} 
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {loadingEnhance ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enhancing...</span>
            </>
          ) : (
            "✨ Enhance Prompt"
          )}
        </button>
        <button 
          onClick={generateImage} 
          disabled={loadingGen || loadingEnhance || !prompt.trim()} 
          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-300 disabled:to-purple-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {loadingGen ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            "🎨 Generate Image"
          )}
        </button>
      </div>

      {imageUrl && (
        <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl border border-slate-200/60">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Your Restaurant Image</h3>
          <div className="relative rounded-lg overflow-hidden shadow-lg bg-white p-2">
            <img 
              src={imageUrl} 
              alt="Generated restaurant image" 
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a 
              href={imageUrl} 
              download 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              📥 Download
            </a>
            <Link 
              href="/generations" 
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-200 transition-colors shadow-sm hover:shadow-md"
            >
              🖼️ View in Gallery
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
