'use client';

import { TrendingUp, AlertCircle, CheckCircle, Target, Zap, Database } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 rounded-xl p-6 border border-green-700/30 backdrop-blur-sm animate-slideInUp">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">🏆 Top Performers</h3>
          </div>
          <div className="space-y-2">
            {topPerformers.map((performer, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg border border-green-700/30 hover:border-green-600/50 transition-colors">
                <div>
                  <p className="font-medium text-green-200">{idx + 1}. {performer.name}</p>
                  <p className="text-sm text-green-300/70">{performer.value.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-green-600/40 text-green-200 rounded-full text-sm font-medium border border-green-500/30">
                    ⭐ {((idx + 1) / topPerformers.length * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trend.direction && (
        <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 rounded-xl p-6 border border-blue-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">📈 Trend Analysis</h3>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-200 font-medium">Direction: <span className="capitalize font-semibold text-blue-300">{trend.direction}</span></span>
              <span className="text-2xl font-bold text-blue-300">{trend.percentChange}%</span>
            </div>
            <div className="w-full bg-blue-900/30 rounded-full h-2 border border-blue-700/30">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                style={{ width: `${Math.min(trend.strength * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-300/70 mt-2">Trend strength: {(trend.strength * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Outlier Detection */}
      {outliers.count > 0 && (
        <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/40 rounded-xl p-6 border border-amber-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">⚠️ Outliers Detected</h3>
          </div>
          <div className="p-4 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-lg border border-amber-700/30">
            <p className="text-lg font-bold text-amber-200 mb-2">{outliers.count} outliers found</p>
            <p className="text-sm text-amber-300/70">
              Values outside range: {outliers.lowerBound?.toFixed(2)} - {outliers.upperBound?.toFixed(2)}
            </p>
            <p className="text-xs text-amber-300/60 mt-2">These unusual values may indicate data quality issues or significant events.</p>
          </div>
        </div>
      )}

      {/* Data Quality */}
      {dataQuality.completeness !== undefined && (
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 rounded-xl p-6 border border-purple-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">📊 Data Quality</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-700/30">
              <p className="text-sm text-purple-300/70 mb-1">Completeness</p>
              <p className="text-2xl font-bold text-purple-200">{dataQuality.completeness}%</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-900/50 to-blue-900/50 rounded-lg border border-indigo-700/30">
              <p className="text-sm text-indigo-300/70 mb-1">Uniqueness</p>
              <p className="text-2xl font-bold text-indigo-200">{dataQuality.uniquenessScore}%</p>
            </div>
          </div>
          {dataQuality.issues && dataQuality.issues.length > 0 && (
            <div className="mt-3 p-3 bg-red-900/40 border border-red-700/30 rounded-lg">
              <p className="text-sm font-medium text-red-300 mb-2">Issues Found:</p>
              <ul className="text-sm text-red-300/70 space-y-1">
                {dataQuality.issues.slice(0, 3).map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Correlations */}
      {Object.keys(correlations).length > 0 && (
        <div className="bg-gradient-to-br from-yellow-900/40 to-slate-900/40 rounded-xl p-6 border border-yellow-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">🔗 Correlations</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(correlations)
              .filter(([_, corr]) => Math.abs(corr) > 0.1)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .map(([column, correlation], idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-yellow-900/40 rounded-lg border border-yellow-700/30 hover:border-yellow-600/50 transition-colors">
                  <span className="text-sm font-medium text-yellow-200">{column}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-yellow-900/30 rounded-full overflow-hidden border border-yellow-700/30">
                      <div
                        className={`h-full ${correlation > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
                        style={{ width: `${Math.abs(correlation) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-yellow-200 w-12 text-right">{(correlation * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bottom Performers */}
      {bottomPerformers.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/40 to-slate-900/40 rounded-xl p-6 border border-red-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-red-300 to-rose-300 bg-clip-text text-transparent">📉 Areas for Improvement</h3>
          </div>
          <div className="space-y-2">
            {bottomPerformers.map((performer, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-900/50 to-rose-900/50 rounded-lg border border-red-700/30 hover:border-red-600/50 transition-colors">
                <div>
                  <p className="font-medium text-red-200">{idx + 1}. {performer.name}</p>
                  <p className="text-sm text-red-300/70">{performer.value.toFixed(2)}</p>
                </div>
                <span className="text-sm text-red-300 font-medium bg-red-600/40 px-3 py-1 rounded-full border border-red-500/30">Focus Area</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
