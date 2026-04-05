'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Users, ShieldAlert } from 'lucide-react';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalDashboards: 0,
  });

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      toast.error('Unauthorized: Admin access only');
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    try {
      // In a real app, you would fetch admin stats from backend
      // For now, we'll show placeholder data
      setStats({
        totalUsers: 5,
        totalFiles: 12,
        totalDashboards: 8,
      });
    } catch (error) {
      toast.error('Failed to load admin stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">Manage system and users</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-blue-600 text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-slate-600 text-sm mt-2">Total Users</p>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="text-green-600 text-3xl font-bold">{stats.totalFiles}</div>
              <p className="text-slate-600 text-sm mt-2">Files Uploaded</p>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="text-purple-600 text-3xl font-bold">{stats.totalDashboards}</div>
              <p className="text-slate-600 text-sm mt-2">Dashboards Created</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">User Management</h2>
              </div>
              <p className="text-slate-600 mb-4">
                Manage user accounts, roles, and permissions
              </p>
              <button className="btn-primary" disabled>
                Coming Soon
              </button>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900">System Settings</h2>
              </div>
              <p className="text-slate-600 mb-4">
                Configure system-wide settings and API keys
              </p>
              <button className="btn-primary" disabled>
                Coming Soon
              </button>
            </div>
          </div>

          {/* Roles Info */}
          <div className="card mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">User Roles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900">Viewer</h3>
                <p className="text-sm text-slate-600 mt-2">
                  ✓ View dashboards<br/>
                  ✗ Edit files<br/>
                  ✗ Manage users
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900">Analyst</h3>
                <p className="text-sm text-slate-600 mt-2">
                  ✓ Upload files<br/>
                  ✓ Create dashboards<br/>
                  ✗ Manage users
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-slate-900">Admin</h3>
                <p className="text-sm text-slate-600 mt-2">
                  ✓ All analyst features<br/>
                  ✓ Manage users<br/>
                  ✓ System settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
