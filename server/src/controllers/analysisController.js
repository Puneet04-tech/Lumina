import { File } from '../models/File.js';
import { Dashboard } from '../models/Dashboard.js';
import { checkConnection } from '../config/database.js';
import { memoryStore } from '../config/memoryStore.js';

/**
 * Calculate comprehensive statistics
 */
const calculateStats = (data, key) => {
  if (!data || data.length === 0) return {};

  const values = data.map((item) => parseFloat(item[key]) || 0).filter((v) => !isNaN(v));
  if (values.length === 0) return {};

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    sum: parseFloat(sum.toFixed(2)),
    average: parseFloat(avg.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    count: values.length,
  };
};

/**
 * Analyze data with local intelligence (AI endpoint fallback)
 */
const localAnalysis = (data, columns, metric, dimension) => {
  const insights = [];
  const stats = calculateStats(data, metric);
  
  // Calculate toppers
  const groupedData = {};
  data.forEach((row) => {
    const key = String(row[dimension]);
    if (!groupedData[key]) groupedData[key] = { sum: 0, count: 0 };
    groupedData[key].sum += parseFloat(row[metric]) || 0;
    groupedData[key].count += 1;
  });

  const sorted = Object.entries(groupedData)
    .map(([name, data]) => ({ name, value: data.sum, avg: data.sum / data.count }))
    .sort((a, b) => b.value - a.value);

  // Generate insights
  if (sorted.length > 0) {
    insights.push(`Top performer: ${sorted[0].name} with ${parseFloat(sorted[0].value.toFixed(2))} total`);
    if (sorted.length > 1) {
      insights.push(`Second: ${sorted[1].name} with ${parseFloat(sorted[1].value.toFixed(2))} total`);
    }
  }

  if (stats.average) {
    insights.push(`Average value is ${stats.average.toFixed(2)}`);
    const highPerformers = sorted.filter(s => s.value > stats.average * 1.5);
    if (highPerformers.length > 0) {
      insights.push(`${highPerformers.length} items performing significantly above average`);
    }
  }

  return {
    insights: insights.join('. '),
    analysis: {
      answer: `Analyzed ${data.length} records across ${Object.keys(groupedData).length} ${dimension} values`,
      recommendations: highPerformers ? `Focus on top performers for maximum impact` : 'Consistent performance across segments',
      suggestedMetrics: ['Total', 'Average', 'Count', 'Max', 'Min']
    },
    stats
  };
};

/**
 * Query analysis - uses local analysis (Gemini API not reliable)
 */
export const queryAnalysis = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DATA ANALYSIS QUERY');
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

    // Identify numeric and text columns
    const numericColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'number'
    );
    const textColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'string'
    );

    // Find best metric and dimension
    let metric = numericColumns[0] || file.columns[0];
    let dimension = textColumns[0] || file.columns.find((c) => !numericColumns.includes(c)) || file.columns[1] || file.columns[0];

    console.log(`🔍 Using metric: ${metric}, dimension: ${dimension}`);

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
    }

    // Local analysis (no external API dependency)
    const { insights, analysis, stats } = localAnalysis(file.data, file.columns, metric, dimension);

    const results = {
      type: 'bar',
      data: chartData,
      stats: stats,
      insights: insights,
      analysis: analysis,
      totalRows: file.data.length,
      numericColumns: numericColumns.length,
      source: 'Local Analytics Engine'
    };

    console.log('✅ Analysis complete');
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
