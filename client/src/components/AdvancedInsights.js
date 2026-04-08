'use client';

import { TrendingUp, AlertCircle, CheckCircle, Target, Zap, Database, TrendingDown, Activity, BarChart3, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react';

export function AdvancedInsights({ analysis }) {
  if (!analysis) return null;

  const {
    topPerformers = [],
    bottomPerformers = [],
    opportunityItems = [],
    outliers = {},
    trend = {},
    dataQuality = {},
    correlations = {},
    insights = [],
    analysis: aiSummary = {}, // This contains 'answer' and 'recommendations'
  } = analysis;

  // Split AI recommendations into categories
  const getStrategyTiers = (rec) => {
    if (!rec) return [];
    // Priority 1 (Immediate): [Action]; Priority 2 (Strategic): [Action]; Priority 3 (Transformation): [Action]
    return rec.split(';').map(tier => {
      const [title, description] = tier.split(':').map(s => s.trim());
      return { title: title || 'Strategic Action', description: description || tier };
    });
  };

  const strategyTiers = getStrategyTiers(aiSummary.recommendations);

  // Calculate top performer impact
  const topPerformerTotal = topPerformers.reduce((sum, p) => sum + (p?.value || 0), 0);
  const topPerformerShare = topPerformers.length > 0 && topPerformers[0]?.value ? (topPerformers[0].value / Math.max(topPerformerTotal, 1) * 100) : 0;
  
  // Calculate performance spread
  const allPerformers = [...topPerformers, ...bottomPerformers];
  const avgPerformance = allPerformers.length > 0 ? allPerformers.reduce((sum, p) => sum + (p?.value || 0), 0) / allPerformers.length : 0;
  const topToBottomRatio = bottomPerformers.length > 0 && bottomPerformers[bottomPerformers.length - 1]?.value && topPerformers[0]?.value 
    ? (topPerformers[0].value / Math.max(bottomPerformers[bottomPerformers.length - 1].value, 1)).toFixed(2)
    : 0;

  // Data quality assessment
  const qualityScore = Math.round(((dataQuality.completeness || 0) + (dataQuality.uniquenessScore || 0)) / 2);
  const qualityStatus = qualityScore >= 90 ? 'Excellent' : qualityScore >= 75 ? 'Good' : qualityScore >= 60 ? 'Fair' : 'Poor';

  return (
    <div className="space-y-6">
      {/* Executive Intelligence Answer Card */}
      {aiSummary.answer && (
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl p-6 border border-indigo-700/50 backdrop-blur-md animate-slideInDown shadow-2xl shadow-indigo-500/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-600/30 rounded-lg border border-indigo-500/40">
              <Lightbulb className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">Master Intelligence Summary</h3>
              <p className="text-slate-200 text-lg leading-relaxed">{aiSummary.answer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Roadmap (3-Tier Strategy) */}
      {strategyTiers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideInUp" style={{animationDelay: '0.1s'}}>
          {strategyTiers.map((tier, idx) => (
            <div key={idx} className={`p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${
              idx === 0 ? 'bg-rose-900/40 border-rose-700/50' :
              idx === 1 ? 'bg-amber-900/40 border-amber-700/50' :
              'bg-blue-900/40 border-blue-700/50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Zap className={`w-4 h-4 ${
                  idx === 0 ? 'text-rose-400' :
                  idx === 1 ? 'text-amber-400' :
                  'text-blue-400'
                }`} />
                <p className={`text-xs font-bold uppercase tracking-tight ${
                  idx === 0 ? 'text-rose-300' :
                  idx === 1 ? 'text-amber-300' :
                  'text-blue-300'
                }`}>{tier.title}</p>
              </div>
              <p className="text-white font-medium text-sm leading-snug">{tier.description}</p>
            </div>
          ))}
        </div>
      )}

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
          <p className="text-amber-300/70 text-xs mt-1">Outliers • {outliers.lowerBound !== undefined && outliers.upperBound !== undefined ? `Range: ${(outliers.lowerBound || 0).toFixed(0)}-${(outliers.upperBound || 0).toFixed(0)}` : 'Review data'}</p>
        </div>
      </div>

      {/* Hybrid Insights Section */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl p-6 border border-indigo-700/30 backdrop-blur-sm animate-slideInUp shadow-lg shadow-indigo-500/10" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">🧠 Hybrid Intelligence Insights</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((insight, idx) => {
              const isAI = String(insight).includes('🤖');
              const cleanInsight = String(insight).replace('🤖 AI Insight: ', '').replace('📊 Statistical Fact: ', '');
              
              return (
                <div key={idx} className={`p-4 rounded-lg border transition-all hover:bg-slate-800/40 flex gap-4 ${
                  isAI ? 'bg-indigo-900/20 border-indigo-500/20' : 'bg-slate-900/20 border-slate-700/30'
                }`}>
                  <div className={`mt-1 p-2 rounded-lg shrink-0 h-fit ${
                    isAI ? 'bg-indigo-500/20' : 'bg-slate-700/30'
                  }`}>
                    {isAI ? <Zap className="w-4 h-4 text-indigo-400" /> : <Database className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold mb-1 uppercase tracking-[0.1em] ${isAI ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {isAI ? 'AI Strategic Insight' : 'Statistical Fact'}
                    </p>
                    <p className="text-slate-200 text-[13px] leading-relaxed font-medium">
                      {cleanInsight}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 rounded-xl p-6 border border-green-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">🏆 Top Performers Analysis</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.map((performer, idx) => {
              const perfValue = performer?.value || 0;
              const percentage = topPerformerTotal > 0 ? (perfValue / topPerformerTotal * 100) : 0;
              return (
                <div key={idx} className="p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg border border-green-700/30 hover:border-green-600/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-green-200 text-lg">#{idx + 1} • {performer?.name || 'Unknown'}</p>
                      <p className="text-green-300/70 text-sm">Value: <span className="text-green-200 font-semibold">{(perfValue || 0).toFixed(2)}</span></p>
                    </div>
                    <span className="px-3 py-1 bg-green-600/40 text-green-200 rounded-full text-sm font-bold border border-green-500/30">
                      {isFinite(percentage) ? percentage.toFixed(1) : '0'}%
                    </span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-3 border border-green-700/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" style={{width: `${Math.min(Math.max(percentage, 0), 100)}%`}}></div>
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
                {trend.direction?.toLowerCase() === 'upward' ? (
                  <>
                    <ArrowUp className="w-6 h-6 text-green-400" />
                    <p className="text-2xl font-bold text-green-200 capitalize">{trend.direction}</p>
                  </>
                ) : trend.direction?.toLowerCase() === 'downward' ? (
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
              <p className="text-3xl font-bold text-blue-200">{isFinite(trend.percentChange || 0) ? (trend.percentChange || 0).toFixed(1) : '0'}%</p>
              <p className="text-blue-300/70 text-xs mt-2">Period-over-Period Change</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
              <p className="text-blue-300 text-sm font-semibold mb-2">Trend Strength</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-blue-200">{isFinite((trend.strength || 0) * 100) ? ((trend.strength || 0) * 100).toFixed(0) : '0'}%</p>
              </div>
              <div className="w-full bg-blue-900/30 rounded-full h-2 mt-2 border border-blue-700/30 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" style={{width: `${Math.min(Math.max((trend.strength || 0) * 100, 0), 100)}%`}}></div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          {/* Deep Reasoning Panel */}
          {outliers.reasons && outliers.reasons.length > 0 && (
            <div className="space-y-3">
              <p className="text-amber-300 text-xs font-bold uppercase tracking-widest pl-1 mb-2">🧠 Deep Reasoning Analysis</p>
              {outliers.reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg group hover:bg-amber-800/20 transition-all">
                  <div className={`mt-1 p-2 rounded-lg h-fit ${
                    reason.severity === 'High' || reason.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-amber-200">{reason.item}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                        reason.severity === 'High' || reason.severity === 'Critical' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                      }`}>
                        {reason.severity || 'Medium'} Risk
                      </span>
                    </div>
                    <p className="text-amber-300/80 text-sm leading-relaxed">{reason.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      {correlation > 0 ? '▲' : '▼'} {isFinite(correlation * 100) ? (correlation * 100).toFixed(0) : '0'}%
                    </span>
                  </div>
                  <div className="w-full bg-yellow-900/30 rounded-full h-3 border border-yellow-700/30 overflow-hidden">
                    <div
                      className={`h-full ${correlation > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
                      style={{ width: `${Math.min(Math.max(Math.abs(correlation) * 100, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Strategic Actions & Growth Opportunities */}
      {analysis.opportunityItems && analysis.opportunityItems.length > 0 && (
        <div className="bg-gradient-to-br from-orange-900/40 to-slate-900/40 rounded-xl p-6 border border-orange-700/30 backdrop-blur-sm animate-slideInUp" style={{animationDelay: '0.45s'}}>
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-300 to-yellow-300 bg-clip-text text-transparent">⚡ Strategic Actions & Growth Opportunities</h3>
          </div>
          
          <div className="space-y-4">
            {/* Quick Wins Section */}
            {analysis.opportunityItems.filter(item => item.isQuickWin).length > 0 && (
              <div className="mb-6">
                <p className="text-orange-300 text-sm font-bold mb-3">🎯 QUICK WINS (High-Impact, Low-Effort)</p>
                <div className="space-y-3">
                  {analysis.opportunityItems.filter(item => item.isQuickWin).map((item, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-orange-900/50 to-yellow-900/50 rounded-lg border border-orange-600/50 hover:border-orange-500/70 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-orange-200 text-lg">→ {item?.name || 'Unknown'}</p>
                          <p className="text-orange-300/70 text-sm">Current: <span className="text-orange-200 font-semibold">{(item?.value || 0).toFixed(2)}</span></p>
                        </div>
                        <span className="px-3 py-1 bg-orange-600/60 text-orange-100 rounded-full text-xs font-bold border border-orange-400/50">
                          {item?.priority || 'Medium'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-orange-300/60 text-xs">Gap to Top</p>
                          <p className="text-lg font-bold text-yellow-300">{(item?.gapToTop || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-orange-300/60 text-xs">Improvement Needed</p>
                          <p className="text-lg font-bold text-green-300">{isFinite(item?.improvementNeeded || 0) ? (item?.improvementNeeded || 0).toFixed(1) : '0'}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-orange-900/30 rounded-full h-2 border border-orange-700/30 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-400 to-yellow-300 h-full" style={{width: `${Math.min(Math.max((item?.value || 0) / (topPerformers[0]?.value || 1) * 100, 0), 100)}%`}}></div>
                      </div>
                      <p className="text-orange-300/70 text-xs mt-2">📌 Action: Focus on replicating {topPerformers[0]?.name || 'top performer'}'s success factors</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Improvement Targets */}
            {analysis.opportunityItems.filter(item => !item.isQuickWin).length > 0 && (
              <div>
                <p className="text-orange-300 text-sm font-bold mb-3">📊 STRATEGIC TARGETS (Improvement Potential)</p>
                <div className="space-y-3">
                  {analysis.opportunityItems.filter(item => !item.isQuickWin).map((item, idx) => (
                    <div key={idx} className="p-4 bg-orange-900/30 rounded-lg border border-orange-700/30 hover:border-orange-600/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-orange-200">{item?.name || 'Unknown'}</p>
                          <p className="text-orange-300/70 text-sm">Value: {(item?.value || 0).toFixed(2)} | Gap: {(item?.gapToTop || 0).toFixed(2)} ({isFinite(item?.improvementNeeded || 0) ? (item?.improvementNeeded || 0).toFixed(1) : '0'}%)</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded text-white border ${item?.priority === 'High' ? 'bg-red-600/40 border-red-500/30' : item?.priority === 'Medium' ? 'bg-yellow-600/40 border-yellow-500/30' : 'bg-blue-600/40 border-blue-500/30'}`}>
                          {item?.priority || 'Medium'}
                        </span>
                      </div>
                      <div className="w-full bg-orange-900/30 rounded-full h-2 border border-orange-700/30 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full" style={{width: `${Math.min(Math.max((item?.value || 0) / (topPerformers[0]?.value || 1) * 100, 5), 100)}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strategic Recommendations */}
          <div className="mt-6 p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
            <p className="text-orange-300 text-sm font-semibold mb-2">💡 Strategic Recommendations:</p>
            <ul className="text-orange-300/70 text-sm space-y-1">
              {(analysis?.opportunityItems?.filter(item => item?.isQuickWin)?.length || 0) > 0 && (
                <li>• <span className="text-orange-200">Prioritize Quick Wins:</span> {analysis?.opportunityItems?.filter(item => item?.isQuickWin)?.length || 0} items are 75%+ of top performer—close these gaps first for immediate ROI</li>
              )}
              <li>• <span className="text-orange-200">Benchmark Best Practices:</span> Conduct deep-dive on {topPerformers[0]?.name || 'top performer'} success factors and replicate across underperformers</li>
              <li>• <span className="text-orange-200">Resource Allocation:</span> Focus budget toward high-priority items ({analysis?.opportunityItems?.filter(item => item?.priority === 'High')?.length || 0} items) for maximum impact</li>
              <li>• <span className="text-orange-200">Performance Monitoring:</span> Track progress monthly—expect {topPerformers[0]?.value && avgPerformance ? ((avgPerformance / (topPerformers[0]?.value || 1) * 100).toFixed(0)) : '0'}% uplift potential if targets met</li>
            </ul>
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
          <p>✓ Top performer <span className="font-semibold text-green-300">{topPerformers[0]?.name || 'N/A'}</span> drives <span className="font-semibold">{isFinite(topPerformerShare) ? topPerformerShare.toFixed(1) : '0'}%</span> of total value</p>
          <p>✓ Performance spread is <span className="font-semibold text-blue-300">{topToBottomRatio || '0'}x</span> between best and worst performers</p>
          <p>✓ Data quality score: <span className="font-semibold text-indigo-300">{qualityScore}%</span> ({qualityStatus})</p>
          <p>✓ Trend direction is <span className="font-semibold">{trend?.direction || 'Stable'}</span> with <span className="font-semibold text-amber-300">{isFinite((trend?.strength || 0) * 100) ? ((trend?.strength || 0) * 100).toFixed(0) : '0'}%</span> strength</p>
          {(outliers?.count || 0) > 0 && <p>⚠️ {outliers.count} anomalies detected — review for data quality or business significance</p>}
        </div>
      </div>
    </div>
  );
}
