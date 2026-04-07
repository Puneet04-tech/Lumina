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

    const dataSample = data.slice(0, 10);
    const userPrompt = `You are a data analytics expert. Analyze this data and provide insights.

Data sample: ${JSON.stringify(dataSample)}
Columns: ${columns.join(', ')}
Total records: ${data.length}
Metric analyzed: ${metric}
Dimension: ${dimension}

User query: "${query}"

Provide your response in this exact JSON format:
{"answer": "brief direct answer", "insights": ["insight1", "insight2", "insight3"], "recommendations": "actionable recommendations"}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a concise data analytics assistant. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
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
        recommendations: String(parsed.recommendations || 'Review the analysis')
      };
      console.log('🎯 Returning analysis:', JSON.stringify(result).substring(0, 300));
      return result;
    }
    
    // Fallback: extract insights from raw text
    console.log('⚠️ No JSON found, using raw content as fallback');
    return {
      answer: content.substring(0, 500),
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
    insights: insights,
    recommendations: sorted.length > 0 ? 'Focus on top performers for maximum impact' : 'Consistent performance across segments',
    source: 'Local Intelligence Engine'
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

    // Try Groq API first
    console.log('🤖 Attempting Groq AI analysis...');
    let groqAnalysis = await analyzeWithGroq(file.data, file.columns, query, metric, dimension);
    
    let analysisResult;
    let source = 'Unknown';

    if (groqAnalysis) {
      console.log('✅ Groq API succeeded');
      analysisResult = {
        insights: groqAnalysis.insights || [],
        recommendations: groqAnalysis.recommendations || '',
        answer: groqAnalysis.answer || query
      };
      source = 'Groq AI (llama-3.3-70b)';
    } else {
      // Fallback to local intelligence
      console.log('📊 Using local intelligence fallback');
      const localResult = localAnalysis(file.data, file.columns, metric, dimension);
      analysisResult = {
        insights: localResult.insights,
        recommendations: localResult.recommendations,
        answer: `Analyzed ${file.data.length} records across ${Object.keys(new Set(file.data.map(r => r[dimension]))).length} categories`
      };
      source = 'Local Intelligence (Fallback)';
    }

    const results = {
      type: 'bar',
      data: chartData,
      stats: calculateStats(file.data, metric),
      insights: analysisResult.insights,
      analysis: {
        answer: analysisResult.answer,
        recommendations: analysisResult.recommendations,
        suggestedMetrics: ['Total', 'Average', 'Median', 'Count', 'Max', 'Min']
      },
      totalRows: file.data.length,
      numericColumns: numericColumns.length,
      source: source
    };

    console.log(`✅ Analysis complete (${source})`);
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
