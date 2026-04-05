import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/Navbar';
import { QueryInput } from '@/components/QueryInput';
import { SaveDashboardModal } from '@/components/SaveDashboardModal';
import { ExportButton } from '@/components/ExportButton';
import { AdvancedInsights } from '@/components/AdvancedInsights';
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
  const chartRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [tableView, setTableView] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [chartDisplayType, setChartDisplayType] = useState('bar');

  const captureChartAsImage = async () => {
    if (!chartRef.current) return null;
    
    try {
      // Use html2canvas if available, otherwise use canvas API
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing chart:', error);
      return null;
    }
  };

  useEffect(() => {
    if (fileId) {
      loadFile();
    }
  }, [fileId]);

  useEffect(() => {
    if (analysisResults && !analysisResults.type) {
      // For AI query results, default to bar chart
      setChartDisplayType('bar');
    }
  }, [analysisResults]);

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

  const handleGenerateChart = async (chartType) => {
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

    // Get advanced analysis via API
    try {
      toast.loading('Generating analysis...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ 
          query: `Analyze ${numericColumn} by ${firstColumn}`,
          fileId 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update chart type in results
        setAnalysisResults({
          ...data.results,
          type: chartType,
        });
        setChartDisplayType(chartType);
        toast.dismiss();
        toast.success('Analysis generated!');
      } else {
        // Fallback to local generation
        const chartData = generateChartData(file.data, firstColumn, numericColumn);
        const stats = calculateStats(file.data, numericColumn);

        setAnalysisResults({
          type: chartType,
          data: chartData,
          stats,
          xAxis: firstColumn,
          yAxis: numericColumn,
          insights: {
            insight: `Top performing values of ${numericColumn}`,
            summary: `Showing ${chartData.length} categories with total value of ${stats.sum}`,
            recommendation: `Average value is ${stats.average}. Look for opportunities above the average threshold.`,
            chartType: chartType,
            confidence: 0.85,
          },
        });
        setChartDisplayType(chartType);
        toast.dismiss();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to local generation
      const chartData = generateChartData(file.data, firstColumn, numericColumn);
      const stats = calculateStats(file.data, numericColumn);

      setAnalysisResults({
        type: chartType,
        data: chartData,
        stats,
        xAxis: firstColumn,
        yAxis: numericColumn,
        insights: {
          insight: `Top performing values of ${numericColumn}`,
          summary: `Showing ${chartData.length} categories with total value of ${stats.sum}`,
          recommendation: `Average value is ${stats.average}. Look for opportunities above the average threshold.`,
          chartType: chartType,
          confidence: 0.85,
        },
      });
      setChartDisplayType(chartType);
      toast.dismiss();
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 animate-slideInDown">
            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {file?.originalName}
                  </h1>
                  <p className="text-slate-400 mt-2">📊 {file?.data?.length || 0} records analyzed • Real-time insights</p>
                </div>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
              >
                <Save className="w-5 h-5" />
                Save Dashboard
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700/30 backdrop-blur-md">
                <p className="text-blue-300 text-sm font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-200 mt-2">{file?.data?.length || 0}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-700/30 backdrop-blur-md">
                <p className="text-purple-300 text-sm font-medium">Columns</p>
                <p className="text-2xl font-bold text-purple-200 mt-2">{file?.columns?.length || 0}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-900/30 to-pink-800/30 rounded-lg border border-pink-700/30 backdrop-blur-md">
                <p className="text-pink-300 text-sm font-medium">Status</p>
                <p className="text-2xl font-bold text-pink-200 mt-2">✓ Ready</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg border border-green-700/30 backdrop-blur-md">
                <p className="text-green-300 text-sm font-medium">Quality</p>
                <p className="text-2xl font-bold text-green-200 mt-2">100%</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 animate-slideInUp">
            <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-md">
              <h3 className="text-lg font-bold text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text mb-4">⚡ Quick Analysis</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleGenerateChart('bar')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105"
                >
                  📊 Bar Chart
                </button>
                <button
                  onClick={() => handleGenerateChart('line')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  📈 Line Chart
                </button>
                <button
                  onClick={() => handleGenerateChart('pie')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-105"
                >
                  🥧 Pie Chart
                </button>
                <button
                  onClick={() => handleGenerateChart('area')}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
                >
                  📉 Area Chart
                </button>
              </div>
            </div>
          </div>

          {/* AI Query */}
          <div className="mb-8 animate-slideInUp" style={{animationDelay: '0.1s'}}>
            <QueryInput fileId={fileId} onQueryResult={setAnalysisResults} />
          </div>

          {/* Results */}
          {analysisResults && (
            <div className="space-y-8 mb-8">
              {/* Chart Type Selector */}
              <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-md animate-slideInUp" style={{animationDelay: '0.2s'}}>
                <h3 className="text-lg font-bold text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text mb-4">📊 Chart Type</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setChartDisplayType('bar')}
                    className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                      chartDisplayType === 'bar'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                    }`}
                  >
                    📊 Bar Chart
                  </button>
                  <button
                    onClick={() => setChartDisplayType('line')}
                    className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                      chartDisplayType === 'line'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                    }`}
                  >
                    📈 Line Chart
                  </button>
                  <button
                    onClick={() => setChartDisplayType('pie')}
                    className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                      chartDisplayType === 'pie'
                        ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                    }`}
                  >
                    🥧 Pie Chart
                  </button>
                  <button
                    onClick={() => setChartDisplayType('area')}
                    className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                      chartDisplayType === 'area'
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                    }`}
                  >
                    📉 Area Chart
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-md animate-slideInUp" style={{animationDelay: '0.3s'}}>
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text">📊 Visualization</h2>
                  <ExportButton
                    fileName={file?.originalName}
                    data={file?.data}
                    columns={file?.columns}
                    analysisData={analysisResults}
                    onCaptureChart={captureChartAsImage}
                  />
                </div>
                <div ref={chartRef}>
                {chartDisplayType === 'bar' && (
                  <BarChartComponent
                    data={analysisResults.data}
                    xKey="name"
                    yKey="value"
                    title={`${analysisResults.yAxis} by ${analysisResults.xAxis}`}
                  />
                )}
                {chartDisplayType === 'line' && (
                  <LineChartComponent
                    data={analysisResults.data}
                    xKey="name"
                    yKey="value"
                    title={`${analysisResults.yAxis} Trend`}
                  />
                )}
                {chartDisplayType === 'pie' && (
                  <PieChartComponent
                    data={analysisResults.data}
                    nameKey="name"
                    valueKey="value"
                    title={`${analysisResults.yAxis} Distribution`}
                  />
                )}
                {chartDisplayType === 'area' && (
                  <AreaChartComponent
                    data={analysisResults.data}
                    xKey="name"
                    yKey="value"
                    title={`${analysisResults.yAxis} Over Time`}
                  />
                )}
                </div>
              </div>

              {/* AI Insights - Premium Custom Design */}
              {analysisResults.insights && (
                <div className="animate-slideInUp" style={{animationDelay: '0.4s'}}>
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text">Advanced Intelligence Analysis</h2>
                    </div>
                    <p className="text-slate-400 text-sm ml-4">Multi-dimensional insights with risk assessment & strategic recommendations</p>
                  </div>

                  {/* Risk & Metrics Badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {analysisResults.insights.riskLevel && (
                      <div className={`px-4 py-2 rounded-lg border backdrop-blur-sm flex items-center gap-2 ${
                        analysisResults.insights.riskLevel === 'Low Risk' ? 'bg-green-950/40 border-green-700/30' :
                        analysisResults.insights.riskLevel === 'Medium Risk' ? 'bg-amber-950/40 border-amber-700/30' :
                        'bg-red-950/40 border-red-700/30'
                      }`}>
                        <span className={`${
                          analysisResults.insights.riskLevel === 'Low Risk' ? 'text-green-300' :
                          analysisResults.insights.riskLevel === 'Medium Risk' ? 'text-amber-300' :
                          'text-red-300'
                        }`}>⚠️</span>
                        <span className={`${
                          analysisResults.insights.riskLevel === 'Low Risk' ? 'text-green-200' :
                          analysisResults.insights.riskLevel === 'Medium Risk' ? 'text-amber-200' :
                          'text-red-200'
                        } font-semibold text-sm`}>{analysisResults.insights.riskLevel}</span>
                      </div>
                    )}
                    {analysisResults.insights.concentration && (
                      <div className="px-4 py-2 bg-purple-950/40 border border-purple-700/30 rounded-lg backdrop-blur-sm">
                        <span className="text-purple-200 font-semibold text-sm">Distribution: <span className="text-purple-300 capitalize">{analysisResults.insights.concentration}</span></span>
                      </div>
                    )}
                    {analysisResults.insights.performanceRatio && (
                      <div className="px-4 py-2 bg-blue-950/40 border border-blue-700/30 rounded-lg backdrop-blur-sm">
                        <span className="text-blue-200 font-semibold text-sm">Performance Ratio: <span className="text-blue-300">{analysisResults.insights.performanceRatio}x</span></span>
                      </div>
                    )}
                  </div>

                  {/* Main Insight Card - Featured */}
                  <div className="mb-6 bg-gradient-to-br from-indigo-950/80 via-slate-900/60 to-purple-950/40 rounded-2xl p-8 border border-indigo-700/30 backdrop-blur-sm overflow-hidden relative">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-600/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-3xl -ml-24 -mb-24"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <p className="text-indigo-300/80 text-xs font-semibold uppercase tracking-widest">Advanced Insight</p>
                            <p className="text-indigo-200 text-sm font-semibold">Key Finding</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600/30 to-purple-600/20 border border-indigo-500/30 rounded-xl backdrop-blur-sm">
                          <span className="text-2xl font-bold text-indigo-200">{Math.round(analysisResults.insights.confidence * 100)}</span>
                          <span className="text-indigo-300/70 text-xs font-semibold">Confidence</span>
                        </div>
                      </div>
                      <p className="text-lg text-slate-100 leading-relaxed font-medium">
                        {analysisResults.insights.insight || 'Analysis completed'}
                      </p>
                      {analysisResults.insights.trendStatus && (
                        <div className="mt-4 pt-4 border-t border-indigo-700/20">
                          <p className="text-indigo-300/70 text-sm"><span className="text-indigo-200 font-semibold">Trend Status:</span> {analysisResults.insights.trendStatus}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary & Recommendation Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900/40 rounded-2xl p-7 border border-emerald-700/25 backdrop-blur-sm group hover:border-emerald-600/40 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span>📊</span>
                        </div>
                        <p className="text-emerald-300/80 text-xs font-semibold uppercase tracking-widest">Statistical Summary</p>
                      </div>
                      <p className="text-slate-100 leading-relaxed font-medium mb-4 text-sm line-clamp-4">
                        {analysisResults.insights.summary || 'Data analysis summary'}
                      </p>
                      <div className="flex items-center gap-2 text-emerald-300/70 text-xs">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>Dataset coverage: {analysisResults.totalRows} records</span>
                      </div>
                    </div>

                    {/* Recommendation Card */}
                    <div className="bg-gradient-to-br from-violet-950/60 to-slate-900/40 rounded-2xl p-7 border border-violet-700/25 backdrop-blur-sm group hover:border-violet-600/40 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span>💡</span>
                        </div>
                        <p className="text-violet-300/80 text-xs font-semibold uppercase tracking-widest">Strategic Actions</p>
                      </div>
                      <p className="text-slate-100 leading-relaxed font-medium mb-4 text-sm line-clamp-4">
                        {analysisResults.insights.recommendation || 'Review the data to identify trends'}
                      </p>
                      <div className="flex items-center gap-2 text-violet-300/70 text-xs">
                        <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                        <span>Prioritize top-performing segments and investigate anomalies</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Analysis - 8 Comprehensive Sections */}
              {analysisResults && analysisResults.analysis && Object.keys(analysisResults.analysis).length > 0 && (
                <div className="animate-slideInUp" style={{animationDelay: '0.5s'}}>
                  <AdvancedInsights analysis={analysisResults.analysis} />
                </div>
              )}

              {/* Statistics */}
              {analysisResults.stats && (
                <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-md animate-slideInUp" style={{animationDelay: '0.6s'}}>
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text mb-6">📈 Comprehensive Statistics</h2>
                  
                  {/* Primary Metrics - 3 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-5 bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-lg border border-blue-700/30 hover:border-blue-600/50 transition-all">
                      <p className="text-blue-300 text-sm font-medium">Count</p>
                      <p className="text-3xl font-bold text-blue-200 mt-2">{analysisResults.stats.count}</p>
                      <p className="text-blue-300/60 text-xs mt-2">Total data points</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-lg border border-purple-700/30 hover:border-purple-600/50 transition-all">
                      <p className="text-purple-300 text-sm font-medium">Sum</p>
                      <p className="text-3xl font-bold text-purple-200 mt-2">{formatNumber(analysisResults.stats.sum)}</p>
                      <p className="text-purple-300/60 text-xs mt-2">Total value</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-pink-900/40 to-pink-800/40 rounded-lg border border-pink-700/30 hover:border-pink-600/50 transition-all">
                      <p className="text-pink-300 text-sm font-medium">Average</p>
                      <p className="text-3xl font-bold text-pink-200 mt-2">{formatNumber(analysisResults.stats.average)}</p>
                      <p className="text-pink-300/60 text-xs mt-2">Mean value</p>
                    </div>
                  </div>

                  {/* Central Tendency & Spread - 3 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-5 bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 rounded-lg border border-emerald-700/30 hover:border-emerald-600/50 transition-all">
                      <p className="text-emerald-300 text-sm font-medium">Median</p>
                      <p className="text-3xl font-bold text-emerald-200 mt-2">{formatNumber(analysisResults.stats.median)}</p>
                      <p className="text-emerald-300/60 text-xs mt-2">Middle value (50%)</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-amber-900/40 to-amber-800/40 rounded-lg border border-amber-700/30 hover:border-amber-600/50 transition-all">
                      <p className="text-amber-300 text-sm font-medium">Range</p>
                      <p className="text-3xl font-bold text-amber-200 mt-2">{formatNumber(analysisResults.stats.range)}</p>
                      <p className="text-amber-300/60 text-xs mt-2">Max - Min span</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 rounded-lg border border-cyan-700/30 hover:border-cyan-600/50 transition-all">
                      <p className="text-cyan-300 text-sm font-medium">Std Deviation</p>
                      <p className="text-3xl font-bold text-cyan-200 mt-2">{formatNumber(analysisResults.stats.stdDev)}</p>
                      <p className="text-cyan-300/60 text-xs mt-2">Data spread</p>
                    </div>
                  </div>

                  {/* Range Metrics - 4 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-lg border border-green-700/30">
                      <p className="text-green-300 text-xs font-medium uppercase">Max Value</p>
                      <p className="text-2xl font-bold text-green-200 mt-2">{formatNumber(analysisResults.stats.max)}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-900/40 to-orange-800/40 rounded-lg border border-orange-700/30">
                      <p className="text-orange-300 text-xs font-medium uppercase">Min Value</p>
                      <p className="text-2xl font-bold text-orange-200 mt-2">{formatNumber(analysisResults.stats.min)}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-rose-900/40 to-rose-800/40 rounded-lg border border-rose-700/30">
                      <p className="text-rose-300 text-xs font-medium uppercase">Q1 (25th %ile)</p>
                      <p className="text-2xl font-bold text-rose-200 mt-2">{formatNumber(analysisResults.stats.q1)}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-violet-900/40 to-violet-800/40 rounded-lg border border-violet-700/30">
                      <p className="text-violet-300 text-xs font-medium uppercase">Q3 (75th %ile)</p>
                      <p className="text-2xl font-bold text-violet-200 mt-2">{formatNumber(analysisResults.stats.q3)}</p>
                    </div>
                  </div>

                  {/* Advanced Metrics - 4 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-teal-900/40 to-teal-800/40 rounded-lg border border-teal-700/30">
                      <p className="text-teal-300 text-xs font-medium uppercase">Unique Values</p>
                      <p className="text-2xl font-bold text-teal-200 mt-2">{analysisResults.stats.uniqueValues}</p>
                      <p className="text-teal-300/60 text-xs mt-1">Distinct count</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 rounded-lg border border-indigo-700/30">
                      <p className="text-indigo-300 text-xs font-medium uppercase">IQR</p>
                      <p className="text-2xl font-bold text-indigo-200 mt-2">{formatNumber(analysisResults.stats.iqr)}</p>
                      <p className="text-indigo-300/60 text-xs mt-1">Interquartile range</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-fuchsia-900/40 to-fuchsia-800/40 rounded-lg border border-fuchsia-700/30">
                      <p className="text-fuchsia-300 text-xs font-medium uppercase">Variance</p>
                      <p className="text-2xl font-bold text-fuchsia-200 mt-2">{formatNumber(analysisResults.stats.variance)}</p>
                      <p className="text-fuchsia-300/60 text-xs mt-1">Squared deviation</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-sky-900/40 to-sky-800/40 rounded-lg border border-sky-700/30">
                      <p className="text-sky-300 text-xs font-medium uppercase">Coeff. of Variation</p>
                      <p className="text-2xl font-bold text-sky-200 mt-2">{formatNumber(analysisResults.stats.coefficientOfVariation)}%</p>
                      <p className="text-sky-300/60 text-xs mt-1">Relative variability</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Table */}
          <div className="mb-8 animate-slideInUp" style={{animationDelay: '0.5s'}}>
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl p-6 border border-indigo-700/30 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Data Preview
                </h2>
                <button
                  onClick={() => setTableView(!tableView)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  {tableView ? '📊 Chart View' : '📋 Table View'}
                </button>
              </div>

              {file && file.data && file.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-indigo-700/30">
                      <tr>
                        {file.columns.map((col) => (
                          <th key={col} className="px-4 py-3 text-left font-semibold text-indigo-200">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {file.data.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-indigo-900/20 transition-colors">
                          {file.columns.map((col) => (
                            <td key={`${idx}-${col}`} className="px-4 py-3 text-slate-300">
                              {formatNumber(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {file.data.length > 10 && (
                    <p className="text-sm text-slate-400 p-4">
                      Showing 10 of {file.data.length} rows
                    </p>
                  )}
                </div>
              )}
            </div>
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
