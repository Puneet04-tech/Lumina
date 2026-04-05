/**
 * Advanced Analytics Engine - No API Required
 * Generates professional insights and analysis without external dependencies
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
 * Main advanced analysis function
 */
export const performAdvancedAnalysis = (data, columns, metricColumn, dimensionColumn) => {
  if (!data || data.length === 0) {
    return { success: false, message: 'No data to analyze' };
  }

  try {
    // Calculate basic stats
    const values = data.map(r => parseFloat(r[metricColumn])).filter(v => !isNaN(v));
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    const average = count > 0 ? sum / count : 0;
    const min = count > 0 ? Math.min(...values) : 0;
    const max = count > 0 ? Math.max(...values) : 0;

    const basicStats = {
      count,
      sum: Math.round(sum * 100) / 100,
      average: Math.round(average * 100) / 100,
      max: Math.round(max * 100) / 100,
      min: Math.round(min * 100) / 100,
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
    const recommendations = generateRecommendations(
      data,
      columns,
      basicStats,
      topPerformers,
      outlierAnalysis.outliers
    );

    // Find correlations with other numeric columns
    const numericColumns = columns.filter(
      col => col !== metricColumn && typeof data[0]?.[col] === 'number'
    );
    const correlations = {};
    numericColumns.slice(0, 3).forEach(col => {
      correlations[col] = calculateCorrelation(data, metricColumn, col);
    });

    // Generate insights text
    const insights = {
      insight: `${dimensionColumn} drives ${metricColumn}. Top performer "${topPerformers[0]?.name}" has ${topPerformers[0]?.value.toFixed(0)} (${((topPerformers[0]?.value / sum) * 100).toFixed(1)}% of total).`,
      summary: `Analysis of ${count} records shows average ${metricColumn} of ${average.toFixed(2)}. Range: ${min.toFixed(2)} to ${max.toFixed(2)}. Outliers detected: ${outlierAnalysis.count}. Data completeness: ${dataQuality.completeness}%.`,
      recommendation: recommendations.join(' '),
      chartType: 'bar',
      confidence: Math.min(0.95, 0.7 + (dataQuality.completeness / 200)),
    };

    return {
      success: true,
      stats: basicStats,
      insights,
      analysis: {
        topPerformers,
        bottomPerformers,
        outliers: outlierAnalysis,
        trend,
        dataQuality,
        correlations,
        outlierCount: outlierAnalysis.count,
        trendDirection: trend.direction,
        trendStrength: trend.strength,
        percentChange: trend.percentChange,
      },
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
