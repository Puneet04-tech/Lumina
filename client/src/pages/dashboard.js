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
    className="group relative h-32 rounded-xl overflow-hidden cursor-pointer"
    style={{ animationDelay: `${delay}s` }}
  >
    {/* Gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 opacity-90" />
    
    {/* Glowing border */}
    <div className="absolute inset-0 rounded-xl border border-indigo-500/30 group-hover:border-indigo-400/60 transition-all duration-300" />
    
    {/* Hover glow effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ 
        background: `radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`,
        animation: 'pulse 2s ease-in-out infinite'
      }} />
    
    {/* Content */}
    <div className="relative z-10 h-full flex items-center justify-between p-6">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
        <p className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          <AnimatedCounter value={value} />
        </p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}>
        <Icon className="w-8 h-8 text-slate-300 group-hover:text-slate-200 transition-colors" />
      </div>
    </div>

    {/* Bottom accent line */}
    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-500" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
        {/* Animated Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Header */}
          <div className="mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div style={{ animation: 'slideInUp 0.8s ease-out' }}>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
                Dashboard
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <div className="accent-line" />
                <p className="text-slate-400 text-lg">Upload and analyze your data with AI-powered insights</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="group relative overflow-hidden px-6 py-3 font-bold text-white rounded-lg transition-all duration-300 whitespace-nowrap"
              style={{ animation: 'slideInDown 0.8s ease-out' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-2">
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Refresh Stats
              </div>
            </button>
          </div>

          {/* Stats - Premium Animated */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" style={{ animation: 'slideInUp 0.8s ease-out 0.1s both' }}>
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
            <h2 className="section-heading">
              Upload New File
            </h2>
            <FileUploadCard onUploadSuccess={() => loadFiles()} />
          </div>

          {/* Files List */}
          <div style={{ animation: 'slideInUp 0.8s ease-out 0.3s both' }}>
            <h2 className="section-heading">
              Your Files
            </h2>
            {isLoading ? (
              <div className="text-center py-20">
                <div className="spinner-premium mx-auto mb-4"></div>
                <p className="text-slate-400 font-medium">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="premium-card text-center py-20 border-2 border-dashed border-indigo-400/50">
                <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 text-lg font-medium">No files uploaded yet</p>
                <p className="text-slate-500 text-sm">Upload a CSV file above to get started with AI analysis</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {files.map((file, idx) => (
                  <div
                    key={file._id}
                    className="file-card flex items-center justify-between"
                    style={{ animation: `slideInUp 0.6s ease-out ${0.4 + idx * 0.05}s both` }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="file-card-icon">
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
                    <div className="flex gap-3 flex-shrink-0">
                      <Link
                        href={`/analysis/${file._id}`}
                        className="group relative overflow-hidden px-6 py-2 font-bold text-white rounded-lg transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">Analyze</div>
                      </Link>
                      <button
                        onClick={() => handleDeleteFile(file._id)}
                        className="group relative overflow-hidden px-4 py-2 font-bold text-white rounded-lg transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <Trash2 className="w-5 h-5" />
                        </div>
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
