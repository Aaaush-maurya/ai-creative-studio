import '../styles/globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Restaurant Image Generator',
  description: 'Generate stunning images for your restaurant - food, ambiance, menu items, and more'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 min-h-screen">
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between py-6 border-b border-slate-200/60 backdrop-blur-sm bg-white/50 sticky top-0 z-10">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all">
              Restaurant Image Generator
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                Home
              </Link>
              <Link href="/generations" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                My Generations
              </Link>
            </nav>
          </header>
          <main className="py-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
