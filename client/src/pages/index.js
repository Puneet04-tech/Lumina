'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-3xl font-bold text-white">✨ Lumina</div>
        <div className="flex gap-4">
          <Link href="/login" className="btn btn-secondary">
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          AI-Powered Data Analytics Dashboard
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-indigo-100 max-w-2xl mx-auto">
          Transform your CSV files into actionable insights with AI. Upload, analyze, visualize all in one place.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/register" className="btn bg-white text-indigo-600 hover:bg-slate-50 px-8 py-3">
            Get Started Free
          </Link>
          <Link href="/login" className="btn bg-indigo-500 text-white hover:bg-indigo-700 px-8 py-3">
            Sign In
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-left border border-white/20">
            <div className="text-4xl mb-4">📤</div>
            <h3 className="text-xl font-bold mb-2">Easy Upload</h3>
            <p className="text-indigo-100">Upload CSV files in seconds and start analyzing immediately.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-left border border-white/20">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Powered</h3>
            <p className="text-indigo-100">Ask questions in natural language and get instant insights.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-left border border-white/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Rich Visualizations</h3>
            <p className="text-indigo-100">Beautiful, animated charts that tell your data story.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
