import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/Navbar';
import { QueryInput } from '@/components/QueryInput';
import { SaveDashboardModal } from '@/components/SaveDashboardModal';
import { ExportButton } from '@/components/ExportButton';
import {
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  AreaChartComponent,
} from '@/components/Charts';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, BarChart3, Save } from 'lucide-react';
import Link from 'next/link';
import { generateChartData, calculateStats, formatNumber } from '@/utils/helpers';

export default function AnalysisPage() {
  const router = useRouter();
  const { id: fileId } = router.query;
  
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [tableView, setTableView] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (fileId) {
      loadFile();
    }
  }, [fileId]);

  const loadFile = async () => {
    try {
      const response = await api.get(`/files/${fileId}`);
      setFile(response.data.file);
    } catch (error) {
      toast.error('Failed to load file');
      setTimeout(() => router.push('/dashboard'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateChart = (chartType) => {
    if (!file || !file.data || file.data.length === 0) {
      toast.error('No data to visualize');
      return;
    }

    const firstColumn = file.columns[0];
    const numericColumn = file.columns.find(
      (col) => typeof file.data[0][col] === 'number'
    );

    if (!firstColumn || !numericColumn) {
      toast.error('Unable to generate chart - need text and numeric columns');
      return;
    }

    const chartData = generateChartData(file.data, firstColumn, numericColumn);
    const stats = calculateStats(file.data, numericColumn);

    setAnalysisResults({
      type: chartType,
      data: chartData,
      stats,
      xAxis: firstColumn,
      yAxis: numericColumn,
    });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn btn-secondary p-2">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{file?.originalName}</h1>
                <p className="text-slate-600">Analyzing {file?.data?.length || 0} rows</p>
              </div>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Dashboard
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Analysis</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGenerateChart('bar')}
                className="btn bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              >
                📊 Bar Chart
              </button>
              <button
                onClick={() => handleGenerateChart('line')}
                className="btn bg-purple-50 text-purple-600 hover:bg-purple-100"
              >
                📈 Line Chart
              </button>
              <button
                onClick={() => handleGenerateChart('pie')}
                className="btn bg-pink-50 text-pink-600 hover:bg-pink-100"
              >
                🥧 Pie Chart
              </button>
              <button
                onClick={() => handleGenerateChart('area')}
                className="btn bg-green-50 text-green-600 hover:bg-green-100"
              >
                📉 Area Chart
              </button>
            </div>
          </div>

          {/* AI Query */}
          <div className="mb-8">
            <QueryInput fileId={fileId} onQueryResult={setAnalysisResults} />
          </div>

          {/* Results */}
          {analysisResults && (
            <div className="space-y-8 mb-8">
              {/* Chart */}
              <div className="card">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Visualization</h2>
                  <ExportButton
                    fileName={file?.originalName}
                    data={file?.data}
                    columns={file?.columns}
                  />
                </div>
                {analysisResults.type === 'bar' && (
                  <BarChartComponent
                    data={analysisResults.data}
                    xKey="name"
                    yKey="value"
                    title={`${analysisResults.yAxis} by ${analysisResults.xAxis}`}
                  />
                )}
                {analysisResults.type === 'line' && (
                  <LineChartComponent
                    data={analysisResults.data}
                    xKey="name"
                    yKey="value"
                    title={`${analysisResults.yAxis} Trend`}
                  />
                )}
                {analysisResults.type === 'pie' && (
                  <PieChartComponent
                    data={analysisResults.data}
                    nameKey="name"
                    valueKey="value"
                    title={`${analysisResults.yAxis} Distribution`}
                  />
                )}
                {analysisResults.type === 'area' && (
                  <AreaChartComponent
                    data={analysisResults.data}
                    xKey="name"
                    yKey="value"
                    title={`${analysisResults.yAxis} Over Time`}
                  />
                )}
              </div>

              {/* Statistics */}
              {analysisResults.stats && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Statistics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-indigo-600 text-sm font-medium">Count</p>
                      <p className="text-2xl font-bold text-indigo-900 mt-2">
                        {analysisResults.stats.count}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-purple-600 text-sm font-medium">Sum</p>
                      <p className="text-2xl font-bold text-purple-900 mt-2">
                        {formatNumber(analysisResults.stats.sum)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <p className="text-pink-600 text-sm font-medium">Average</p>
                      <p className="text-2xl font-bold text-pink-900 mt-2">
                        {formatNumber(analysisResults.stats.average)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-green-600 text-sm font-medium">Max</p>
                      <p className="text-2xl font-bold text-green-900 mt-2">
                        {formatNumber(analysisResults.stats.max)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-orange-600 text-sm font-medium">Min</p>
                      <p className="text-2xl font-bold text-orange-900 mt-2">
                        {formatNumber(analysisResults.stats.min)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Table */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Data Preview</h2>
              <button onClick={() => setTableView(!tableView)} className="btn-secondary">
                {tableView ? '📊 Chart View' : '📋 Table View'}
              </button>
            </div>

            {file && file.data && file.data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      {file.columns.map((col) => (
                        <th key={col} className="px-4 py-3 text-left font-semibold text-slate-900">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {file.data.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        {file.columns.map((col) => (
                          <td key={`${idx}-${col}`} className="px-4 py-3 text-slate-600">
                            {formatNumber(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {file.data.length > 10 && (
                  <p className="text-sm text-slate-500 p-4">
                    Showing 10 of {file.data.length} rows
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveDashboardModal
        fileId={fileId}
        charts={analysisResults?.data || []}
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveSuccess={() => {
          toast.success('Dashboard saved! View it in Dashboards page');
        }}
      />
    </>
  );
}
