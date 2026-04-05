'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { FileUploadCard } from '@/components/FileUploadCard';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { File, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-slate-600">Upload and analyze your data with AI</p>
            </div>
            <button
              onClick={loadData}
              className="btn-primary flex items-center gap-2 p-2"
              title="Refresh stats"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <div className="text-indigo-600 text-3xl font-bold">{files.length}</div>
              <p className="text-slate-600 text-sm mt-2">Files Uploaded</p>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="text-purple-600 text-3xl font-bold">{dashboards.length}</div>
              <p className="text-slate-600 text-sm mt-2">Dashboards Created</p>
            </div>

            <div className="card bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <div className="text-pink-600 text-3xl font-bold">{dashboards.length}</div>
              <p className="text-slate-600 text-sm mt-2">Analyses Saved</p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Upload New File</h2>
            <FileUploadCard onUploadSuccess={() => loadFiles()} />
          </div>

          {/* Files List */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Files</h2>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-slate-600">No files uploaded yet. Start by uploading a CSV file above.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {files.map((file) => (
                  <div key={file._id} className="card flex items-center justify-between hover:shadow-md transition">
                    <div className="flex items-center gap-4 flex-1">
                      <File className="w-8 h-8 text-indigo-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{file.originalName}</h3>
                        <p className="text-sm text-slate-600">
                          {file.rowCount} rows • {file.columns.length} columns • {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/analysis/${file._id}`}
                        className="btn-primary"
                      >
                        Analyze
                      </Link>
                      <button
                        onClick={() => handleDeleteFile(file._id)}
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
      </div>
    </>
  );
}
