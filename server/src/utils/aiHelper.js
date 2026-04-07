/**
 * AI Helper Functions
 * Note: Analysis is now handled directly in analysisController.js
 * which integrates Grok API with local intelligence fallback
 */

/**
 * Process natural language query to structured format
 */
export const processNaturalLanguageQuery = (query, columns) => {
  const lowerQuery = query.toLowerCase();

  // Detect operation type
  let operation = 'analyze';
  if (lowerQuery.includes('compare')) operation = 'compare';
  if (lowerQuery.includes('trend')) operation = 'trend';
  if (lowerQuery.includes('top')) operation = 'ranking';
  if (lowerQuery.includes('distribution')) operation = 'distribution';

  // Detect columns mentioned in query
  const mentionedColumns = columns.filter((col) =>
    lowerQuery.includes(col.toLowerCase())
  );

  return {
    operation,
    mentionedColumns,
    query,
    timestamp: new Date(),
  };
};

/**
 * Extract metrics from query text
 */
export const extractMetrics = (query) => {
  const metrics = {
    timeframe: null,
    aggregation: 'sum', // sum, avg, count, max, min
    compareTo: null,
  };

  const lowerQuery = query.toLowerCase();

  // Detect aggregation
  if (/average|avg|mean/.test(lowerQuery)) metrics.aggregation = 'average';
  if (/count|how many/.test(lowerQuery)) metrics.aggregation = 'count';
  if (/max|maximum|highest/.test(lowerQuery)) metrics.aggregation = 'max';
  if (/min|minimum|lowest/.test(lowerQuery)) metrics.aggregation = 'min';

  // Detect timeframe
  if (/today|this day/.test(lowerQuery)) metrics.timeframe = 'day';
  if (/this week/.test(lowerQuery)) metrics.timeframe = 'week';
  if (/this month/.test(lowerQuery)) metrics.timeframe = 'month';
  if (/this year/.test(lowerQuery)) metrics.timeframe = 'year';

  return metrics;
};

/**
 * Format analysis response
 */
export const formatAnalysisResponse = (data) => {
  return {
    success: true,
    data,
    generatedAt: new Date(),
  };
};
