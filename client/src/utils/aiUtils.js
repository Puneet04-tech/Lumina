/**
 * Parse AI query and extract intent
 * Example: "Top 5 products by revenue" -> { type: 'top', field: 'product', metric: 'revenue', limit: 5 }
 */
export const parseQuery = async (query, columns) => {
  // Basic query parsing - can be replaced with AI API call
  const lowerQuery = query.toLowerCase();

  // Detect query type
  let type = 'analyze';
  if (lowerQuery.includes('top')) type = 'top';
  else if (lowerQuery.includes('bottom') || lowerQuery.includes('lowest')) type = 'bottom';
  else if (lowerQuery.includes('average') || lowerQuery.includes('avg')) type = 'average';
  else if (lowerQuery.includes('total') || lowerQuery.includes('sum')) type = 'sum';
  else if (lowerQuery.includes('compare')) type = 'compare';
  else if (lowerQuery.includes('trend')) type = 'trend';

  // Extract limit number
  const limitMatch = query.match(/(\d+)/);
  const limit = limitMatch ? parseInt(limitMatch[1]) : 10;

  return {
    type,
    limit,
    query,
    columns,
  };
};

/**
 * Process data based on parsed query
 */
export const processQuery = (data, parsedQuery) => {
  const { type, limit, columns } = parsedQuery;

  if (!data || data.length === 0) {
    return { error: 'No data to process' };
  }

  const numericColumns = columns.filter(
    (col) => typeof data[0][col] === 'number'
  );

  if (numericColumns.length === 0) {
    return { error: 'No numeric columns found' };
  }

  const metricColumn = numericColumns[0];

  switch (type) {
    case 'top':
      return {
        type: 'bar',
        data: data
          .sort((a, b) => b[metricColumn] - a[metricColumn])
          .slice(0, limit),
        title: `Top ${limit} by ${metricColumn}`,
      };

    case 'bottom':
      return {
        type: 'bar',
        data: data
          .sort((a, b) => a[metricColumn] - b[metricColumn])
          .slice(0, limit),
        title: `Bottom ${limit} by ${metricColumn}`,
      };

    case 'average':
      const avg = data.reduce((sum, row) => sum + row[metricColumn], 0) / data.length;
      return {
        type: 'metric',
        value: avg.toFixed(2),
        title: `Average ${metricColumn}`,
      };

    case 'sum':
      const sum = data.reduce((total, row) => total + row[metricColumn], 0);
      return {
        type: 'metric',
        value: sum.toFixed(2),
        title: `Total ${metricColumn}`,
      };

    case 'trend':
      return {
        type: 'line',
        data: data.slice(0, limit),
        title: `${metricColumn} Trend`,
      };

    default:
      return {
        type: 'bar',
        data: data.slice(0, limit),
        title: 'Data Analysis',
      };
  }
};

/**
 * Call Gemini AI API for intelligent analysis
 */
export const callGeminiAI = async (query, dataContext) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key not configured');
      return null;
    }

    const prompt = `
You are an AI data analyst. Based on the user query and data context, provide analysis insights.

User Query: ${query}

Data Context:
- Total rows: ${dataContext.rowCount}
- Columns: ${dataContext.columns.join(', ')}
- Sample data: ${JSON.stringify(dataContext.sampleData || [])}

Provide a JSON response with:
{
  "insight": "Brief insight about the data",
  "recommendation": "Actionable recommendation",
  "chartSuggestion": "Suggested chart type (bar, line, pie, area)"
}
    `;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        return {
          insight: content,
          recommendation: 'Continue exploring your data',
          chartSuggestion: 'bar',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};
