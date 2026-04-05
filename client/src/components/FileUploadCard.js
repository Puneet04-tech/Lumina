'use client';

import { useState, useRef } from 'react';
import { Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function FileUploadCard({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
        toast.success('File uploaded successfully!');
        onUploadSuccess(data.file);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload error: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`card rounded-lg border-2 border-dashed transition-all cursor-pointer ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-300 hover:border-indigo-400'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files && uploadFile(e.target.files[0])}
        className="hidden"
      />

      <div className="text-center py-12">
        {isUploading ? (
          <>
            <Loader className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600 font-medium">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Drop your CSV file here
            </h3>
            <p className="text-slate-600 mb-4">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Browse Files
            </button>
            <p className="text-sm text-slate-500 mt-4">CSV files only, up to 50MB</p>
          </>
        )}
      </div>
    </div>
  );
}
