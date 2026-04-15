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
 * Universal Query Intent Analyzer - Works with ANY data and ANY query
 */
const analyzeQueryIntent = (query, columns, numericColumns, textColumns) => {
  const lowerQuery = query.toLowerCase();
  
  console.log(`\n🔍 QUERY INTENT ANALYZER:`);
  console.log(`   Query: "${query}"`);
  console.log(`   Available numeric columns: ${numericColumns.join(', ')}`);
  console.log(`   Available text columns: ${textColumns.join(', ')}`);

  // Synonym mappings for metrics (expanded)
  const metricSynonyms = {
    'price': ['unit_price', 'price', 'unit price', 'product_price', 'cost', 'value'],
    'revenue': ['revenue', 'sales_revenue', 'sales revenue', 'sales', 'total_revenue', 'income'],
    'cost': ['cost', 'cost_per', 'expense', 'expenses'],
    'profit': ['profit', 'margin', 'net_profit', 'earnings'],
    'quantity': ['quantity', 'qty', 'units', 'units_sold', 'count', 'amount'],
    'rating': ['rating', 'score', 'rank', 'performance_score'],
    'rate': ['rate', 'conversion_rate', 'roi', 'ctr', 'impression_rate'],
    'spend': ['spend', 'budget', 'investment', 'total_spend'],
    'impressions': ['impressions', 'views', 'reach'],
    'clicks': ['clicks', 'interactions', 'engagements']
  };

  // Synonym mappings for dimensions (expanded)
  const dimensionSynonyms = {
    'category': ['category', 'product_category', 'product category', 'type', 'product_type', 'product type'],
    'channel': ['channel', 'marketing_channel', 'platform', 'source', 'traffic_source'],
    'region': ['region', 'area', 'location', 'geography', 'country', 'state'],
    'product': ['product', 'product_name', 'item', 'product_id'],
    'segment': ['segment', 'segment_name', 'group', 'bucket'],
    'date': ['date', 'month', 'year', 'day', 'period', 'time'],
    'customer': ['customer', 'customer_type', 'client', 'user', 'account'],
    'campaign': ['campaign', 'campaign_name', 'campaign_id']
  };

  // Extract keywords from query
  const potentialMetrics = [];
  const potentialDimensions = [];

  // Check metric keywords in query
  Object.entries(metricSynonyms).forEach(([metricKey, synonyms]) => {
    if (synonyms.some(syn => lowerQuery.includes(syn))) {
      potentialMetrics.push(metricKey);
      console.log(`   ✓ Detected metric keyword: "${metricKey}" (synonyms: ${synonyms.join(', ')})`);
    }
  });

  // Check dimension keywords in query
  Object.entries(dimensionSynonyms).forEach(([dimensionKey, synonyms]) => {
    if (synonyms.some(syn => lowerQuery.includes(syn))) {
      potentialDimensions.push(dimensionKey);
      console.log(`   ✓ Detected dimension keyword: "${dimensionKey}" (synonyms: ${synonyms.join(', ')})`);
    }
  });

  // Better column matching function
  const findColumnForKeyword = (keyword, columnList, type = 'metric') => {
    const synonymList = type === 'metric' ? metricSynonyms[keyword] : dimensionSynonyms[keyword];
    
    if (!synonymList) return null;

    // Exact match first
    for (const synonym of synonymList) {
      const exactMatch = columnList.find(col => col.toLowerCase() === synonym.toLowerCase());
      if (exactMatch) {
        console.log(`     ✓ Exact match found: "${keyword}" → "${exactMatch}"`);
        return exactMatch;
      }
    }

    // Partial match
    for (const synonym of synonymList) {
      const partialMatch = columnList.find(col => 
        col.toLowerCase().includes(synonym.toLowerCase().replace(/_/g, '')) ||
        synonym.toLowerCase().includes(col.toLowerCase())
      );
      if (partialMatch) {
        console.log(`     ✓ Partial match found: "${keyword}" → "${partialMatch}"`);
        return partialMatch;
      }
    }

    return null;
  };

  // Find best metric column
  let metricColumn = null;

  // Try each detected metric keyword
  for (const metric of potentialMetrics) {
    const found = findColumnForKeyword(metric, numericColumns, 'metric');
    if (found) {
      metricColumn = found;
      break;
    }
  }

  // If not found by keyword, try generic metric keywords against all numeric columns
  if (!metricColumn) {
    const genericMetrics = ['total', 'revenue', 'sales', 'cost', 'price', 'amount', 'value'];
    for (const genericMetric of genericMetrics) {
      if (lowerQuery.includes(genericMetric)) {
        const found = findColumnForKeyword(genericMetric, numericColumns, 'metric');
        if (found) {
          metricColumn = found;
          break;
        }
      }
    }
  }

  // Fallback to first numeric column
  if (!metricColumn && numericColumns.length > 0) {
    metricColumn = numericColumns[0];
    console.log(`   ⚠️ No metric matched, using first numeric column: "${metricColumn}"`);
  }

  // Find best dimension column
  let dimensionColumn = null;

  // Try each detected dimension keyword
  for (const dimension of potentialDimensions) {
    const found = findColumnForKeyword(dimension, textColumns, 'dimension');
    if (found) {
      dimensionColumn = found;
      break;
    }
  }

  // If not found by keyword, try generic dimension keywords against all text columns
  if (!dimensionColumn) {
    const genericDimensions = ['category', 'channel', 'type', 'segment', 'region'];
    for (const genericDimension of genericDimensions) {
      if (lowerQuery.includes(genericDimension)) {
        const found = findColumnForKeyword(genericDimension, textColumns, 'dimension');
        if (found) {
          dimensionColumn = found;
          break;
        }
      }
    }
  }

  // Fallback to first text column
  if (!dimensionColumn && textColumns.length > 0) {
    dimensionColumn = textColumns[0];
    console.log(`   ⚠️ No dimension matched, using first text column: "${dimensionColumn}"`);
  }

  console.log(`\n   📊 FINAL SELECTION:`);
  console.log(`   Metric: "${metricColumn}"`);
  console.log(`   Dimension: "${dimensionColumn}"`);

  // Extract numeric range from query (e.g., "top 5", "show 10")
  const numberMatch = query.match(/top\s+(\d+)|show\s+(\d+)|first\s+(\d+)|(\d+)\s+top/i);
  const limitNumber = numberMatch ? parseInt(numberMatch[1] || numberMatch[2] || numberMatch[3] || numberMatch[4]) : 10;

  return {
    queryType: lowerQuery.includes('group') || lowerQuery.includes('by ') || lowerQuery.includes('per ') ? 'aggregation' : 
               lowerQuery.includes('top ') ? 'ranking_top' :
               lowerQuery.includes('bottom ') ? 'ranking_bottom' :
               lowerQuery.includes('trend') ? 'trend' :
               'analysis',
    
    metricColumn,
    dimensionColumn,
    
    requiresGrouping: true,
    isAggregation: true,
    
    limitNumber,
    
    potentialMetrics,
    potentialDimensions
  };
};

/**
 * Universal Analysis Function - Works with ANY data structure
 */
const universalAnalysis = (data, columnData, metricColumn, dimensionColumn) => {
  console.log(`\n🌐 UNIVERSAL ANALYSIS`);
  console.log(`   Analyzing: ${metricColumn} grouped by ${dimensionColumn}`);

  const result = {};
  
  // 1. Group data
  const grouped = {};
  data.forEach(row => {
    const dimValue = String(row[dimensionColumn]).trim();
    const metricValue = parseFloat(row[metricColumn]) || 0;
    
    if (!grouped[dimValue]) {
      grouped[dimValue] = {
        name: dimValue,
        values: [],
        sum: 0,
        count: 0,
        items: []
      };
    }
    
    grouped[dimValue].values.push(metricValue);
    grouped[dimValue].sum += metricValue;
    grouped[dimValue].count += 1;
    grouped[dimValue].items.push(row);
  });

  // 2. Calculate statistics for each group
  const analyzed = Object.values(grouped).map(group => {
    const sorted = [...group.values].sort((a, b) => a - b);
    const avg = group.sum / group.count;
    const median = sorted[Math.floor(sorted.length / 2)];
    const stdDev = Math.sqrt(group.values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / group.values.length);
    
    return {
      name: group.name,
      total: parseFloat(group.sum.toFixed(2)),
      count: group.count,
      average: parseFloat(avg.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      min: Math.min(...group.values),
      max: Math.max(...group.values),
      stdDev: parseFloat(stdDev.toFixed(2)),
      items: group.items
    };
  });

  // 3. Sort and rank
  analyzed.sort((a, b) => b.total - a.total);
  
  // 4. Calculate global statistics
  const globalTotal = analyzed.reduce((sum, g) => sum + g.total, 0);
  const averagePerGroup = globalTotal / analyzed.length;
  
  // 5. Calculate percentages
  analyzed.forEach(group => {
    group.percentOfTotal = parseFloat(((group.total / globalTotal) * 100).toFixed(2));
    group.vs_average = parseFloat(((group.total / averagePerGroup) * 100).toFixed(2));
  });

  // 6. Generate insights
  const insights = [];
  
  if (analyzed.length > 0) {
    const top = analyzed[0];
    const bottom = analyzed[analyzed.length - 1];
    
    insights.push(`👑 Top Performer: "${top.name}" leads with ${top.total} (${top.percentOfTotal}% of total)`);
    
    if (analyzed.length > 1) {
      const ratio = (top.total / bottom.total).toFixed(2);
      insights.push(`⚙️ Performance Gap: ${ratio}x difference between top and bottom`);
    }
    
    insights.push(`📊 Distribution: Average per ${dimensionColumn} is ${averagePerGroup.toFixed(2)}`);
    
    const aboveAvg = analyzed.filter(g => g.total > averagePerGroup).length;
    const belowAvg = analyzed.length - aboveAvg;
    insights.push(`📈 Benchmarking: ${aboveAvg}/${analyzed.length} ${dimensionColumn}s above average, ${belowAvg} below`);
    
    const concentration = analyzed.slice(0, 3).reduce((sum, g) => sum + g.percentOfTotal, 0);
    insights.push(`💡 Concentration: Top 3 account for ${concentration}% of total`);
  }

  return {
    data: analyzed,
    globalTotal: parseFloat(globalTotal.toFixed(2)),
    globalAverage: parseFloat(averagePerGroup.toFixed(2)),
    groupCount: analyzed.length,
    insights,
    topPerformers: analyzed.slice(0, 5),
    bottomPerformers: analyzed.slice(-3).reverse()
  };
};

/**
 * Perform channel-specific aggregation with advanced analytics
 */
const analyzeChannelAggregate = (data, channelColumn, spendColumn) => {
  console.log(`\n💡 CHANNEL AGGREGATION ANALYSIS`);
  console.log(`   Channel Column: ${channelColumn}`);
  console.log(`   Spend Column: ${spendColumn}`);

  const channelData = {};
  let totalSpend = 0;

  // Aggregate by channel
  data.forEach(row => {
    const channel = String(row[channelColumn]).trim();
    const spend = parseFloat(row[spendColumn]) || 0;
    
    if (!channelData[channel]) {
      channelData[channel] = {
        channel,
        totalSpend: 0,
        count: 0,
        spends: [],
        minSpend: Infinity,
        maxSpend: -Infinity
      };
    }
    
    channelData[channel].totalSpend += spend;
    channelData[channel].count += 1;
    channelData[channel].spends.push(spend);
    channelData[channel].minSpend = Math.min(channelData[channel].minSpend, spend);
    channelData[channel].maxSpend = Math.max(channelData[channel].maxSpend, spend);
    totalSpend += spend;
  });

  // Calculate statistics for each channel
  const channelResults = Object.values(channelData).map(ch => {
    const avgSpend = ch.totalSpend / ch.count;
    const sorted = ch.spends.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = ch.spends.reduce((sum, val) => sum + Math.pow(val - avgSpend, 2), 0) / ch.spends.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      channel: ch.channel,
      totalSpend: parseFloat(ch.totalSpend.toFixed(2)),
      count: ch.count,
      avgSpend: parseFloat(avgSpend.toFixed(2)),
      medianSpend: parseFloat(median.toFixed(2)),
      minSpend: parseFloat(ch.minSpend.toFixed(2)),
      maxSpend: parseFloat(ch.maxSpend.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      percentOfTotal: parseFloat((ch.totalSpend / totalSpend * 100).toFixed(2)),
      efficiency: ch.count > 0 ? parseFloat((ch.totalSpend / ch.count).toFixed(2)) : 0
    };
  });

  // Sort by total spend descending
  channelResults.sort((a, b) => b.totalSpend - a.totalSpend);

  // Generate channel-specific insights
  const insights = [];
  
  // Top channel
  if (channelResults.length > 0) {
    const topChannel = channelResults[0];
    insights.push(`🏆 Top Channel: "${topChannel.channel}" dominates with $${topChannel.totalSpend.toLocaleString()} (${topChannel.percentOfTotal}% of budget)`);
    
    // Efficiency insight
    if (channelResults.length > 1) {
      const sorted = channelResults.sort((a, b) => b.efficiency - a.efficiency);
      insights.push(`⚡ Most Efficient: "${sorted[0].channel}" has best spend-to-count ratio at $${sorted[0].efficiency}`);
    }

    // Distribution insight
    const concentrationTop3 = channelResults.slice(0, 3).reduce((sum, ch) => sum + ch.percentOfTotal, 0);
    insights.push(`📊 Concentration: Top 3 channels account for ${concentrationTop3}% of total spend`);
    
    // Variability insight
    const avgVariance = channelResults.reduce((sum, ch) => sum + ch.stdDev, 0) / channelResults.length;
    insights.push(`📈 Consistency: Channels show "${avgVariance > totalSpend/channelResults.length * 0.5 ? 'High' : 'Moderate'}" variability in spending patterns`);

    // Underutilized channels
    const underutilized = channelResults.filter(ch => ch.percentOfTotal < 5);
    if (underutilized.length > 0) {
      insights.push(`⚠️ Underutilized: ${underutilized.length} channel(s) receive < 5% of budget - review allocation strategy`);
    }
  }

  return {
    channelData: channelResults,
    totalSpend: parseFloat(totalSpend.toFixed(2)),
    totalChannels: channelResults.length,
    averageSpendPerChannel: parseFloat((totalSpend / channelResults.length).toFixed(2)),
    insights,
    topChannels: channelResults.slice(0, 5),
    bottomChannels: channelResults.slice(-3).reverse()
  };
};

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
3. ADOMALY DETECTION (CRITICAL): Examine the data for any statistical outliers or odd behavior. Provide a "reason" for why these points are anomalous (e.g., "Standard Deviation exceeds 3x", "Unusual Gap to Median", "Potential data entry error").
4. Provide 5-7 distinct, high-value insights in the "insights" field.
5. Provide a specific array called "anomalyReasons" where each entry maps a suspicious data point to a logical reasoning.

Response Format (STRICT JSON ONLY):
{
  "answer": "A comprehensive 2-3 sentence executive summary.",
  "insights": [
    "Cluster Analysis: [text...]", 
    "Growth Opportunity: [text...]"
  ],
  "recommendations": "Priority 1: [Action]; Priority 2: [Action]",
  "anomalyReasons": [
    {"item": "Name of Item", "reason": "Specific reason why this is an anomaly", "severity": "High/Medium/Low"}
  ]
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
        anomalyReasons: Array.isArray(parsed.anomalyReasons) ? parsed.anomalyReasons : []
      };
      console.log('🎯 Returning Groq insights with anomalies');
      return result;
    }
    
    // Fallback: extract insights from raw text
    console.log('⚠️ No JSON found, using raw content as fallback');
    return {
      answer: content.substring(0, 300),
      insights: [content.substring(0, 200)],
      recommendations: 'Review the generated analysis',
      anomalyReasons: []
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
      items: outliers,
      reasons: outliers.map(o => {
        const severity = o.value > stats.average * 2 ? 'High' : o.value < stats.average * 0.3 ? 'Critical' : 'Medium';
        const deviation = Math.abs(o.value - stats.average) / stats.average * 100;
        return {
          item: o.name,
          reason: `Deviation: ${deviation.toFixed(1)}% from mean. ${o.value > stats.average ? 'Extremely high success / Risk profile' : 'Underperforming relative to peers'}`,
          severity
        };
      })
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

    // UNIVERSAL QUERY INTENT ANALYSIS
    const queryIntent = analyzeQueryIntent(query, file.columns, numericColumns, textColumns);
    console.log(`🎯 Query Intent Analysis:`, {
      queryType: queryIntent.queryType,
      metricColumn: queryIntent.metricColumn,
      dimensionColumn: queryIntent.dimensionColumn,
      requiresGrouping: queryIntent.requiresGrouping,
      potentialMetrics: queryIntent.potentialMetrics,
      potentialDimensions: queryIntent.potentialDimensions
    });

    // Use intelligent selected columns
    let metric = queryIntent.metricColumn || numericColumns[0] || file.columns[0];
    let dimension = queryIntent.dimensionColumn || textColumns[0] || file.columns.find((c) => !numericColumns.includes(c)) || file.columns[1] || file.columns[0];

    console.log(`📊 Final Selection - Metric: "${metric}", Dimension: "${dimension}"`);

    // Generate chart data with intelligent analysis
    let chartData = [];
    let universalAnalysisResult = null;

    if (metric && dimension && numericColumns.length > 0 && textColumns.length > 0) {
      console.log('🔄 Performing universal aggregation analysis...');
      universalAnalysisResult = universalAnalysis(file.data, file.columns, metric, dimension);
      
      // Transform to chart data
      chartData = universalAnalysisResult.data.map(item => ({
        name: item.name,
        value: item.total
      })).slice(0, 20);

      console.log(`✅ Analysis complete: ${universalAnalysisResult.groupCount} groups, ${universalAnalysisResult.globalTotal} total`);
    } else {
      console.log(`⚠️ Could not perform aggregation:`, {
        hasMetric: !!metric,
        hasDimension: !!dimension,
        numericColsCount: numericColumns.length,
        textColsCount: textColumns.length
      });
    }

    // Prepare enhanced data for Groq analysis
    let enhancedData = file.data;
    let analysisMetric = metric;
    let analysisDimension = dimension;

    // If universal analysis is available, use its results
    if (universalAnalysisResult) {
      enhancedData = universalAnalysisResult.data;
      analysisMetric = 'total';
      analysisDimension = 'name';
      console.log('📡 Using universal analysis data for Groq...');
    }

    // Try Groq API first
    console.log('🤖 Attempting Groq AI analysis...');
    let groqAnalysis = await analyzeWithGroq(enhancedData, file.columns, query, analysisMetric, analysisDimension);
    
    // Always perform local analysis for full analytics
    const localResult = localAnalysis(enhancedData, file.columns, analysisMetric, analysisDimension);

    // Inject universal analysis insights if available
    if (universalAnalysisResult) {
      localResult.insights = [
        ...universalAnalysisResult.insights,
        ...localResult.insights
      ];
    }
    
    let analysisResult;
    let source = 'Unknown';

    if (groqAnalysis && groqAnalysis.insights) {
      console.log('✅ Groq API succeeded, merging with local insights');
      
      // Categorize and merge insights for a "Power Dashboard"
      const aiInsights = groqAnalysis.insights.map(i => `🤖 AI Insight: ${i}`);
      const localInsights = localResult.insights.map(i => `📊 Statistical Fact: ${i}`);
      
      // Combine anomaly reasons
      const combinedAnomalies = [
        ...(groqAnalysis.anomalyReasons || []),
        ...(localResult.outliers.reasons || [])
      ].reduce((acc, current) => {
        const x = acc.find(item => item.item === current.item);
        if (!x) return acc.concat([current]);
        else return acc;
      }, []);

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
        recommendations: groqAnalysis.recommendations || localResult.recommendations,
        outliers: {
          ...localResult.outliers,
          reasons: combinedAnomalies
        }
      };
      source = 'Lumina Hybrid Intelligence (Groq AI + Local Stats)';
    } else {
      // Use local intelligence
      console.log('📊 Using local intelligence fallback');
      analysisResult = {
        ...localResult,
        insights: localResult.insights.map(i => `📊 Statistical Fact: ${i}`),
        outliers: {
          ...localResult.outliers,
          reasons: localResult.outliers.reasons || []
        }
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
      source: source,
      // Include universal analysis results if available
      ...(universalAnalysisResult && {
        aggregation: {
          dimension: dimension,
          metric: metric,
          groups: universalAnalysisResult.data,
          totalValue: universalAnalysisResult.globalTotal,
          averagePerGroup: universalAnalysisResult.globalAverage,
          groupCount: universalAnalysisResult.groupCount,
          topPerformers: universalAnalysisResult.topPerformers,
          bottomPerformers: universalAnalysisResult.bottomPerformers,
          insights: universalAnalysisResult.insights
        }
      })
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
