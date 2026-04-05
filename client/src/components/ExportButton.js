'use client';

import { useState } from 'react';
import { Download, FileJson, File as FileIcon } from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';
import toast from 'react-hot-toast';

export function ExportButton({ fileName, data, columns, chartImage = null }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      await exportToPDF(fileName, data, columns, chartImage);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      await exportToExcel(fileName, data, columns);
      toast.success('Excel exported successfully!');
    } catch (error) {
      toast.error('Failed to export Excel: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonString = JSON.stringify({ columns, data }, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('JSON exported successfully!');
    } catch (error) {
      toast.error('Failed to export JSON: ' + error.message);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleExportPDF}
        disabled={isLoading}
        className="btn btn-secondary flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {isLoading ? 'Exporting...' : 'PDF'}
      </button>
      <button
        onClick={handleExportExcel}
        disabled={isLoading}
        className="btn btn-secondary flex items-center gap-2"
      >
        <FileIcon className="w-4 h-4" />
        {isLoading ? 'Exporting...' : 'Excel'}
      </button>
      <button
        onClick={handleExportJSON}
        disabled={isLoading}
        className="btn btn-secondary flex items-center gap-2"
      >
        <FileJson className="w-4 h-4" />
        JSON
      </button>
    </div>
  );
}
