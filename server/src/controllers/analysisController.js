import { File } from '../models/File.js';
import { Dashboard } from '../models/Dashboard.js';
import { checkConnection } from '../config/database.js';
import { memoryStore } from '../config/memoryStore.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
 * Query analysis using ONLY Gemini AI
 */
export const queryAnalysis = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🤖 GEMINI AI ANALYSIS QUERY');
    console.log('='.repeat(70));
    
    const { query, fileId } = req.body;

    if (!query || !fileId) {
      return res.status(400).json({ success: false, message: 'Missing query or fileId' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ success: false, message: 'Gemini API key not configured' });
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

    // Prepare data summary for Gemini
    const numericColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'number'
    );
    const textColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'string'
    );

    // Create a sample of data for Gemini
    const dataSample = file.data.slice(0, 50);
    const dataJson = JSON.stringify(dataSample, null, 2);

    // Call Gemini API with prompt
    const prompt = `You are a data analyst. Analyze this CSV data and answer the user's query.

**Data columns:** ${file.columns.join(', ')}
**Numeric columns:** ${numericColumns.join(', ')}
**Text columns:** ${textColumns.join(', ')}
**Total rows:** ${file.data.length}

**Sample data (first 50 rows):**
${dataJson}

**User query:** "${query}"

Please provide:
1. Direct answer to the query
2. Key insights from the data
3. Recommendations based on findings
4. Suggested metrics or KPIs to track

Format your response as JSON with keys: answer, insights, recommendations, metrics`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const geminiResponse = result.response.text();

    console.log('✅ Gemini Response Received');

    // Parse Gemini response (try to extract JSON if present)
    let analysisData = {};
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = {
          answer: geminiResponse,
          insights: 'See answer above',
          recommendations: '',
          metrics: []
        };
      }
    } catch (e) {
      analysisData = {
        answer: geminiResponse,
        insights: 'See answer above',
        recommendations: '',
        metrics: []
      };
    }

    // Generate basic chart data based on first numeric column
    let chartData = [];
    if (numericColumns.length > 0 && textColumns.length > 0) {
      const metric = numericColumns[0];
      const dimension = textColumns[0];
      
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

    const results = {
      type: 'bar',
      data: chartData,
      stats: numericColumns.length > 0 ? calculateStats(file.data, numericColumns[0]) : {},
      insights: analysisData.insights || geminiResponse,
      analysis: {
        answer: analysisData.answer || geminiResponse,
        recommendations: analysisData.recommendations || '',
        suggestedMetrics: analysisData.metrics || []
      },
      totalRows: file.data.length,
      numericColumns: numericColumns.length,
      source: 'Gemini AI'
    };

    console.log('✅ Sending Gemini analysis response');
    console.log('='.repeat(70) + '\n');

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('queryAnalysis error:', error);
    res.status(500).json({ success: false, message: error.message || 'Analysis failed' });
  }

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
