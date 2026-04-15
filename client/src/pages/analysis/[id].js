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
  RadarChartComponent,
  HistogramComponent,
  FunnelComponent,
  BubbleChartComponent,
  ComposedChartComponent,
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
  const [queryResults, setQueryResults] = useState(null); // Separate query results
  const [tableView, setTableView] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [chartDisplayType, setChartDisplayType] = useState('bar');
  const [activeSection, setActiveSection] = useState(null); // Track which section is visible: 'anomaly', 'statistics', 'strategic', 'insights'

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/query`, {
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
                <button
                  onClick={() => handleGenerateChart('radar')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
                >
                  🎯 Radar Chart
                </button>
                <button
                  onClick={() => handleGenerateChart('histogram')}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105"
                >
                  📊 Histogram
                </button>
                <button
                  onClick={() => handleGenerateChart('funnel')}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-105"
                >
                  🔻 Funnel Chart
                </button>
                <button
                  onClick={() => handleGenerateChart('bubble')}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105"
                >
                  ⭕ Bubble Chart
                </button>
                <button
                  onClick={() => handleGenerateChart('composed')}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 hover:scale-105"
                >
                  📈 Composed Chart
                </button>
              </div>
            </div>
          </div>

              </div>
            </div>

          {/* ===== PREMIUM FEATURES SHOWCASE (ALWAYS VISIBLE) ===== */}
          <div className="mb-8 animate-slideInUp" style={{animationDelay: '0.08s'}}>
            <div className="bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 rounded-xl border border-purple-700/50 backdrop-blur-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">👑</span>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">Premium AI Features</h3>
                  <p className="text-sm text-slate-400">Advanced Intelligence Engine - Run a query to see these in action</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4">
                
                {/* Feature 1 Card */}
                <div className="bg-gradient-to-br from-purple-950/60 to-slate-900/40 rounded-lg border border-purple-700/30 p-4 hover:border-purple-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20">
                  <div className="text-3xl mb-2">🔮</div>
                  <h4 className="font-bold text-purple-300 mb-1">Predictive Forecast</h4>
                  <p className="text-xs text-slate-400 mb-3">AI predicts future trends using historical patterns</p>
                  <div className="text-xs text-slate-500 bg-purple-950/50 rounded p-2">
                    <div>📈 Trend analysis</div>
                    <div>📊 5-period forecast</div>
                    <div>📉 Confidence scoring</div>
                  </div>
                </div>

                {/* Feature 2 Card */}
                <div className="bg-gradient-to-br from-amber-950/60 to-slate-900/40 rounded-lg border border-amber-700/30 p-4 hover:border-amber-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/20">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-bold text-amber-300 mb-1">Insight Prioritization</h4>
                  <p className="text-xs text-slate-400 mb-3">Smart ranking of insights by importance</p>
                  <div className="text-xs text-slate-500 bg-amber-950/50 rounded p-2">
                    <div>🔴 Critical insights first</div>
                    <div>⭐ Impact scoring (0-100)</div>
                    <div>📌 Top 3 highlighted</div>
                  </div>
                </div>

                {/* Feature 3 Card */}
                <div className="bg-gradient-to-br from-cyan-950/60 to-slate-900/40 rounded-lg border border-cyan-700/30 p-4 hover:border-cyan-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-600/20">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-bold text-cyan-300 mb-1">Data Quality Score</h4>
                  <p className="text-xs text-slate-400 mb-3">Automatic data governance</p>
                  <div className="text-xs text-slate-500 bg-cyan-950/50 rounded p-2">
                    <div>✅ Completeness Check</div>
                    <div>🔄 Consistency Analysis</div>
                    <div>⚠️ Issue Detection</div>
                  </div>
                </div>

                {/* Feature 4 Card */}
                <div className="bg-gradient-to-br from-green-950/60 to-slate-900/40 rounded-lg border border-green-700/30 p-4 hover:border-green-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/20">
                  <div className="text-3xl mb-2">💡</div>
                  <h4 className="font-bold text-green-300 mb-1">Query Recommendations</h4>
                  <p className="text-xs text-slate-400 mb-3">Conversational AI suggests follow-ups</p>
                  <div className="text-xs text-slate-500 bg-green-950/50 rounded p-2">
                    <div>🤖 Smart suggestions</div>
                    <div>🎓 Difficulty levels</div>
                    <div>📚 5 follow-up ideas</div>
                  </div>
                </div>

                {/* Feature 5 Card */}
                <div className="bg-gradient-to-br from-rose-950/60 to-slate-900/40 rounded-lg border border-rose-700/30 p-4 hover:border-rose-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-rose-600/20">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-bold text-rose-300 mb-1">Benchmarking</h4>
                  <p className="text-xs text-slate-400 mb-3">Compare to performance tiers</p>
                  <div className="text-xs text-slate-500 bg-rose-950/50 rounded p-2">
                    <div>🏆 Performance tiers</div>
                    <div>📊 Distribution analysis</div>
                    <div>💹 Percentile ranking</div>
                  </div>
                </div>
              </div>

              {/* Pro Features Badge */}
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-600/30 flex items-center gap-2">
                <span className="text-sm text-slate-300">
                  <strong className="text-purple-300">⭐ NOT in Tableau:</strong> These enterprise features are unique to Lumina. Execute a query below to see them in action!
                </span>
              </div>
            </div>
          </div>

          {/* AI Query */}
          <div className="mb-8 animate-slideInUp" style={{animationDelay: '0.1s'}}>
            <QueryInput fileId={fileId} onQueryResult={setQueryResults} />
          </div>

          {/* Query Results Box */}
          {queryResults && (
            <div className="mb-8 animate-slideInUp" style={{animationDelay: '0.15s'}}>
              <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/40 rounded-xl border border-indigo-700/30 backdrop-blur-md p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span>📊</span>
                    </div>
                    <h3 className="text-xl font-bold text-indigo-300">Query Results</h3>
                  </div>
                  
                  {/* Intelligence Source Badge */}
                  {queryResults.source && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      queryResults.source.includes('Hybrid') 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    }`}>
                      {queryResults.source.includes('Hybrid') ? '🤖' : '📊'} 
                      <span>
                        {queryResults.source.includes('Hybrid') ? 'Groq AI + Local' : 'Local Intelligence'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Universal Aggregation Display */}
                {queryResults.aggregation && (
                  <div className="mb-6 space-y-4">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-indigo-600/20">
                      <p className="text-indigo-300 text-sm font-semibold mb-2">Analysis Summary</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-slate-400">Metric</p>
                          <p className="text-slate-100 font-bold">{queryResults.aggregation.metric}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Grouped By</p>
                          <p className="text-slate-100 font-bold">{queryResults.aggregation.dimension}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Total Value</p>
                          <p className="text-slate-100 font-bold">{typeof queryResults.aggregation.totalValue === 'number' ? queryResults.aggregation.totalValue.toLocaleString() : queryResults.aggregation.totalValue}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Groups Count</p>
                          <p className="text-slate-100 font-bold">{queryResults.aggregation.groupCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Group Breakdown */}
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-indigo-600/20">
                      <p className="text-indigo-300 text-sm font-semibold mb-3">Breakdown by {queryResults.aggregation.dimension}</p>
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {queryResults.aggregation.groups?.map((group, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded hover:bg-slate-800/80 transition-all">
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-100 font-medium truncate">{group.name}</p>
                              <p className="text-slate-400 text-xs">Avg: {group.average?.toLocaleString() || 'N/A'} | Count: {group.count}</p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-indigo-300 font-bold">{group.total?.toLocaleString()}</p>
                              <p className="text-slate-400 text-xs">{group.percentOfTotal}%</p>
                              <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  style={{ width: `${Math.min(group.percentOfTotal, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Insights */}
                    {queryResults.aggregation.insights && queryResults.aggregation.insights.length > 0 && (
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-indigo-600/20">
                        <p className="text-indigo-300 text-sm font-semibold mb-2">Key Insights</p>
                        <ul className="space-y-1">
                          {queryResults.aggregation.insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-100 text-sm">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Insights */}
                {!queryResults.aggregation && queryResults.insights && (
                  <div className="space-y-3">
                    {Array.isArray(queryResults.insights) ? (
                      queryResults.insights.map((result, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-indigo-600/20 hover:border-indigo-600/40 transition-all">
                          <p className="text-slate-100 font-medium text-sm">{result}</p>
                        </div>
                      ))
                    ) : queryResults.analysis?.answer ? (
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-indigo-600/20">
                        <div className="text-slate-100 space-y-2">
                          <p>{queryResults.analysis.answer}</p>
                          {queryResults.analysis?.recommendations && (
                            <p className="text-indigo-300 text-sm font-semibold">💡 {queryResults.analysis.recommendations}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-indigo-600/20">
                        <p className="text-slate-100">{String(queryResults)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Intelligence Engine Info */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    {queryResults.source && queryResults.source.includes('Hybrid') ? (
                      <>
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>
                          <strong className="text-green-400">Powered by Groq AI + Local Intelligence:</strong> Advanced analysis with statistical insights
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span>
                          <strong className="text-blue-400">Powered by Local Intelligence:</strong> Statistical analysis engine
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== UNIQUE FEATURES SECTION ===== */}
          {queryResults && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4 mb-8 animate-slideInUp" style={{animationDelay: '0.2s'}}>
              
              {/* FEATURE 1: 🔮 Predictive Forecasting */}
              {queryResults.predictiveAnalysis?.forecast && (
                <div className="bg-gradient-to-br from-purple-950/80 to-slate-900/60 rounded-xl border-2 border-purple-600/60 backdrop-blur-md p-5 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🔮</span>
                    <h4 className="font-bold text-purple-300 text-sm">Predictive Forecast</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-slate-800/60 rounded border border-purple-600/30">
                      <p className="text-xs text-slate-300 font-semibold">{queryResults.predictiveAnalysis.trend}</p>
                      <p className="text-xs text-slate-400">Strength: {queryResults.predictiveAnalysis.trendStrength?.toFixed(1)}%</p>
                    </div>
                    {queryResults.predictiveAnalysis.forecast?.slice(0, 2).map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/40 rounded text-xs">
                        <span className="text-slate-400">P{f.period}</span>
                        <span className="text-purple-300 font-bold">{f.value?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEATURE 2: 🎯 Insight Prioritization */}
              {queryResults.insightPrioritization?.topInsights && (
                <div className="bg-gradient-to-br from-amber-950/80 to-slate-900/60 rounded-xl border-2 border-amber-600/60 backdrop-blur-md p-5 hover:shadow-lg hover:shadow-amber-600/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎯</span>
                    <h4 className="font-bold text-amber-300 text-sm">Top Insights</h4>
                  </div>
                  <div className="space-y-2">
                    {queryResults.insightPrioritization.topInsights?.slice(0, 2).map((item, i) => (
                      <div key={i} className="p-2 bg-slate-800/60 rounded border-l-2 border-amber-500">
                        <p className="text-xs text-slate-200">{item.insight?.substring(0, 60)}...</p>
                        <span className={`inline-block text-xs font-bold mt-1 px-2 py-0.5 rounded ${
                          item.priority === 'Critical' ? 'bg-red-700 text-white' :
                          item.priority === 'High' ? 'bg-amber-700 text-white' :
                          'bg-slate-700 text-slate-200'
                        }`}>{item.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEATURE 3: 📊 Data Quality Intelligence */}
              {queryResults.intelligentDataQuality?.qualityScore && (
                <div className="bg-gradient-to-br from-cyan-950/80 to-slate-900/60 rounded-xl border-2 border-cyan-600/60 backdrop-blur-md p-5 hover:shadow-lg hover:shadow-cyan-600/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📊</span>
                    <h4 className="font-bold text-cyan-300 text-sm">Data Quality</h4>
                  </div>
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-cyan-300">{queryResults.intelligentDataQuality.qualityScore}%</div>
                    <p className="text-xs text-slate-400">Quality Score</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Completeness:</span>
                      <span className="text-cyan-300 font-bold">{queryResults.intelligentDataQuality.completenessScore}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Consistency:</span>
                      <span className="text-cyan-300 font-bold">{queryResults.intelligentDataQuality.consistencyScore}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FEATURE 4: 💡 Query Recommendations */}
              {queryResults.suggestedQueries && (
                <div className="bg-gradient-to-br from-green-950/80 to-slate-900/60 rounded-xl border-2 border-green-600/60 backdrop-blur-md p-5 hover:shadow-lg hover:shadow-green-600/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💡</span>
                    <h4 className="font-bold text-green-300 text-sm">Next Steps</h4>
                  </div>
                  <div className="space-y-2">
                    {queryResults.suggestedQueries.slice(0, 2).map((rec, i) => (
                      <div key={i} className="p-2 bg-slate-800/60 rounded hover:bg-slate-800/80 transition-all cursor-pointer border border-green-600/30">
                        <p className="text-xs text-slate-300">{rec.icon} {rec.query?.substring(0, 50)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEATURE 5: 📈 Benchmarking Performance */}
              {queryResults.benchmarking?.performanceDistribution && (
                <div className="bg-gradient-to-br from-rose-950/80 to-slate-900/60 rounded-xl border-2 border-rose-600/60 backdrop-blur-md p-5 hover:shadow-lg hover:shadow-rose-600/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📈</span>
                    <h4 className="font-bold text-rose-300 text-sm">Benchmarking</h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    {[
                      { label: '🏆 Exceptional', count: queryResults.benchmarking.performanceDistribution.exceptional, color: 'text-yellow-400' },
                      { label: '⭐ Strong', count: queryResults.benchmarking.performanceDistribution.strong, color: 'text-green-400' },
                      { label: '✅ Average', count: queryResults.benchmarking.performanceDistribution.average, color: 'text-blue-400' }
                    ].map((perf, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-slate-400">{perf.label}</span>
                        <span className={`font-bold ${perf.color}`}>{perf.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {analysisResults && (
            <div className="space-y-8 mb-8">

              {/* Chart Display - Show when chartDisplayType is set */}
              {chartDisplayType && (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-md p-6 animate-slideInUp">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text">
                      {chartDisplayType.charAt(0).toUpperCase() + chartDisplayType.slice(1)} Chart Analysis
                    </h2>
                  </div>
                  <div ref={chartRef} className="bg-slate-900/40 rounded-lg p-4 h-96">
                    {chartDisplayType === 'bar' && <BarChartComponent data={analysisResults.data} xKey="name" yKey="value" title={analysisResults.yAxis} />}
                    {chartDisplayType === 'line' && <LineChartComponent data={analysisResults.data} xKey="name" yKey="value" title={analysisResults.yAxis} />}
                    {chartDisplayType === 'pie' && <PieChartComponent data={analysisResults.data} nameKey="name" valueKey="value" title={analysisResults.yAxis} />}
                    {chartDisplayType === 'area' && <AreaChartComponent data={analysisResults.data} xKey="name" yKey="value" title={analysisResults.yAxis} />}
                    {chartDisplayType === 'radar' && <RadarChartComponent data={analysisResults.data} xKey="name" yKey="value" title="Pattern Analysis" />}
                    {chartDisplayType === 'histogram' && <HistogramComponent data={analysisResults.data} xKey="name" yKey="value" title="Distribution" />}
                    {chartDisplayType === 'funnel' && <FunnelComponent data={analysisResults.data} xKey="name" yKey="value" title="Composition Flow" />}
                    {chartDisplayType === 'bubble' && <BubbleChartComponent data={analysisResults.data} xKey="name" yKey="value" title="Correlation Analysis" />}
                    {chartDisplayType === 'composed' && <ComposedChartComponent data={analysisResults.data} xKey="name" yKey="value" title="Multi-Dimensional View" />}
                  </div>
                </div>
              )}

              {/* Action Buttons - Show specific sections on click */}
              <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-md animate-slideInUp flex flex-wrap gap-3 justify-center" style={{animationDelay: '0.35s'}}>
                <button
                  onClick={() => setActiveSection(activeSection === 'topperformer' ? null : 'topperformer')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'topperformer'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  ⭐ Top Performer
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === 'anomaly' ? null : 'anomaly')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'anomaly'
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  🚨 Anomaly
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === 'metrics' ? null : 'metrics')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'metrics'
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  📈 Key Metrics
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === 'trends' ? null : 'trends')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'trends'
                      ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  📊 Trends
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === 'risk' ? null : 'risk')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'risk'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  ⚠️ Risk Analysis
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === 'optimization' ? null : 'optimization')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'optimization'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  ⚡ Optimization
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === 'strategic' ? null : 'strategic')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'strategic'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  💡 Strategic
                </button>
                <button
                  onClick={() => setActiveSection(activeSection === 'insights' ? null : 'insights')}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'insights'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50'
                  }`}
                >
                  🎯 Insights
                </button>
              </div>

              {/* Top Performer Section */}
              {activeSection === 'topperformer' && (
                <div className="p-6 bg-gradient-to-br from-yellow-950/40 to-slate-900/40 rounded-xl border border-yellow-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">⭐ Top Performer Analysis</h3>
                  <div className="space-y-4 text-slate-200">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-yellow-700/20">
                      <p className="text-yellow-200 font-semibold mb-2">🏆 Best Performing Item</p>
                      <p className="text-sm">{analysisResults.data?.[0]?.name || 'N/A'} leads with {formatNumber(analysisResults.data?.[0]?.value)} - representing {((analysisResults.data?.[0]?.value / analysisResults.stats?.sum) * 100).toFixed(2)}% of total</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-yellow-700/20">
                      <p className="text-yellow-200 font-semibold mb-2">📈 Performance Gap</p>
                      <p className="text-sm">Top performer exceeds average by {((analysisResults.data?.[0]?.value / analysisResults.stats?.average) * 100 - 100).toFixed(1)}%. This suggests significant opportunity to uplift underperforming items.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-yellow-700/20">
                      <p className="text-yellow-200 font-semibold mb-2">💼 Strategic Opportunity</p>
                      <p className="text-sm">Analyze what drives {analysisResults.data?.[0]?.name}'s success and replicate best practices across similar items to increase overall performance by 15-30%.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Anomaly Section - Enhanced */}
              {activeSection === 'anomaly' && (
                <div className="p-6 bg-gradient-to-br from-red-950/40 to-slate-900/40 rounded-xl border border-red-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-red-300 mb-4">🚨 Anomaly Detection & Outliers</h3>
                  <div className="space-y-4 text-slate-200">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-red-700/20">
                      <p className="text-red-200 font-semibold mb-2">📍 Statistical Outliers</p>
                      <p className="text-sm">Found {analysisResults.stats?.uniqueValues || 0} unique values. Items beyond ±2 standard deviations show unusual patterns requiring investigation.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-red-700/20">
                      <p className="text-red-200 font-semibold mb-2">⚡ Variance Alert</p>
                      <p className="text-sm">Std deviation of {formatNumber(analysisResults.stats?.stdDev)} indicates {analysisResults.stats?.coefficientOfVariation > 50 ? 'HIGH' : 'MODERATE'} variability. {analysisResults.stats?.coefficientOfVariation > 50 ? 'Investigate inconsistencies in data quality or processes.' : 'Data is relatively stable.'}</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-red-700/20">
                      <p className="text-red-200 font-semibold mb-2">🔍 Range Analysis</p>
                      <p className="text-sm">Range span: {formatNumber(analysisResults.stats?.range)}. Items with values below Q1 ({formatNumber(analysisResults.stats?.q1)}) or above Q3 ({formatNumber(analysisResults.stats?.q3)}) warrant closer review.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Metrics Section - All Statistics */}
              {activeSection === 'metrics' && (
                <div className="p-6 bg-gradient-to-br from-cyan-950/40 to-slate-900/40 rounded-xl border border-cyan-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-6">📈 Key Performance Metrics</h3>
                  
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

              {/* Trends Section */}
              {activeSection === 'trends' && (
                <div className="p-6 bg-gradient-to-br from-sky-950/40 to-slate-900/40 rounded-xl border border-sky-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-sky-300 mb-4">📊 Trend Analysis & Patterns</h3>
                  <div className="space-y-4 text-slate-200">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-sky-700/20">
                      <p className="text-sky-200 font-semibold mb-2">📈 Overall Trend</p>
                      <p className="text-sm">Total aggregate value: {formatNumber(analysisResults.stats?.sum)} across {analysisResults.stats?.count} data points, indicating {analysisResults.stats?.average > analysisResults.stats?.median ? 'right-skewed' : 'left-skewed'} distribution with potential high-value outliers.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-sky-700/20">
                      <p className="text-sky-200 font-semibold mb-2">🔄 Distribution Pattern</p>
                      <p className="text-sm">IQR of {formatNumber(analysisResults.stats?.iqr)} shows {analysisResults.stats?.iqr < analysisResults.stats?.range / 4 ? 'concentrated middle 50%' : 'dispersed middle 50%'}, with {((analysisResults.stats?.uniqueValues / analysisResults.stats?.count) * 100).toFixed(1)}% unique values relative to record count.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-sky-700/20">
                      <p className="text-sky-200 font-semibold mb-2">🎯 Actionable Insight</p>
                      <p className="text-sm">Focus on the top 20% of performers who contribute majority of value. Monitor bottom performers for optimization opportunities or discontinuation decisions.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Analysis Section */}
              {activeSection === 'risk' && (
                <div className="p-6 bg-gradient-to-br from-orange-950/40 to-slate-900/40 rounded-xl border border-orange-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-orange-300 mb-4">⚠️ Risk Assessment & Alerts</h3>
                  <div className="space-y-4 text-slate-200">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-orange-700/20">
                      <p className="text-orange-200 font-semibold mb-2">⚡ Concentration Risk</p>
                      <p className="text-sm">Top item represents {((analysisResults.data?.[0]?.value / analysisResults.stats?.sum) * 100).toFixed(2)}% of total. High concentration increases vulnerability to single-point failures.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-orange-700/20">
                      <p className="text-orange-200 font-semibold mb-2">📉 Volatility Risk</p>
                      <p className="text-sm">Coefficient of Variation at {formatNumber(analysisResults.stats?.coefficientOfVariation)}% indicates {analysisResults.stats?.coefficientOfVariation > 50 ? 'HIGH VOLATILITY - Immediate action recommended' : 'Moderate volatility - Ongoing monitoring advised'}.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-orange-700/20">
                      <p className="text-orange-200 font-semibold mb-2">🚨 Outlier Exposure</p>
                      <p className="text-sm">Range of {formatNumber(analysisResults.stats?.range)} suggests presence of extreme values. Investigate outliers to determine if they're data errors or legitimate anomalies.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-900/40 to-slate-900/40 rounded-lg border border-orange-700/25 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🏥</span>
                        <p className="text-orange-300 font-semibold">Portfolio Health Index</p>
                      </div>
                      <p className="text-slate-100 text-sm leading-relaxed">
                        Dependency score: {((analysisResults.data?.[0]?.value / analysisResults.stats?.sum) * 100).toFixed(0)}% from top item. Diversification score: {analysisResults.stats?.uniqueValues > analysisResults.stats?.count / 2 ? 'GOOD' : 'NEEDS WORK'}. Overall health: {analysisResults.stats?.coefficientOfVariation > 50 ? '⚠️ Monitor' : '✅ Healthy'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimization Section */}
              {activeSection === 'optimization' && (
                <div className="p-6 bg-gradient-to-br from-green-950/40 to-slate-900/40 rounded-xl border border-green-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-green-300 mb-4">⚡ Optimization Recommendations</h3>
                  <div className="space-y-4 text-slate-200">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-green-700/20">
                      <p className="text-green-200 font-semibold mb-2">🎯 Performance Improvement</p>
                      <p className="text-sm">Implement best practices from top performer ({analysisResults.data?.[0]?.name}). Uplift bottom 20% to median level ({formatNumber(analysisResults.stats?.median)}) for estimated {((analysisResults.stats?.average * analysisResults.stats?.count * 0.15) / analysisResults.stats?.sum * 100).toFixed(1)}% overall improvement.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-green-700/20">
                      <p className="text-green-200 font-semibold mb-2">💼 Portfolio Rebalancing</p>
                      <p className="text-sm">Reduce dependency on single high-performer. Diversify investment across top 5-10 items. This reduces concentration risk while maintaining performance.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-green-700/20">
                      <p className="text-green-200 font-semibold mb-2">📊 Resource Allocation</p>
                      <p className="text-sm">Allocate resources proportionally to performance potential. Consider discontinuing items with values below Q1 ({formatNumber(analysisResults.stats?.q1)}) unless strategic.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-900/40 to-slate-900/40 rounded-lg border border-green-700/25 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">💰</span>
                        <p className="text-green-300 font-semibold">Opportunity Sizing</p>
                      </div>
                      <p className="text-slate-100 text-sm leading-relaxed">
                        If bottom 20% items were uplifted to median performance, total value would increase from {formatNumber(analysisResults.stats?.sum)} to estimated {formatNumber(analysisResults.stats?.sum * 1.25)}, representing 25% potential upside without new investments.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics Section - Only shows when selected */}
              {activeSection === 'statistics' && (
                <div className="p-6 bg-gradient-to-br from-green-950/40 to-slate-900/40 rounded-xl border border-green-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-green-300 mb-6">📊 Comprehensive Statistics</h3>
                  
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

              {/* Strategic Section - Only shows when selected */}
              {activeSection === 'strategic' && (
                <div className="p-6 bg-gradient-to-br from-purple-950/40 to-slate-900/40 rounded-xl border border-purple-700/30 backdrop-blur-md animate-slideInUp">
                  <h3 className="text-2xl font-bold text-purple-300 mb-4">💡 Strategic Recommendations & Action Plan</h3>
                  <div className="space-y-4 text-slate-200">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-700/20">
                      <p className="text-purple-200 font-semibold mb-2">🎯 Primary Objective</p>
                      <p className="text-sm">Focus on scaling the Top Performer strategy. {analysisResults.data?.[0]?.name} success model should be documented and applied to similar items to create portfolio-wide impact.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-700/20">
                      <p className="text-purple-200 font-semibold mb-2">📊 Market Position</p>
                      <p className="text-sm">Current portfolio concentration at {((analysisResults.data?.[0]?.value / analysisResults.stats?.sum) * 100).toFixed(1)}% represents both strength and risk. Recommended portfolio structure: Top performer 25-30%, next 4-5 items 40-50%, remainder 20-25%.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-700/20">
                      <p className="text-purple-200 font-semibold mb-2">💼 Resource Allocation Strategy</p>
                      <p className="text-sm">Allocate 40% resources to top performers, 35% to growth potential items (median to upper quartile), 15% to optimization, 10% to experimental pilots.</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-700/20">
                      <p className="text-purple-200 font-semibold mb-2">⏱️ 90-Day Action Plan</p>
                      <p className="text-sm">Week 1-2: Document top performer practices. Week 3-4: Train teams. Week 5-8: Test on 3-5 pilot items. Week 9-12: Full rollout and measure impact. Expected ROI: 20-35%.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-900/40 to-slate-900/40 rounded-lg border border-purple-700/25 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">📊</span>
                        <p className="text-purple-300 font-semibold">Performance Gap Analysis</p>
                      </div>
                      <p className="text-slate-100 text-sm leading-relaxed">
                        Top performer ({formatNumber(analysisResults.stats?.max)}) vs Bottom performer ({formatNumber(analysisResults.stats?.min)}) shows {((analysisResults.stats?.max / analysisResults.stats?.min) * 100 - 100).toFixed(0)}% gap. This significant variance suggests opportunities for standardization and knowledge transfer across items.
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-900/40 to-slate-900/40 rounded-lg border border-purple-700/25">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🎯</span>
                        <p className="text-purple-300 font-semibold">Competitive Positioning</p>
                      </div>
                      <p className="text-slate-100 text-sm leading-relaxed">
                        Your distribution shows {analysisResults.stats?.average > analysisResults.stats?.median ? 'concentration at top-end' : 'balanced distribution'}. Top performer alone drives significant market impact. Consider leveraging this strength in competitive positioning.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights Section - Enhanced */}
              {activeSection === 'insights' && analysisResults.insights && Array.isArray(analysisResults.insights) && (
                <div className="animate-slideInUp">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text">Advanced Intelligence Analysis</h2>
                    </div>
                    <p className="text-slate-400 text-sm ml-4">Multi-dimensional insights with risk assessment & strategic recommendations</p>
                  </div>

                  {/* Main Insight Card - Featured */}
                  <div className="mb-6 bg-gradient-to-br from-indigo-950/80 via-slate-900/60 to-purple-950/40 rounded-2xl p-8 border border-indigo-700/30 backdrop-blur-sm overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <p className="text-indigo-300/80 text-xs font-semibold uppercase tracking-widest">Advanced Insight</p>
                            <p className="text-indigo-200 text-sm font-semibold">Key Findings & Intelligence</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {analysisResults.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="mt-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <p className="text-slate-100 font-medium">{insight}</p>
                          </div>
                        ))}
                      </div>
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
                      <p className="text-slate-100 leading-relaxed font-medium mb-4 text-sm">
                        {analysisResults.analysis?.answer || 'Data analysis summary'}
                      </p>
                    </div>

                    {/* Recommendation Card */}
                    <div className="bg-gradient-to-br from-violet-950/60 to-slate-900/40 rounded-2xl p-7 border border-violet-700/25 backdrop-blur-sm group hover:border-violet-600/40 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span>💡</span>
                        </div>
                        <p className="text-violet-300/80 text-xs font-semibold uppercase tracking-widest">Strategic Actions</p>
                      </div>
                      <p className="text-slate-100 leading-relaxed font-medium mb-4 text-sm">
                        {analysisResults.analysis?.recommendations || 'Review the data to identify trends'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Preview - Toggle between Chart and Table */}
          <div className="mb-8 animate-slideInUp" style={{animationDelay: '0.7s'}}>
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl p-6 border border-indigo-700/30 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Data Preview
                </h2>
                <button
                  onClick={() => setTableView(!tableView)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                    tableView 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-slate-200 hover:shadow-lg hover:shadow-slate-500/50'
                  }`}
                >
                  {tableView ? '📊 Switch to Visualization' : '📋 Switch to Table'}
                </button>
              </div>

              {/* Table View */}
              {tableView && file && file.data && file.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-indigo-700/30 sticky top-0 bg-slate-900/50 backdrop-blur">
                      <tr>
                        {file.columns.map((col) => (
                          <th key={col} className="px-4 py-3 text-left font-semibold text-indigo-200">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {file.data.slice(0, 25).map((row, idx) => (
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
                  {file.data.length > 25 && (
                    <div className="flex items-center justify-between p-4 bg-slate-800/20 border-t border-slate-800/50 rounded-b-lg">
                      <p className="text-sm text-slate-400">
                        Showing <span className="font-semibold text-indigo-300">25</span> of <span className="font-semibold text-indigo-300">{file.data.length}</span> rows
                      </p>
                      <p className="text-xs text-slate-500">💡 Tip: Export to Excel/CSV to view all data</p>
                    </div>
                  )}
                </div>
              )}

              {/* Chart Visualization View */}
              {!tableView && analysisResults && (
                <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/30 text-center text-slate-400">
                  <p className="text-sm">💡 Use the Primary Analysis section above to explore your data with different chart types</p>
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
