'use client';

import { useState } from 'react';
import { Save, X, Loader } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export function SaveDashboardModal({ fileId, charts, isOpen, onClose, onSaveSuccess }) {
  const [name, setName] = useState('');
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a dashboard name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/analysis/dashboards', {
        name,
        fileId,
        charts,
        insights,
      });

      toast.success('Dashboard saved successfully!');
      onSaveSuccess(response.data.dashboard);
      setName('');
      setInsights('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Save Dashboard</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dashboard Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              placeholder="e.g., Sales Analysis Q1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Insights (Optional)
            </label>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              className="input-base h-24 resize-none"
              placeholder="Add key findings or notes..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
