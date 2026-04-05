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
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-slate-900">🏆 Top Performers</h3>
          </div>
          <div className="space-y-2">
            {topPerformers.map((performer, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-slate-900">{idx + 1}. {performer.name}</p>
                  <p className="text-sm text-slate-600">{performer.value.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
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
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900">📈 Trend Analysis</h3>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-700 font-medium">Direction: <span className="capitalize font-semibold text-blue-600">{trend.direction}</span></span>
              <span className="text-2xl font-bold text-blue-600">{trend.percentChange}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(trend.strength * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Trend strength: {(trend.strength * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Outlier Detection */}
      {outliers.count > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">⚠️ Outliers Detected</h3>
          </div>
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p className="text-lg font-bold text-amber-700 mb-2">{outliers.count} outliers found</p>
            <p className="text-sm text-slate-600">
              Values outside range: {outliers.lowerBound?.toFixed(2)} - {outliers.upperBound?.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-2">These unusual values may indicate data quality issues or significant events.</p>
          </div>
        </div>
      )}

      {/* Data Quality */}
      {dataQuality.completeness !== undefined && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-900">📊 Data Quality</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Completeness</p>
              <p className="text-2xl font-bold text-purple-600">{dataQuality.completeness}%</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Uniqueness</p>
              <p className="text-2xl font-bold text-indigo-600">{dataQuality.uniquenessScore}%</p>
            </div>
          </div>
          {dataQuality.issues && dataQuality.issues.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700 mb-2">Issues Found:</p>
              <ul className="text-sm text-red-600 space-y-1">
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
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-slate-900">🔗 Correlations</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(correlations)
              .filter(([_, corr]) => Math.abs(corr) > 0.1)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .map(([column, correlation], idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-sm font-medium text-slate-700">{column}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-yellow-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${correlation > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(correlation) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-12 text-right">{(correlation * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bottom Performers */}
      {bottomPerformers.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-slate-900">📉 Areas for Improvement</h3>
          </div>
          <div className="space-y-2">
            {bottomPerformers.map((performer, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-slate-900">{idx + 1}. {performer.name}</p>
                  <p className="text-sm text-slate-600">{performer.value.toFixed(2)}</p>
                </div>
                <span className="text-sm text-red-600 font-medium">Focus Area</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
