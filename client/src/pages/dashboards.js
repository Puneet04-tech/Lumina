'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { Trash2, Eye, Save } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      const response = await api.get('/analysis/dashboards');
      setDashboards(response.data.dashboards || []);
    } catch (error) {
      toast.error('Failed to load dashboards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (dashboardId) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await api.delete(`/analysis/dashboards/${dashboardId}`);
        setDashboards(dashboards.filter((d) => d._id !== dashboardId));
        toast.success('Dashboard deleted');
      } catch (error) {
        toast.error('Failed to delete dashboard');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Saved Dashboards</h1>
            <p className="text-slate-600">Manage your saved analysis dashboards</p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : dashboards.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-600 mb-4">No dashboards saved yet.</p>
              <Link href="/dashboard" className="btn-primary">
                Create Your First Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <div key={dashboard._id} className="card hover:shadow-lg transition">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{dashboard.name}</h3>
                    <p className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(dashboard.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {dashboard.insights && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {dashboard.insights}
                    </p>
                  )}

                  <div className="flex gap-2 mb-4">
                    <span className="badge bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                      {dashboard.charts?.length || 0} charts
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 btn btn-primary flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(dashboard._id)}
                      className="btn btn-danger p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
