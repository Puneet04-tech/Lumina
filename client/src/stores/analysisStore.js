import { create } from 'zustand';

export const useAnalysisStore = create((set) => ({
  files: [],
  currentFile: null,
  dashboards: [],
  currentDashboard: null,
  analysisResults: null,
  isLoading: false,

  setFiles: (files) => set({ files }),
  setCurrentFile: (file) => set({ currentFile: file }),
  setDashboards: (dashboards) => set({ dashboards }),
  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
  setAnalysisResults: (results) => set({ analysisResults: results }),
  setLoading: (isLoading) => set({ isLoading }),

  uploadFile: async (file) => {
    set({ isLoading: true });
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
        set({ currentFile: data.file });
        return data;
      }
      throw new Error(data.message);
    } finally {
      set({ isLoading: false });
    }
  },

  queryAnalysis: async (query) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ query, fileId: this.currentFile?._id }),
      });
      const data = await response.json();
      if (data.success) {
        set({ analysisResults: data.results });
        return data;
      }
      throw new Error(data.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
