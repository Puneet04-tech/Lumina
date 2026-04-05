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
    <nav className="sticky top-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-indigo-500/30 shadow-2xl backdrop-blur-md z-40"
      style={{ boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/dashboard" 
            className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2 hover:scale-110 transition-transform"
          >
            <Sparkles className="w-8 h-8 text-indigo-400 animate-bounce" style={{ animationDuration: '2s' }} />
            Lumina
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="text-slate-300 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group"
            >
              <span className="w-2 h-2 bg-indigo-400 rounded-full scale-0 group-hover:scale-100 transition-transform" />
              Dashboard
            </Link>
            <Link 
              href="/dashboards" 
              className="text-slate-300 hover:text-purple-400 transition-colors font-medium flex items-center gap-2 group"
            >
              <BarChart3 className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Dashboards
            </Link>
            <div className="text-slate-400 text-sm bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-4 py-2 rounded-lg border border-indigo-400/30">
              Welcome, <span className="text-indigo-300 font-bold">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 btn btn-primary px-6 py-2 font-bold shadow-lg hover:shadow-xl scale-100 hover:scale-105 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
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
          <div className="md:hidden pb-6 space-y-3 border-t border-slate-700/50 pt-4">
            <Link 
              href="/dashboard" 
              className="block px-4 py-3 text-slate-300 hover:text-indigo-300 hover:bg-slate-700/50 rounded-lg transition-all font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboards" 
              className="block px-4 py-3 text-slate-300 hover:text-purple-300 hover:bg-slate-700/50 rounded-lg transition-all font-medium flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboards
            </Link>
            <div className="px-4 py-2 text-slate-400 text-sm">Welcome, <span className="text-indigo-300 font-bold">{user?.name}</span></div>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full btn btn-danger py-3 font-bold text-sm"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
