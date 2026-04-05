/**
 * Advanced Analytics Engine
 * Generates professional insights using local analysis (no API needed)
 * Gemini API not used - local analysis is excellent!
 */

/**
 * Calculate correlation between two numeric columns
 */
const calculateCorrelation = (data, col1, col2) => {
  const values1 = data.map(r => parseFloat(r[col1])).filter(v => !isNaN(v));
  const values2 = data.map(r => parseFloat(r[col2])).filter(v => !isNaN(v));

  if (values1.length < 2 || values2.length < 2) return 0;

  const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
  const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

  let numerator = 0;
  let sum1 = 0;
  let sum2 = 0;

  for (let i = 0; i < Math.min(values1.length, values2.length); i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    sum1 += diff1 * diff1;
    sum2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1 * sum2);
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Detect outliers using IQR method
 */
const detectOutliers = (values, threshold = 1.5) => {
  if (values.length < 4) return { outliers: [], count: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;

  const outliers = values.filter(v => v < lowerBound || v > upperBound);
  return { outliers, count: outliers.length, lowerBound, upperBound };
};

/**
 * Calculate trend direction and strength
 */
const calculateTrend = (values) => {
  if (values.length < 2) return { direction: 'flat', strength: 0, percentChange: 0 };

  const first = values[0];
  const last = values[values.length - 1];
  const percentChange = ((last - first) / first) * 100;

  let direction = 'flat';
  let strength = 0;

  if (percentChange > 5) {
    direction = 'upward';
    strength = Math.min(percentChange / 50, 1); // Normalize to 0-1
  } else if (percentChange < -5) {
    direction = 'downward';
    strength = Math.min(Math.abs(percentChange) / 50, 1);
  }

  return { direction, strength, percentChange: Math.round(percentChange * 100) / 100 };
};

/**
 * Detect top and bottom performers
 */
const getTopBottomPerformers = (data, column, groupByColumn, limit = 5) => {
  const grouped = {};

  data.forEach(row => {
    const key = row[groupByColumn];
    const value = parseFloat(row[column]);
    if (!isNaN(value)) {
      grouped[key] = (grouped[key] || 0) + value;
    }
  });

  const sorted = Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    top: sorted.slice(0, limit),
    bottom: sorted.slice(-limit).reverse(),
  };
};

/**
 * Calculate data quality metrics
 */
const calculateDataQuality = (data, columns) => {
  const metrics = {
    totalRows: data.length,
    completeness: 0,
    uniquenessScore: 0,
    consistencyScore: 100,
    issues: [],
  };

  let totalCells = 0;
  let filledCells = 0;
  let uniqueValues = 0;
  let totalValues = 0;

  columns.forEach(col => {
    const colData = data.map(r => r[col]);
    totalCells += colData.length;

    // Check for missing/empty values
    const nonEmpty = colData.filter(v => v !== null && v !== '' && v !== undefined);
    filledCells += nonEmpty.length;

    // Check unique values
    const unique = new Set(nonEmpty).size;
    uniqueValues += unique;
    totalValues += nonEmpty.length;

    if (nonEmpty.length === 0) {
      metrics.issues.push(`Column "${col}" is completely empty`);
    }

    if (unique === 1 && nonEmpty.length > 1) {
      metrics.issues.push(`Column "${col}" has only one unique value`);
    }
  });

  metrics.completeness = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
  metrics.uniquenessScore = totalValues > 0 ? Math.round((uniqueValues / totalValues) * 100) : 0;

  return metrics;
};

/**
 * Generate period-over-period growth rates
 */
const calculateGrowthRates = (data, valueColumn, periodColumn) => {
  const periods = {};

  data.forEach(row => {
    const period = row[periodColumn];
    const value = parseFloat(row[valueColumn]);
    if (!isNaN(value)) {
      periods[period] = (periods[period] || 0) + value;
    }
  });

  const sorted = Object.entries(periods).sort((a, b) => a[0].localeCompare(b[0]));
  const growthRates = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1][1];
    const curr = sorted[i][1];
    const growth = prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
    growthRates.push({
      period: sorted[i][0],
      value: curr,
      growth: Math.round(growth * 100) / 100,
    });
  }

  return growthRates;
};

/**
 * Generate smart recommendations based on analysis
 */
const generateRecommendations = (data, columns, stats, topPerformers, outliers) => {
  const recommendations = [];

  // Check for high variance
  const numericCols = columns.filter(col => typeof data[0]?.[col] === 'number');
  
  numericCols.forEach(col => {
    const values = data.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const coeffVar = (stdDev / mean) * 100;

      if (coeffVar > 50) {
        recommendations.push(`High variability detected in ${col}. Consider investigating ${coeffVar.toFixed(1)}% coefficient of variation.`);
      }
    }
  });

  // Outlier recommendations
  if (outliers && outliers.length > 0) {
    const outliersPercent = (outliers.length / data.length) * 100;
    recommendations.push(`Found ${outliers.length} outliers (${outliersPercent.toFixed(1)}% of data). Review these unusual values.`);
  }

  // Top performers insight
  if (topPerformers && topPerformers.length > 0) {
    const topValue = topPerformers[0]?.value;
    const avgValue = topPerformers.reduce((sum, p) => sum + p.value, 0) / topPerformers.length;
    const uplift = ((topValue - avgValue) / avgValue) * 100;
    recommendations.push(`Top performer is ${uplift.toFixed(1)}% above average. Analyze success factors.`);
  }

  // Data quality recommendations
  if (recommendations.length === 0) {
    recommendations.push('Data quality is good. Focus on growth opportunities and trend analysis.');
  }

  return recommendations;
};

/**
 * Main advanced analysis function with AI integration
 */
export const performAdvancedAnalysis = async (data, columns, metricColumn, dimensionColumn) => {
  if (!data || data.length === 0) {
    return { success: false, message: 'No data to analyze' };
  }

  try {
    // Calculate enhanced stats
    const values = data.map(r => parseFloat(r[metricColumn])).filter(v => !isNaN(v));
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    const average = count > 0 ? sum / count : 0;
    const min = count > 0 ? Math.min(...values) : 0;
    const max = count > 0 ? Math.max(...values) : 0;
    const range = max - min;

    // Calculate median
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    // Calculate standard deviation and variance
    const variance = count > 1 ? values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / count : 0;
    const stdDev = Math.sqrt(variance);

    // Calculate quartiles
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index] || 0;
    const q3 = sorted[q3Index] || 0;
    const iqr = q3 - q1;

    // Unique values count
    const uniqueValues = new Set(values).size;

    // Coefficient of Variation
    const cv = average !== 0 ? (stdDev / average) * 100 : 0;

    const basicStats = {
      count,
      sum: Math.round(sum * 100) / 100,
      average: Math.round(average * 100) / 100,
      median: Math.round(median * 100) / 100,
      max: Math.round(max * 100) / 100,
      min: Math.round(min * 100) / 100,
      range: Math.round(range * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      q1: Math.round(q1 * 100) / 100,
      q3: Math.round(q3 * 100) / 100,
      iqr: Math.round(iqr * 100) / 100,
      uniqueValues,
      coefficientOfVariation: Math.round(cv * 100) / 100,
    };

    // Advanced Analysis
    const outlierAnalysis = detectOutliers(values);
    const trend = calculateTrend(values);
    const { top: topPerformers, bottom: bottomPerformers } = getTopBottomPerformers(
      data,
      metricColumn,
      dimensionColumn
    );
    const dataQuality = calculateDataQuality(data, columns);

    // Find correlations with other numeric columns
    const numericColumns = columns.filter(
      col => col !== metricColumn && typeof data[0]?.[col] === 'number'
    );
    const correlations = {};
    numericColumns.slice(0, 3).forEach(col => {
      correlations[col] = calculateCorrelation(data, metricColumn, col);
    });

    // Calculate performance gaps and opportunities
    const topPerformerValue = topPerformers[0]?.value || 0;
    const opportunityItems = bottomPerformers
      .map(performer => {
        const gapToTop = topPerformerValue - performer.value;
        const gapToAverage = average - performer.value;
        const improvementPercent = ((gapToTop / topPerformerValue) * 100);
        const quickWinThreshold = topPerformerValue * 0.75; // Within 75% of top
        const isQuickWin = performer.value > quickWinThreshold;
        
        return {
          name: performer.name,
          value: performer.value,
          gapToTop: Math.round(gapToTop * 100) / 100,
          gapToAverage: Math.round(gapToAverage * 100) / 100,
          improvementNeeded: Math.round(improvementPercent * 100) / 100,
          isQuickWin,
          priority: isQuickWin ? 'High' : improvementPercent < 50 ? 'Low' : 'Medium',
        };
      })
      .sort((a, b) => {
        // Prioritize quick wins, then by improvement potential
        if (a.isQuickWin && !b.isQuickWin) return -1;
        if (!a.isQuickWin && b.isQuickWin) return 1;
        return b.gapToTop - a.gapToTop;
      });

    // Prepare analysis data for Gemini
    const analysis = {
      topPerformers,
      bottomPerformers,
      opportunityItems,
      outliers: outlierAnalysis,
      trend,
      dataQuality,
      correlations,
      outlierCount: outlierAnalysis.count,
      trendDirection: trend.direction,
      trendStrength: trend.strength,
      percentChange: trend.percentChange,
    };

    // Generate local insights (Gemini not used - excellent results already!)
    const performanceSpread = topPerformers[0]?.value / (bottomPerformers[bottomPerformers.length - 1]?.value || 1);
    const topConsumesPercentage = (topPerformers[0]?.value / sum * 100);
    const variabilityScore = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / count);
    const coefficientOfVariation = (variabilityScore / average * 100);
    
    // Determine performance concentration
    let concentrationLevel = 'distributed';
    if (topConsumesPercentage > 50) concentrationLevel = 'highly concentrated';
    else if (topConsumesPercentage > 30) concentrationLevel = 'moderately concentrated';
    else if (topConsumesPercentage > 15) concentrationLevel = 'somewhat balanced';
    
    // Trend interpretation
    let trendInterpretation = '';
    if (trend.direction === 'upward') {
      trendInterpretation = `showing ${trend.strength > 0.7 ? 'strong' : trend.strength > 0.4 ? 'moderate' : 'subtle'} upward momentum of ${trend.percentChange}%`;
    } else if (trend.direction === 'downward') {
      trendInterpretation = `declining with ${trend.strength > 0.7 ? 'high' : trend.strength > 0.4 ? 'moderate' : 'mild'} pressure, down ${Math.abs(trend.percentChange)}%`;
    } else {
      trendInterpretation = `remaining relatively stable with minimal fluctuation`;
    }
    
    // Risk assessment
    let riskLevel = 'Low Risk';
    let riskFactors = [];
    if (outlierAnalysis.count > count * 0.05) {
      riskLevel = 'Medium Risk';
      riskFactors.push(`${Math.round(outlierAnalysis.count / count * 100)}% anomalies detected`);
    }
    if (coefficientOfVariation > 50) {
      riskLevel = 'Medium Risk';
      riskFactors.push(`High variability (CV: ${coefficientOfVariation.toFixed(0)}%)`);
    }
    if (dataQuality.completeness < 80) {
      riskLevel = 'High Risk';
      riskFactors.push(`Low data completeness (${dataQuality.completeness}%)`);
    }
    
    // Generate multi-faceted insights
    const advancedInsight = `${dimensionColumn} exhibits ${concentrationLevel} distribution. Primary driver "${topPerformers[0]?.name}" commands ${topConsumesPercentage.toFixed(1)}% of total ${metricColumn}. Performance ratio between top and bottom is ${performanceSpread.toFixed(1)}x. Data is ${trendInterpretation}. Risk Assessment: ${riskLevel}${riskFactors.length > 0 ? ' — ' + riskFactors.join('; ') : ''}.`;
    
    const advancedSummary = `Dataset comprises ${count} observations with ${columns.length} variables. ${metricColumn} averages ${average.toFixed(2)} (σ=${variabilityScore.toFixed(2)}, CV=${coefficientOfVariation.toFixed(1)}%). Value distribution spans ${min.toFixed(2)}-${max.toFixed(2)} with ${outlierAnalysis.count} significant outliers. Data integrity: ${dataQuality.completeness}% complete, ${dataQuality.uniquenessScore}% unique. ${topPerformers.length} top performers identified contributing ${topPerformers.reduce((sum, p) => sum + p.value, 0).toFixed(0)} total. Strategic focus needed on bottom-performing segments.`;
    
    const correlationInsights = Object.entries(correlations)
      .filter(([_, corr]) => Math.abs(corr) > 0.5)
      .map(([col, corr]) => `Strong ${corr > 0 ? 'positive' : 'negative'} correlation with ${col} (${Math.abs(corr * 100).toFixed(0)}%)`)
      .join('. ');
    
    const recommendations = generateRecommendations(
      data,
      columns,
      basicStats,
      topPerformers,
      outlierAnalysis.outliers
    );
    
    const advancedRecommendation = recommendations.length > 0 
      ? recommendations.join(' ')
      : `Focus on replicating success factors from top performers. Investigate ${outlierAnalysis.count} anomalies for root causes. ${correlationInsights ? 'Leverage identified correlations: ' + correlationInsights + '.' : ''} Implement targeted interventions for underperforming segments to achieve competitive parity.`;

    const insights = {
      insight: advancedInsight,
      summary: advancedSummary,
      recommendation: advancedRecommendation,
      chartType: 'bar',
      confidence: Math.min(0.98, 0.65 + (dataQuality.completeness / 250) + (1 - Math.min(outlierAnalysis.count / count, 0.3)) * 0.2),
      source: 'local-analysis',
      riskLevel,
      performanceRatio: performanceSpread.toFixed(1),
      concentration: concentrationLevel,
      trendStatus: trendInterpretation,
    };

    return {
      success: true,
      stats: basicStats,
      insights,
      analysis,
    };
  } catch (error) {
    console.error('Advanced analysis error:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Generate comparison insights for grouped data
 */
export const generateComparisonInsights = (data, columns, valueColumn, groupColumn) => {
  const groups = {};

  data.forEach(row => {
    const group = row[groupColumn];
    const value = parseFloat(row[valueColumn]);
    if (!isNaN(value)) {
      if (!groups[group]) groups[group] = [];
      groups[group].push(value);
    }
  });

  const comparisons = Object.entries(groups).map(([name, values]) => {
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      name,
      count: values.length,
      sum: Math.round(sum * 100) / 100,
      average: Math.round(avg * 100) / 100,
      max,
      min,
    };
  });

  return comparisons.sort((a, b) => b.sum - a.sum);
};
