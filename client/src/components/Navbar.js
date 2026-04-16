import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LogOut, Menu, X, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl border-b"
      style={{
        background: 'linear-gradient(to right, rgba(15, 20, 25, 0.9), rgba(30, 27, 75, 0.8), rgba(15, 20, 25, 0.9))',
        borderColor: 'rgba(99, 102, 241, 0.2)',
        boxShadow: '0 4px 30px rgba(99, 102, 241, 0.15)'
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-3 hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-200" />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Lumina
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="relative text-slate-300 hover:text-indigo-300 transition-colors font-medium group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100" />
                Dashboard
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-transparent group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/dashboards" 
              className="relative text-slate-300 hover:text-purple-300 transition-colors font-medium group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-125" />
                Dashboards
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-transparent group-hover:w-full transition-all duration-300" />
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-400/30 backdrop-blur-sm hover:border-indigo-300/60 transition-colors">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse" />
              <span className="text-sm text-slate-300">Welcome, <span className="text-indigo-300 font-bold">{user?.name}</span></span>
            </div>
            <button
              onClick={handleLogout}
              className="group relative overflow-hidden px-6 py-2 font-bold transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2 text-white group-hover:text-indigo-200 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-indigo-500/20 rounded-lg transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-indigo-400" />
            ) : (
              <Menu className="w-6 h-6 text-indigo-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-3 border-t border-indigo-400/20 pt-4 bg-gradient-to-b from-transparent to-indigo-900/10">
            <Link 
              href="/dashboard" 
              className="block px-4 py-3 text-slate-300 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-all font-medium border border-transparent hover:border-indigo-400/30"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboards" 
              className="block px-4 py-3 text-slate-300 hover:text-purple-300 hover:bg-indigo-500/20 rounded-lg transition-all font-medium flex items-center gap-2 border border-transparent hover:border-purple-400/30"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboards
            </Link>
            <div className="px-4 py-3 text-slate-400 text-sm bg-indigo-600/20 rounded-lg border border-indigo-400/20">Welcome, <span className="text-indigo-300 font-bold">{user?.name}</span></div>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-600/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
