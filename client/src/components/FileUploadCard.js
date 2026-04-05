'use client';

import { useState, useRef } from 'react';
import { Upload, Loader, CheckCircle, AlertCircle, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';

export function FileUploadCard({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        toast.success('File uploaded successfully!');
        onUploadSuccess(data.file);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload error: ' + error.message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`premium-card rounded-xl border-2 border-dashed transition-all duration-500 cursor-pointer group overflow-hidden relative ${
        isDragging
          ? 'border-indigo-400 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 shadow-2xl scale-105'
          : 'border-indigo-500/30 hover:border-indigo-400/70'
      }`}
      style={{
        animation: isDragging ? 'pulse-glow 1s ease-in-out infinite' : 'none',
      }}
    >
      {/* Progress Bar */}
      {isUploading && uploadProgress > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" 
          style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }} />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files && uploadFile(e.target.files[0])}
        className="hidden"
      />

      <div className="text-center py-16">
        {isUploading ? (
          <>
            <div className="relative w-16 h-16 mx-auto mb-6">
              <Loader className="w-16 h-16 text-indigo-400 animate-spin absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-300">{uploadProgress}%</span>
              </div>
            </div>
            <p className="text-slate-300 font-bold text-lg mb-2">Uploading Your Data</p>
            <p className="text-slate-400 text-sm">Please wait while we process your file...</p>
          </>
        ) : (
          <>
            <div className="mb-6 group-hover:scale-110 transition-transform">
              <div className="relative inline-block">
                <Cloud className="w-16 h-16 text-indigo-400 group-hover:text-purple-400 transition-colors animate-bounce" style={{ animationDuration: '2s' }} />
                <Upload className="w-6 h-6 text-indigo-300 absolute -bottom-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform">
              Upload Your CSV Data
            </h3>
            <p className="text-slate-400 mb-6 font-medium">Drop your file here or click to browse</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary px-8 py-3 font-bold text-base shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all inline-block"
            >
              📁 Browse Files
            </button>
            <p className="text-sm text-slate-400 mt-6 font-semibold">
              💾 CSV files only • 📦 Up to 50MB
            </p>
            <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Ready for upload
            </div>
          </>
        )}
      </div>
    </div>
  );
}
