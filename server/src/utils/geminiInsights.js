/**
 * Google Gemini AI Integration for Advanced Insights
 * Generates professional, AI-powered analysis using Google's Gemini Pro
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI-powered advanced insights using Gemini Pro
 */
export const generateGeminiInsights = async (data, columns, metricColumn, dimensionColumn, basicStats, analysis) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prepare data summary for Gemini
    const topPerformers = analysis.topPerformers.map(p => `${p.name}: ${p.value}`).join(', ');
    const bottomPerformers = analysis.bottomPerformers.map(p => `${p.name}: ${p.value}`).join(', ');
    
    const prompt = `You are a professional business analyst and data scientist. Analyze the following dataset and provide expert insights:

**Dataset Summary:**
- Metric: ${metricColumn}
- Dimension: ${dimensionColumn}
- Total Records: ${basicStats.count}
- Data Columns: ${columns.join(', ')}

**Statistical Summary:**
- Sum: ${basicStats.sum}
- Average: ${basicStats.average}
- Min: ${basicStats.min}
- Max: ${basicStats.max}
- Data Completeness: ${analysis.dataQuality.completeness}%
- Outliers Found: ${analysis.outliers.count}

**Top Performers:** ${topPerformers}
**Bottom Performers:** ${bottomPerformers}

**Trend Direction:** ${analysis.trend.direction} (${analysis.trend.percentChange}% change)
**Correlation Highlights:** ${Object.entries(analysis.correlations).filter(([_, v]) => Math.abs(v) > 0.5).map(([k, v]) => `${k}: ${(v*100).toFixed(0)}%`).join(', ') || 'None significant'}

Based on this data, provide:

1. **KEY ADVANCED INSIGHT** (2-3 sentences): Provide a sophisticated, multi-dimensional insight that reveals non-obvious patterns, business implications, and strategic significance. Go beyond surface-level statistics.

2. **EXECUTIVE SUMMARY** (2-3 sentences): Detailed statistical analysis with data quality assessment, risk factors, and distribution patterns.

3. **STRATEGIC RECOMMENDATIONS** (2-3 actionable items): Specific, data-driven recommendations for action. Reference specific performers and metrics.

Format your response as JSON with keys: insight, summary, recommendation`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON from response - handle various JSON positions
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    try {
      const geminiResponse = JSON.parse(jsonMatch[0]);

      return {
        insight: geminiResponse.insight || '',
        summary: geminiResponse.summary || '',
        recommendation: geminiResponse.recommendation || '',
        source: 'gemini-ai',
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse Gemini response');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return null; // Return null to use fallback
  }
};

/**
 * Generate Gemini insights with fallback to local analysis
 */
export const generateAIInsights = async (data, columns, metricColumn, dimensionColumn, basicStats, analysis) => {
  // Try Gemini first
  const geminiInsights = await generateGeminiInsights(data, columns, metricColumn, dimensionColumn, basicStats, analysis);
  
  if (geminiInsights) {
    return geminiInsights;
  }

  // Fallback: Return null and let caller use local analysis
  return null;
};
