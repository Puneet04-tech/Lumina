'use client';

import { TrendingUp, AlertCircle, CheckCircle, Target, Zap, Database, TrendingDown, Activity, BarChart3, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react';

export function AdvancedInsights({ analysis }) {
  if (!analysis) return null;

  const {
    topPerformers = [],
    bottomPerformers = [],
    outliers = {},
    trend = {},
    dataQuality = {},
    correlations = {},
  } = analysis;

  // Calculate top performer impact
  const topPerformerTotal = topPerformers.reduce((sum, p) => sum + p.value, 0);
  const topPerformerShare = topPerformers.length > 0 ? (topPerformers[0].value / topPerformerTotal * 100) : 0;
  
  // Calculate performance spread
  const allPerformers = [...topPerformers, ...bottomPerformers];
  const avgPerformance = allPerformers.length > 0 ? allPerformers.reduce((sum, p) => sum + p.value, 0) / allPerformers.length : 0;
  const topToBottomRatio = bottomPerformers.length > 0 && bottomPerformers[bottomPerformers.length - 1]?.value > 0 
    ? (topPerformers[0]?.value / bottomPerformers[bottomPerformers.length - 1]?.value).toFixed(2)
    : 0;

  // Data quality assessment
  const qualityScore = Math.round(((dataQuality.completeness || 0) + (dataQuality.uniquenessScore || 0)) / 2);
  const qualityStatus = qualityScore >= 90 ? 'Excellent' : qualityScore >= 75 ? 'Good' : qualityScore >= 60 ? 'Fair' : 'Poor';

  return (
    <div className="space-y-6">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl p-5 border border-indigo-700/30 backdrop-blur-sm animate-slideInUp">
          <div className="flex items-center justify-between mb-2">
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">Quality Score</p>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-indigo-200">{qualityScore}%</p>
          <p className="text-indigo-300/70 text-xs mt-1">{qualityStatus} • {dataQuality.completeness}% Complete</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 rounded-xl p-5 border border-green-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.05s'}}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-300 text-xs font-semibold uppercase tracking-wider">Top Performer Impact</p>
            <Target className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-200">{topPerformerShare.toFixed(1)}%</p>
          <p className="text-green-300/70 text-xs mt-1">of total value • {topPerformers[0]?.name}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 rounded-xl p-5 border border-blue-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Top vs Bottom</p>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-200">{topToBottomRatio}x</p>
          <p className="text-blue-300/70 text-xs mt-1">Performance Ratio</p>
        </div>
        <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/40 rounded-xl p-5 border border-amber-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.15s'}}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">Anomalies Found</p>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-200">{outliers.count || 0}</p>
          <p className="text-amber-300/70 text-xs mt-1">Outliers • {outliers.lowerBound && outliers.upperBound ? `Range: ${outliers.lowerBound.toFixed(0)}-${outliers.upperBound.toFixed(0)}` : 'Review data'}</p>
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 rounded-xl p-6 border border-green-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">🏆 Top Performers Analysis</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.map((performer, idx) => {
              const percentage = (performer.value / topPerformerTotal * 100);
              return (
                <div key={idx} className="p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg border border-green-700/30 hover:border-green-600/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-green-200 text-lg">#{idx + 1} • {performer.name}</p>
                      <p className="text-green-300/70 text-sm">Value: <span className="text-green-200 font-semibold">{performer.value.toFixed(2)}</span></p>
                    </div>
                    <span className="px-3 py-1 bg-green-600/40 text-green-200 rounded-full text-sm font-bold border border-green-500/30">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-3 border border-green-700/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" style={{width: `${Math.min(percentage, 100)}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trend.direction && (
        <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 rounded-xl p-6 border border-blue-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.25s'}}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">📈 Trend Analysis & Direction</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
              <p className="text-blue-300 text-sm font-semibold mb-2">Direction</p>
              <div className="flex items-center gap-2">
                {trend.direction === 'upward' ? (
                  <>
                    <ArrowUp className="w-6 h-6 text-green-400" />
                    <p className="text-2xl font-bold text-green-200 capitalize">{trend.direction}</p>
                  </>
                ) : trend.direction === 'downward' ? (
                  <>
                    <ArrowDown className="w-6 h-6 text-red-400" />
                    <p className="text-2xl font-bold text-red-200 capitalize">{trend.direction}</p>
                  </>
                ) : (
                  <>
                    <Activity className="w-6 h-6 text-slate-400" />
                    <p className="text-2xl font-bold text-slate-200 capitalize">{trend.direction}</p>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
              <p className="text-blue-300 text-sm font-semibold mb-2">Change Magnitude</p>
              <p className="text-3xl font-bold text-blue-200">{trend.percentChange}%</p>
              <p className="text-blue-300/70 text-xs mt-2">Period-over-Period Change</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
              <p className="text-blue-300 text-sm font-semibold mb-2">Trend Strength</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-blue-200">{(trend.strength * 100).toFixed(0)}%</p>
              </div>
              <div className="w-full bg-blue-900/30 rounded-full h-2 mt-2 border border-blue-700/30 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" style={{width: `${trend.strength * 100}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outlier Detection */}
      {outliers.count > 0 && (
        <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/40 rounded-xl p-6 border border-amber-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">⚠️ Anomalies & Outliers Detected</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-lg border border-amber-700/30">
              <p className="text-amber-300 text-sm font-semibold mb-2">Outlier Count</p>
              <p className="text-3xl font-bold text-amber-200">{outliers.count}</p>
              <p className="text-amber-300/70 text-xs mt-2">Unusual values detected • Investigate for data quality</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-lg border border-amber-700/30">
              <p className="text-amber-300 text-sm font-semibold mb-2">Safe Range</p>
              <p className="text-amber-200 font-mono text-sm">
                {outliers.lowerBound?.toFixed(2) || '—'} → {outliers.upperBound?.toFixed(2) || '—'}
              </p>
              <p className="text-amber-300/70 text-xs mt-2">Values outside this range flagged as anomalies</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Quality Breakdown */}
      {dataQuality.completeness !== undefined && (
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 rounded-xl p-6 border border-purple-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.35s'}}>
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">📊 Data Quality Metrics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-700/30">
              <p className="text-purple-300 text-sm font-semibold mb-2">Completeness</p>
              <p className="text-3xl font-bold text-purple-200">{dataQuality.completeness}%</p>
              <div className="w-full bg-purple-900/30 rounded-full h-2 mt-2 border border-purple-700/30 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-full" style={{width: `${dataQuality.completeness}%`}}></div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-900/50 to-blue-900/50 rounded-lg border border-indigo-700/30">
              <p className="text-indigo-300 text-sm font-semibold mb-2">Uniqueness</p>
              <p className="text-3xl font-bold text-indigo-200">{dataQuality.uniquenessScore}%</p>
              <div className="w-full bg-indigo-900/30 rounded-full h-2 mt-2 border border-indigo-700/30 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-400 h-full" style={{width: `${dataQuality.uniquenessScore}%`}}></div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg border border-green-700/30">
              <p className="text-green-300 text-sm font-semibold mb-2">Overall Score</p>
              <p className="text-3xl font-bold text-green-200">{qualityScore}%</p>
              <p className="text-green-300/70 text-xs mt-2">{qualityStatus} Quality</p>
            </div>
          </div>
          {dataQuality.issues && dataQuality.issues.length > 0 && (
            <div className="mt-4 p-4 bg-red-900/40 border border-red-700/30 rounded-lg">
              <p className="text-red-300 text-sm font-semibold mb-2">⚠️ Issues Found:</p>
              <ul className="text-red-300/70 text-sm space-y-1">
                {dataQuality.issues.slice(0, 4).map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Correlations Analysis */}
      {Object.keys(correlations).length > 0 && (
        <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900/40 rounded-xl p-6 border border-yellow-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">🔗 Variable Correlations</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(correlations)
              .filter(([_, corr]) => Math.abs(corr) > 0.1)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .map(([column, correlation], idx) => (
                <div key={idx} className="p-4 bg-yellow-900/40 rounded-lg border border-yellow-700/30 hover:border-yellow-600/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-yellow-200">{column}</p>
                    <span className={`text-sm font-bold ${correlation > 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {correlation > 0 ? '▲' : '▼'} {(correlation * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-yellow-900/30 rounded-full h-3 border border-yellow-700/30 overflow-hidden">
                    <div
                      className={`h-full ${correlation > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
                      style={{ width: `${Math.abs(correlation) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bottom Performers / Areas for Improvement */}
      {bottomPerformers.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/40 to-slate-900/40 rounded-xl p-6 border border-red-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.45s'}}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-red-300 to-rose-300 bg-clip-text text-transparent">📉 Areas for Improvement</h3>
          </div>
          <div className="space-y-3">
            {bottomPerformers.map((performer, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-red-900/50 to-rose-900/50 rounded-lg border border-red-700/30 hover:border-red-600/50 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-red-200 text-lg">• {performer.name}</p>
                    <p className="text-red-300/70 text-sm">Value: <span className="text-red-200 font-semibold">{performer.value.toFixed(2)}</span></p>
                  </div>
                  <span className="px-3 py-1 bg-red-600/40 text-red-200 rounded-full text-sm font-semibold border border-red-500/30">
                    Focus Area
                  </span>
                </div>
                <p className="text-red-300/70 text-xs">Potential: Increase performance and align with top performers</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights & Recommendations */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl p-6 border border-indigo-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.5s'}}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">💡 Key Insights</h3>
        </div>
        <div className="space-y-2 text-slate-200 text-sm">
          <p>✓ Top performer <span className="font-semibold text-green-300">{topPerformers[0]?.name}</span> drives <span className="font-semibold">{topPerformerShare.toFixed(1)}%</span> of total value</p>
          <p>✓ Performance spread is <span className="font-semibold text-blue-300">{topToBottomRatio}x</span> between best and worst performers</p>
          <p>✓ Data quality score: <span className="font-semibold text-indigo-300">{qualityScore}%</span> ({qualityStatus})</p>
          <p>✓ Trend direction is <span className="font-semibold">{trend.direction}</span> with <span className="font-semibold text-amber-300">{(trend.strength * 100).toFixed(0)}%</span> strength</p>
          {outliers.count > 0 && <p>⚠️ {outliers.count} anomalies detected — review for data quality or business significance</p>}
        </div>
      </div>
    </div>
  );
}
