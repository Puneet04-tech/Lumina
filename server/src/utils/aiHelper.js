import axios from 'axios';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

/**
 * Call Gemini API for intelligent data analysis
 */
export const analyzeWithGemini = async (query, dataContext) => {
  try {
    if (!GEMINI_API_KEY) {
      return {
        success: false,
        message: 'Gemini API key not configured',
      };
    }

    const prompt = `
You are an AI data analyst. Analyze the following data based on user query:

User Query: "${query}"

Data Summary:
- Total records: ${dataContext.rowCount}
- Columns: ${dataContext.columns.join(', ')}
- Data samples: ${JSON.stringify(dataContext.sampleData || {})}

Provide analysis in this exact JSON format:
{
  "insight": "Key insight about the query",
  "summary": "Summary of findings",
  "recommendation": "What to do with this data",
  "chartType": "bar|line|pie|area|scatter",
  "confidence": 0.95
}
    `;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'x-goog-api-key': GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (content) {
      try {
        const parsed = JSON.parse(content);
        return {
          success: true,
          analysis: parsed,
        };
      } catch (parseError) {
        return {
          success: true,
          analysis: {
            insight: content,
            summary: 'Analysis completed',
            recommendation: 'Review the data',
            chartType: 'bar',
            confidence: 0.8,
          },
        };
      }
    }

    return {
      success: false,
      message: 'No response from AI',
    };
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Process natural language query to structured format
 */
export const processNaturalLanguageQuery = (query, columns) => {
  const lowerQuery = query.toLowerCase();

  // Detect operation type
  let operation = 'aggregate';
  if (lowerQuery.includes('top')) operation = 'top';
  else if (lowerQuery.includes('bottom') || lowerQuery.includes('lowest')) operation = 'bottom';
  else if (lowerQuery.includes('average') || lowerQuery.includes('avg')) operation = 'average';
  else if (lowerQuery.includes('total') || lowerQuery.includes('sum')) operation = 'sum';

  // Extract numbers
  const numberMatch = query.match(/(\d+)/);
  const limit = numberMatch ? parseInt(numberMatch[1]) : 5;

  // Try to find column reference
  let targetColumn = columns[0];
  for (const col of columns) {
    if (lowerQuery.includes(col.toLowerCase())) {
      targetColumn = col;
      break;
    }
  }

  return {
    operation,
    limit,
    targetColumn,
    columns,
  };
};
