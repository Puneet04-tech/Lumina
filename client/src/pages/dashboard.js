'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { FileUploadCard } from '@/components/FileUploadCard';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { File, Trash2, RefreshCw, Upload, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const timer = setInterval(() => {
      if (start < value) {
        start += Math.ceil(value / 30);
        setDisplayValue(Math.min(start, value));
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return displayValue;
};

const PremiumStatCard = ({ title, value, icon: Icon, gradient, delay }) => (
  <div
    className="stat-card"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
        <p className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          <AnimatedCounter value={value} />
        </p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} opacity-20`}>
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
    </div>
    <div className="mt-4 h-1 w-full bg-gradient-to-r from-slate-700 to-transparent rounded-full" />
  </div>
);

export default function DashboardPage() {
  const [files, setFiles] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Reload data when returning from other pages
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadData = async () => {
    try {
      const [filesRes, dashboardsRes] = await Promise.all([
        api.get('/files'),
        api.get('/analysis/dashboards'),
      ]);
      setFiles(filesRes.data.files || []);
      setDashboards(dashboardsRes.data.dashboards || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await api.get('/files');
      setFiles(response.data.files || []);
      // Also reload dashboards when files are updated
      const dashboardsRes = await api.get('/analysis/dashboards');
      setDashboards(dashboardsRes.data.dashboards || []);
    } catch (error) {
      toast.error('Failed to load files');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await api.delete(`/files/${fileId}`);
        setFiles(files.filter((f) => f._id !== fileId));
        toast.success('File deleted');
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Header */}
          <div className="mb-16 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0" style={{ animation: 'slideInUp 0.8s ease-out' }}>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-slate-400 text-lg">Upload and analyze your data with enterprise-grade AI</p>
            </div>
            <button
              onClick={loadData}
              className="btn btn-primary flex items-center gap-2 px-6 py-3 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
              style={{ animation: 'slideInDown 0.8s ease-out' }}
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Stats
            </button>
          </div>

          {/* Stats - Premium Animated */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" style={{ animation: 'slideInUp 0.8s ease-out 0.1s both' }}>
            <PremiumStatCard
              title="Files Uploaded"
              value={files.length}
              icon={Upload}
              gradient="from-indigo-400 to-blue-400"
              delay={0}
            />
            <PremiumStatCard
              title="Dashboards Created"
              value={dashboards.length}
              icon={BarChart3}
              gradient="from-purple-400 to-pink-400"
              delay={0.1}
            />
            <PremiumStatCard
              title="Analyses Saved"
              value={dashboards.length}
              icon={TrendingUp}
              gradient="from-pink-400 to-rose-400"
              delay={0.2}
            />
          </div>

          {/* Upload Section */}
          <div className="mb-16" style={{ animation: 'slideInUp 0.8s ease-out 0.2s both' }}>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent mb-6">
              Upload New File
            </h2>
            <FileUploadCard onUploadSuccess={() => loadFiles()} />
          </div>

          {/* Files List */}
          <div style={{ animation: 'slideInUp 0.8s ease-out 0.3s both' }}>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6">
              Your Files
            </h2>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="premium-card text-center py-16">
                <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 text-lg">No files uploaded yet. Start by uploading a CSV file above.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {files.map((file, idx) => (
                  <div
                    key={file._id}
                    className="premium-card flex items-center justify-between group hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    style={{ animation: `slideInUp 0.6s ease-out ${0.4 + idx * 0.05}s both` }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                        <File className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {file.originalName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          <span className="text-indigo-400 font-semibold">{file.rowCount}</span> rows •{' '}
                          <span className="text-purple-400 font-semibold">{file.columns.length}</span> columns •{' '}
                          <span className="text-pink-400 font-semibold">{formatFileSize(file.size)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/analysis/${file._id}`}
                        className="btn btn-primary px-6 py-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      >
                        Analyze
                      </Link>
                      <button
                        onClick={() => handleDeleteFile(file._id)}
                        className="btn btn-danger px-4 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
