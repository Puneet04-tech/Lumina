import { File } from '../models/File.js';
import { Dashboard } from '../models/Dashboard.js';
import { analyzeWithGemini, processNaturalLanguageQuery } from '../utils/aiHelper.js';

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

    let results = {
      query,
      processed: processedQuery,
      ai: aiAnalysis,
      charts: [],
    };

    // Generate chart data based on processed query
    if (numericColumns.length > 0 && file.columns.length > 1) {
      const metric = numericColumns[0];
      const dimension = file.columns.find((c) => !numericColumns.includes(c));

      if (dimension) {
        const groupedData = {};
        file.data.forEach((row) => {
          const key = row[dimension];
          if (!groupedData[key]) groupedData[key] = 0;
          groupedData[key] += row[metric] || 0;
        });

        results.charts = [
          {
            type: aiAnalysis.success ? aiAnalysis.analysis.chartType : 'bar',
            data: Object.entries(groupedData)
              .map(([name, value]) => ({ name, value }))
              .sort((a, b) => b.value - a.value)
              .slice(0, processedQuery.limit),
            title: `${metric} by ${dimension}`,
          },
        ];
      }
    }

    res.json({
      success: true,
      results,
    });
  } catch (error) {
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
