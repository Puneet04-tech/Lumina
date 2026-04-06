import { File } from '../models/File.js';
import { Dashboard } from '../models/Dashboard.js';
import { performAdvancedAnalysis, generateComparisonInsights } from '../utils/advancedAnalytics.js';

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
 * Query analysis with AI (if configured) or Advanced Local Analysis
 */
export const queryAnalysis = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📊 ANALYSIS QUERY RECEIVED');
    console.log('='.repeat(70));
    
    const { query, fileId } = req.body;

    if (!query || !fileId) {
      return res.status(400).json({ success: false, message: 'Missing query or fileId' });
    }

    console.log('📝 Query:', query);
    console.log('📁 File ID:', fileId);

    // Get file
    const file = await File.findOne({ _id: fileId, userId: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.data || file.data.length === 0) {
      return res.status(400).json({ success: false, message: 'File has no data' });
    }

    // ENHANCED QUERY INTELLIGENCE - Multiple interpretation strategies
    const numericColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'number'
    );

    const textColumns = file.columns.filter(
      (col) => typeof file.data[0][col] === 'string'
    );

    let metric = numericColumns[0] || file.columns[0];
    let dimension = textColumns[0] || file.columns.find((c) => !numericColumns.includes(c)) || file.columns[1] || file.columns[0];

    // Helper function for fuzzy string matching
    const findBestMatch = (query, columnNames, keywords) => {
      const lowerQuery = query.toLowerCase();
      
      // First try exact keyword match
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          const col = columnNames.find(c => c.toLowerCase().includes(keyword));
          if (col) return col;
        }
      }

      // Then try fuzzy match - look for partial matches
      for (const keyword of keywords) {
        for (const col of columnNames) {
          const colLower = col.toLowerCase();
          if (colLower.includes(keyword.substring(0, 3)) || keyword.includes(colLower.substring(0, 3))) {
            return col;
          }
        }
      }
      
      return null;
    };

    const lowerQuery = query.toLowerCase();

    // Strategy 1: Direct keyword matching for dimensions
    const dimensionKeywords = [
      'category', 'categories', 'cat',
      'region', 'regions', 'location', 'city', 'state', 'country',
      'product', 'products', 'item', 'items', 'name',
      'channel', 'channels', 'platform',
      'date', 'time', 'period', 'month', 'quarter', 'year',
      'segment', 'segments', 'group', 'type', 'status', 'campaign',
      'customer', 'client', 'account', 'audience', 'target'
    ];

    const foundDimension = findBestMatch(lowerQuery, file.columns, dimensionKeywords);
    if (foundDimension && textColumns.includes(foundDimension)) {
      dimension = foundDimension;
    } else if (foundDimension && !numericColumns.includes(foundDimension)) {
      dimension = foundDimension;
    }

    // Strategy 2: Direct keyword matching for metrics
    const metricKeywords = [
      'revenue', 'sales', 'sold',
      'profit', 'earnings', 'income',
      'amount', 'total', 'sum',
      'count', 'quantity', 'qty', 'volume',
      'value', 'price',
      'roi', 'roas', 'return',
      'impressions', 'clicks', 'conversions', 'ctr', 'conversion_rate',
      'budget', 'cost', 'expense',
      'growth', 'increase', 'decrease', 'change'
    ];

    const foundMetric = findBestMatch(lowerQuery, file.columns, metricKeywords);
    if (foundMetric && numericColumns.includes(foundMetric)) {
      metric = foundMetric;
    }

    // Strategy 3: Question type detection
    if (lowerQuery.includes('top') || lowerQuery.includes('best') || lowerQuery.includes('highest')) {
      // User wants to see TOP performers - use first text column as dimension
      dimension = textColumns[0] || file.columns.find(c => !numericColumns.includes(c)) || file.columns[0];
    }
    
    if (lowerQuery.includes('by') || lowerQuery.includes('grouped') || lowerQuery.includes('breakdown')) {
      // User wants grouping - prioritize text columns
      const afterBy = lowerQuery.split('by')[1];
      if (afterBy) {
        const col = file.columns.find(c => afterBy.includes(c.toLowerCase()) || c.toLowerCase().includes(afterBy.trim().split(' ')[0]));
        if (col) dimension = col;
      } else {
        dimension = textColumns[0] || file.columns[0];
      }
    }

    // Strategy 4: Comparative analysis ("compare X vs Y", "X vs Y")
    if (lowerQuery.includes('vs') || lowerQuery.includes('versus') || lowerQuery.includes('compare')) {
      const parts = lowerQuery.split(/vs|versus|compare/);
      if (parts.length > 1) {
        const item1 = parts[1].trim().split(/\s+/)[0];
        const item2 = parts.length > 2 ? parts[2].trim().split(/\s+/)[0] : null;
        
        // Find which column might contain these items
        const matchingColumn = file.columns.find(col => {
          const colValues = file.data.map(r => String(r[col]).toLowerCase());
          return colValues.some(v => v.includes(item1) || v.includes(item2));
        });
        if (matchingColumn && !numericColumns.includes(matchingColumn)) {
          dimension = matchingColumn;
        }
      }
    }

    // Strategy 5: Temporal analysis (if query mentions time)
    if (lowerQuery.includes('trend') || lowerQuery.includes('over time') || lowerQuery.includes('timeline')) {
      const timeCol = file.columns.find(c => 
        c.toLowerCase().includes('date') || 
        c.toLowerCase().includes('time') || 
        c.toLowerCase().includes('month') ||
        c.toLowerCase().includes('period')
      );
      if (timeCol) dimension = timeCol;
    }

    // Strategy 6: Performance analysis keywords
    if (lowerQuery.includes('performance') || lowerQuery.includes('efficiency') || lowerQuery.includes('quality')) {
      const perfMetrics = numericColumns.filter(col => 
        col.toLowerCase().includes('rate') || 
        col.toLowerCase().includes('score') || 
        col.toLowerCase().includes('rating') ||
        col.toLowerCase().includes('roi')
      );
      if (perfMetrics.length > 0) metric = perfMetrics[0];
    }

    // Strategy 7: Distribution/composition analysis
    if (lowerQuery.includes('distribution') || lowerQuery.includes('composition') || lowerQuery.includes('breakdown')) {
      dimension = textColumns[0] || file.columns[0];
    }

    // Strategy 8: Pick second most common numeric/text column if exact keyword not found
    if (metric === numericColumns[0] && numericColumns.length > 1 && !lowerQuery.includes(metric.toLowerCase())) {
      // Try to find alternate metric
      const alternateMetric = numericColumns.find(col => lowerQuery.includes(col.toLowerCase()));
      if (alternateMetric) metric = alternateMetric;
    }

    // Log query interpretation for debugging
    console.log('\n📌 QUERY INTELLIGENCE ENGINE:');
    console.log(`  Query: "${query}"`);
    console.log(`  🔹 Detected Metric: ${metric}`);
    console.log(`  🔹 Detected Dimension: ${dimension}`);
    console.log(`  📊 Available Numeric Columns: ${numericColumns.join(', ')}`);
    console.log(`  📝 Available Text Columns: ${textColumns.join(', ')}\n`);

    // Generate chart data
    let chartData = [];
    if (metric && dimension) {
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

    // Perform advanced analysis with AI integration
    const advancedAnalysis = await performAdvancedAnalysis(
      file.data,
      file.columns,
      metric,
      dimension
    );

    if (!advancedAnalysis.success) {
      return res.status(400).json({ success: false, message: advancedAnalysis.message });
    }

    console.log('✅ Advanced Analysis Generated:', {
      hasStats: !!advancedAnalysis.stats,
      hasInsights: !!advancedAnalysis.insights,
      hasAnalysis: !!advancedAnalysis.analysis,
      analysisKeys: advancedAnalysis.analysis ? Object.keys(advancedAnalysis.analysis) : [],
      insightsKeys: advancedAnalysis.insights ? Object.keys(advancedAnalysis.insights) : [],
    });

    const insights = advancedAnalysis.insights;
    const analysis = advancedAnalysis.analysis || {};

    const results = {
      type: 'bar',
      data: chartData,
      stats: advancedAnalysis.stats,
      xAxis: dimension,
      yAxis: metric,
      insights,
      analysis, // Always include analysis data
      totalRows: file.data.length,
      numericColumns: numericColumns.length,
    };

    console.log('✅ Sending response with insights');
    console.log('='.repeat(70) + '\n');

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
