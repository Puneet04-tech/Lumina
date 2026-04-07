import { File } from '../models/File.js';
import { Dashboard } from '../models/Dashboard.js';
import { checkConnection } from '../config/database.js';
import { memoryStore } from '../config/memoryStore.js';
import axios from 'axios';

/**
 * Calculate comprehensive statistics
 */
const calculateStats = (data, key) => {
  if (!data || data.length === 0) return {};

  const values = data
    .map((item) => {
      const val = item[key];
      // Handle various number formats
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    })
    .filter((v) => !isNaN(v) && v !== null);
  
  if (values.length === 0) {
    console.log(`⚠️ No valid numeric values found for key: "${key}"`);
    return {};
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const result = {
    sum: parseFloat(sum.toFixed(2)),
    average: parseFloat(avg.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    count: values.length,
    range: parseFloat((max - min).toFixed(2)),
    q1: parseFloat(q1.toFixed(2)),
    q3: parseFloat(q3.toFixed(2)),
    iqr: parseFloat(iqr.toFixed(2)),
    variance: parseFloat(variance.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    uniqueValues: new Set(values).size,
    coefficientOfVariation: avg !== 0 ? parseFloat((stdDev / avg * 100).toFixed(2)) : 0
  };
  
  console.log(`   Stats calculated:`, result);
  return result;
};

/**
 * Analyze data with Groq API (Free tier, globally accessible)
 */
const analyzeWithGroq = async (data, columns, query, metric, dimension) => {
  try {
    const token = process.env.GROQ_API_TOKEN;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!token) {
      console.log('⚠️ Groq API token not configured, using local intelligence');
      return null;
    }

    const dataSample = data.slice(0, 15);
    const topPerformers = [...data].sort((a, b) => b[metric] - a[metric]).slice(0, 5);
    const bottomPerformers = [...data].sort((a, b) => a[metric] - b[metric]).slice(0, 3);
    
    const userPrompt = `You are a Senior Data Scientist and Strategic Business Consultant. Analyze the provided dataset for the metric "${metric}" across the dimension "${dimension}".

Data Context:
- Dataset Size: ${data.length} records
- Metric: ${metric}
- Dimension: ${dimension}
- Top 5 Performers: ${JSON.stringify(topPerformers.map(d => ({[dimension]: d[dimension], [metric]: d[metric]})))}
- Bottom 3 Performers: ${JSON.stringify(bottomPerformers.map(d => ({[dimension]: d[dimension], [metric]: d[metric]})))}
- Detailed Data Sample: ${JSON.stringify(dataSample.map(d => ({[dimension]: d[dimension], [metric]: d[metric]})))}

User's Specific Query: "${query}"

Instructions:
1. Provide a "Master Intelligence Report" that goes beyond surface-level observations.
2. Identify hidden correlations, performance clusters, and volatile segments.
3. Calculate or estimate the potential ROI or impact of optimizing the bottom performers to reach at least the median.
4. Give 5-7 distinct, high-value insights. Each insight should follow the format: "[Focus Area]: [Observation] -> [Business Impact]".
5. Provide 3-5 hyper-specific, prioritized strategic recommendations (Short-term, Medium-term, Long-term).

Response Format (STRICT JSON ONLY):
{
  "answer": "A comprehensive 2-3 sentence executive summary answering the user query directly.",
  "insights": [
    "Cluster Analysis: [Insight text...]",
    "Growth Opportunity: [Insight text...]",
    "Risk Mitigation: [Insight text...]",
    "Efficiency Gap: [Insight text...]",
    "Volatility Note: [Insight text...]"
  ],
  "recommendations": "Priority 1 (Immediate): [Action]; Priority 2 (Strategic): [Action]; Priority 3 (Transformation): [Action]"
}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an elite Data Science Agent. provide deep, non-obvious business intelligence and strategic advice. Never provide generic advice. ALWAYS respond with valid JSON only.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Handle response
    const content = response.data.choices[0].message.content;
    console.log('📩 Groq response received:', content.substring(0, 300));

    // Extract JSON from content - try multiple patterns
    let parsed = null;
    
    // Try to parse as direct JSON first
    try {
      parsed = JSON.parse(content);
      console.log('✅ Direct JSON parse succeeded');
    } catch (e1) {
      // Try to extract JSON object from text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON from text');
        } catch (e2) {
          console.log('⚠️ Failed to parse extracted JSON:', e2.message);
        }
      }
    }

    if (parsed) {
      console.log('✅ Successfully parsed Groq response');
      const result = {
        answer: parsed.answer || query,
        insights: Array.isArray(parsed.insights) ? parsed.insights : [String(parsed.insights || '')],
        recommendations: String(parsed.recommendations || 'Review the analysis'),
        // These will be enhanced by localAnalysis for complete response
      };
      console.log('🎯 Returning Groq insights');
      return result;
    }
    
    // Fallback: extract insights from raw text
    console.log('⚠️ No JSON found, using raw content as fallback');
    return {
      answer: content.substring(0, 300),
      insights: [content.substring(0, 200)],
      recommendations: 'Review the generated analysis'
    };
  } catch (error) {
    console.log('⚠️ Groq API error:', error.message, '- Falling back to local intelligence');
    return null;
  }
};

/**
 * Analyze data with local intelligence (fallback)
 */
const localAnalysis = (data, columns, metric, dimension) => {
  console.log(`\n📈 LOCAL ANALYSIS:`);
  console.log(`   Data rows: ${data.length}`);
  console.log(`   Metric: "${metric}", Dimension: "${dimension}"`);
  console.log(`   Sample rows:`, data.slice(0, 3));
  
  const insights = [];
  const stats = calculateStats(data, metric);
  
  // Calculate toppers
  const groupedData = {};
  data.forEach((row) => {
    const key = String(row[dimension]);
    if (!groupedData[key]) groupedData[key] = { sum: 0, count: 0, values: [] };
    const val = parseFloat(row[metric]) || 0;
    groupedData[key].sum += val;
    groupedData[key].count += 1;
    groupedData[key].values.push(val);
  });

  const sorted = Object.entries(groupedData)
    .map(([name, d]) => ({ 
      name, 
      value: d.sum, 
      avg: d.sum / d.count,
      values: d.values
    }))
    .sort((a, b) => b.value - a.value);

  console.log(`   ✅ Grouped into ${sorted.length} categories`);

  // Generate insights
  if (sorted.length > 0) {
    const top = sorted[0];
    const topPct = stats.sum > 0 ? (top.value / stats.sum * 100).toFixed(1) : 0;
    insights.push(`👑 Dominant Performer: ${top.name} represents ${topPct}% of the total ${metric} value (${parseFloat(top.value.toFixed(2))}).`);
    
    if (sorted.length > 1) {
      const bottom = sorted[sorted.length - 1];
      const ratio = bottom.value > 0 ? (top.value / bottom.value).toFixed(2) : '∞';
      insights.push(`⚖️ Performance Disparity: There is a ${ratio}x gap between top (${top.name}) and bottom (${bottom.name}) performers.`);
    }
  }

  if (stats.average) {
    const volatility = stats.average > 0 ? (stats.stdDev / stats.average * 100).toFixed(1) : 0;
    const desc = volatility > 50 ? "High Volatility" : volatility > 20 ? "Moderate Variation" : "Stable Distribution";
    insights.push(`📊 Distribution Profile: The data shows ${desc} (${volatility}% Coeff. of Variation) with an average of ${stats.average.toFixed(2)}.`);
    
    const aboveAvg = sorted.filter(s => s.value > stats.average).length;
    const belowAvg = sorted.length - aboveAvg;
    insights.push(`📈 Benchmarking: ${aboveAvg} items are performing above the mean, while ${belowAvg} items fall below it.`);
    
    if (stats.iqr > 0) {
      insights.push(`🎯 Concentration: 50% of your data clusters between ${stats.q1.toFixed(2)} and ${stats.q3.toFixed(2)} (${metric}).`);
    }
  }

  // Calculate trend
  const firstValue = sorted.length > 0 ? sorted[0].value : 0;
  const lastValue = sorted.length > 1 ? sorted[sorted.length - 1].value : firstValue;
  const percentChange = firstValue > 0 ? ((lastValue - firstValue) / firstValue * 100) : 0;
  
  const trend = {
    direction: sorted.length > 1 && sorted[0].value > sorted[1].value ? 'Upward' : sorted.length > 1 ? 'Downward' : 'Stable',
    strength: stats.average > 0 ? Math.min((stats.max - stats.min) / stats.average, 1) : 0,
    percentChange: isFinite(percentChange) ? Math.round(percentChange * 10) / 10 : 0
  };

  // Calculate outliers  
  const q1_index = Math.floor(sorted.length * 0.25);
  const q3_index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1_index]?.value || 0;
  const q3 = sorted[q3_index]?.value || 0;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = sorted.filter(s => s.value < lowerBound || s.value > upperBound);

  // Calculate data quality
  const completeness = Math.min(data.length / Math.max(sorted.length, 1) * 100, 100);
  const uniquenessScore = Math.min(sorted.length / data.length * 100, 100);

  return {
    insights: insights.length > 0 ? insights : ['Analysis complete'],
    recommendations: sorted.length > 0 ? 'Focus on top performers for maximum impact' : 'Consistent performance across segments',
    source: 'Local Intelligence Engine',
    topPerformers: sorted.slice(0, 5),
    bottomPerformers: sorted.slice(-3).reverse(),
    trend: trend,
    outliers: { 
      count: outliers.length,
      lowerBound: Math.max(0, lowerBound),
      upperBound: upperBound,
      items: outliers
    },
    dataQuality: {
      completeness: Math.round(completeness),
      uniquenessScore: Math.round(uniquenessScore)
    },
    opportunityItems: sorted.map(s => {
      const topValue = sorted.length > 0 ? sorted[0].value : 0;
      const gapToTop = topValue - s.value;
      const improvementNeeded = topValue > 0 ? (gapToTop / topValue * 100) : 0;
      return {
        name: s.name,
        value: s.value,
        currentValue: s.value,
        avgValue: stats.average,
        gapPercentage: stats.average > 0 ? ((stats.average - s.value) / stats.average * 100) : 0,
        gapToTop: gapToTop,
        improvementNeeded: improvementNeeded,
        priority: s.value < stats.average * 0.5 ? 'High' : s.value < stats.average ? 'Medium' : 'Low',
        isQuickWin: s.value > stats.average * 0.75 && s.value < stats.average
      };
    })
  };
};

/**
 * Query analysis - Grok API with local fallback
 */
export const queryAnalysis = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 DATA ANALYSIS QUERY');
    console.log('='.repeat(70));
    
    const { query, fileId } = req.body;

    if (!query || !fileId) {
      return res.status(400).json({ success: false, message: 'Missing query or fileId' });
    }

    console.log('📝 Query:', query);
    console.log('📁 File ID:', fileId);

    // Get file
    let file;
    if (checkConnection()) {
      file = await File.findOne({ _id: fileId, userId: req.user._id });
    } else {
      file = memoryStore.getFileById(fileId);
    }

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.data || file.data.length === 0) {
      return res.status(400).json({ success: false, message: 'File has no data' });
    }

    console.log(`📂 File loaded:`, {
      rowCount: file.data.length,
      columnCount: file.columns.length,
      columns: file.columns,
      firstRow: file.data[0],
      firstRowTypes: file.columns.map(col => `${col}=${typeof file.data[0][col]}`).join(', ')
    });

    // Identify numeric and text columns
    const numericColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'number'
    );
    const textColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'string'
    );

    console.log(`📊 Column analysis:`);
    console.log(`   All columns: ${file.columns.join(', ')}`);
    console.log(`   Numeric: ${numericColumns.join(', ')}`);
    console.log(`   Text: ${textColumns.join(', ')}`);
    console.log(`   First row types:`, file.columns.map(col => `${col}(${typeof file.data[0][col]})`).join(', '));

    // Find best metric and dimension
    let metric = numericColumns[0] || file.columns[0];
    let dimension = textColumns[0] || file.columns.find((c) => !numericColumns.includes(c)) || file.columns[1] || file.columns[0];

    console.log(`🔍 Selected metric: "${metric}", dimension: "${dimension}"`);

    // Generate chart data
    let chartData = [];
    if (metric && dimension && numericColumns.length > 0 && textColumns.length > 0) {
      const groupedData = {};
      file.data.forEach((row) => {
        const key = String(row[dimension]);
        if (!groupedData[key]) groupedData[key] = 0;
        groupedData[key] += parseFloat(row[metric]) || 0;
      });

      chartData = Object.entries(groupedData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20);
      
      console.log(`📊 Chart data created:`, {
        groupedItemsCount: Object.keys(groupedData).length,
        chartDataLength: chartData.length,
        top3: chartData.slice(0, 3)
      });
    } else {
      console.log(`⚠️ Chart data skipped - conditions not met:`, {
        hasMetric: !!metric,
        hasDimension: !!dimension,
        numericColsCount: numericColumns.length,
        textColsCount: textColumns.length
      });
    }

    // Try Groq API first
    console.log('🤖 Attempting Groq AI analysis...');
    let groqAnalysis = await analyzeWithGroq(file.data, file.columns, query, metric, dimension);
    
    // Always perform local analysis for full analytics
    const localResult = localAnalysis(file.data, file.columns, metric, dimension);
    
    let analysisResult;
    let source = 'Unknown';

    if (groqAnalysis && groqAnalysis.insights) {
      console.log('✅ Groq API succeeded, merging with local insights');
      
      // Categorize and merge insights for a "Power Dashboard"
      const aiInsights = groqAnalysis.insights.map(i => `🤖 AI Insight: ${i}`);
      const localInsights = localResult.insights.map(i => `📊 Statistical Fact: ${i}`);
      
      // Interleave AI and Statistical insights for a rich mix
      const combinedInsights = [];
      const maxLength = Math.max(aiInsights.length, localInsights.length);
      for (let i = 0; i < maxLength; i++) {
        if (aiInsights[i]) combinedInsights.push(aiInsights[i]);
        if (localInsights[i]) combinedInsights.push(localInsights[i]);
      }

      analysisResult = {
        ...localResult,
        answer: groqAnalysis.answer || localResult.answer,
        insights: combinedInsights,
        recommendations: groqAnalysis.recommendations || localResult.recommendations
      };
      source = 'Lumina Hybrid Intelligence (Groq AI + Local Stats)';
    } else {
      // Use local intelligence
      console.log('📊 Using local intelligence fallback');
      analysisResult = {
        ...localResult,
        insights: localResult.insights.map(i => `📊 Statistical Fact: ${i}`)
      };
      source = 'Lumina Local Intelligence Engine';
    }

    const results = {
      type: 'bar',
      data: chartData,
      stats: calculateStats(file.data, metric),
      insights: analysisResult.insights || [],
      analysis: {
        answer: analysisResult.answer || `Comprehensive analysis of ${file.data.length} records completed.`,
        recommendations: analysisResult.recommendations || 'Apply targeted optimizations based on the insights provided.'
      },
      topPerformers: (analysisResult.topPerformers && analysisResult.topPerformers.length > 0) 
        ? analysisResult.topPerformers 
        : chartData.slice(0, 5),
      bottomPerformers: (analysisResult.bottomPerformers && analysisResult.bottomPerformers.length > 0)
        ? analysisResult.bottomPerformers
        : chartData.slice(-3).reverse(),
      trend: analysisResult.trend || { direction: 'Stable', strength: 0.5 },
      outliers: analysisResult.outliers || { count: 0, lowerBound: 0, upperBound: 0, items: [] },
      dataQuality: analysisResult.dataQuality || { completeness: 100, uniquenessScore: 100 },
      opportunityItems: analysisResult.opportunityItems || chartData.map(item => ({
        name: item.name,
        currentValue: item.value,
        avgValue: calculateStats(file.data, metric).average || 0,
        gapPercentage: 0,
        priority: 'Medium',
        isQuickWin: false
      })),
      correlations: analysisResult.correlations || {},
      totalRows: file.data.length,
      numericColumns: numericColumns.length,
      source: source
    };

    console.log(`✅ Analysis complete (${source})`);
    console.log('📊 Results being returned:', {
      topPerformersCount: results.topPerformers.length,
      chartDataLength: results.data.length,
      statsSum: results.stats.sum,
      statsAverage: results.stats.average,
      insightsCount: results.insights.length,
      trendDirection: results.trend.direction,
      trendStrength: results.trend.strength
    });
    console.log('='.repeat(70) + '\n');

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('queryAnalysis error:', error);
    res.status(500).json({ success: false, message: error.message || 'Analysis failed' });
  }
};

/**
 * Save dashboard
 */
export const saveDashboard = async (req, res) => {
  try {
    const { name, fileId, charts, insights } = req.body;

    if (!name || !fileId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const dashboard = new Dashboard({
      name,
      userId: req.user._id,
      fileId,
      charts: charts || [],
      insights: insights || '',
    });

    await dashboard.save();

    res.status(201).json({
      success: true,
      message: 'Dashboard saved successfully',
      dashboard,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get dashboards
 */
export const getDashboards = async (req, res) => {
  try {
    const dashboards = await Dashboard.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      dashboards,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete dashboard
 */
export const deleteDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!dashboard) {
      return res.status(404).json({ success: false, message: 'Dashboard not found' });
    }

    res.json({ success: true, message: 'Dashboard deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
