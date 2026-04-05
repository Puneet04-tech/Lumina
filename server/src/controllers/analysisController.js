import { File } from '../models/File.js';
import { Dashboard } from '../models/Dashboard.js';
import { analyzeWithGemini, processNaturalLanguageQuery } from '../utils/aiHelper.js';

/**
 * Calculate statistics from data
 */
const calculateStats = (data, key) => {
  if (!data || data.length === 0) return {};

  const values = data.map((item) => parseFloat(item[key]) || 0).filter((v) => !isNaN(v));

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return {
    sum: parseFloat(sum.toFixed(2)),
    average: parseFloat(avg.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    count: values.length,
  };
};

/**
 * Query analysis with AI
 */
export const queryAnalysis = async (req, res) => {
  try {
    const { query, fileId } = req.body;

    if (!query || !fileId) {
      return res.status(400).json({ success: false, message: 'Missing query or fileId' });
    }

    // Get file
    const file = await File.findOne({ _id: fileId, userId: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.data || file.data.length === 0) {
      return res.status(400).json({ success: false, message: 'File has no data' });
    }

    // Prepare data context for AI
    const dataContext = {
      rowCount: file.data.length,
      columns: file.columns,
      sampleData: file.data.slice(0, 5),
    };

    // Call Gemini AI for analysis
    const aiAnalysis = await analyzeWithGemini(query, dataContext);

    // Also process using rule-based system
    const processedQuery = processNaturalLanguageQuery(query, file.columns);

    // Generate recommendations based on data
    const numericColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'number'
    );

    // Default to first numeric column if found, otherwise use first column
    let metric = numericColumns[0];
    let dimension = file.columns.find((c) => !numericColumns.includes(c)) || file.columns[0];

    // Try to find better dimension based on query
    if (query.toLowerCase().includes('category')) {
      const catCol = file.columns.find((c) => c.toLowerCase().includes('category'));
      if (catCol) dimension = catCol;
    } else if (query.toLowerCase().includes('region')) {
      const regCol = file.columns.find((c) => c.toLowerCase().includes('region'));
      if (regCol) dimension = regCol;
    } else if (query.toLowerCase().includes('product')) {
      const prodCol = file.columns.find((c) => c.toLowerCase().includes('product'));
      if (prodCol) dimension = prodCol;
    }

    let chartData = [];
    if (metric && dimension) {
      const groupedData = {};
      file.data.forEach((row) => {
        const key = row[dimension];
        if (!groupedData[key]) groupedData[key] = 0;
        groupedData[key] += parseFloat(row[metric]) || 0;
      });

      chartData = Object.entries(groupedData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }

    const results = {
      type: aiAnalysis.success ? aiAnalysis.analysis?.chartType : 'bar',
      data: chartData,
      stats: calculateStats(file.data, metric),
      xAxis: dimension,
      yAxis: metric,
    };

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('queryAnalysis error:', error);
    res.status(500).json({ success: false, message: error.message });
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
