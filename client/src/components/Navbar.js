'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ✨ Lumina
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-slate-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 btn-secondary"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <p className="text-slate-600 px-4">Welcome, {user?.name}</p>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 btn-secondary"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
