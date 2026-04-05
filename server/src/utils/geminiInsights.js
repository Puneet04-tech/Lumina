/**
 * Google Gemini AI Integration for Advanced Insights
 * Generates professional, AI-powered analysis using Google's Gemini Flash
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate AI-powered advanced insights using Gemini Flash
 */
export const generateGeminiInsights = async (data, columns, metricColumn, dimensionColumn, basicStats, analysis) => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 === STARTING GEMINI INSIGHTS GENERATION ===');
    console.log('='.repeat(60));
    console.log('📋 Input data:');
    console.log('   Metric:', metricColumn);
    console.log('   Dimension:', dimensionColumn);
    console.log('   Records:', basicStats.count);
    console.log('\n🔑 Gemini Configuration:');
    console.log('   API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('   API Key length:', process.env.GEMINI_API_KEY?.length || 0);
    console.log('   Model:', process.env.GEMINI_MODEL || 'gemini-1.5-flash');
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
      console.log('⚠️  GEMINI API KEY NOT SET! Using local analysis instead.');
      console.log('💡 To enable Gemini: Add GEMINI_API_KEY to server/.env');
      console.log('='.repeat(60) + '\n');
      return null;
    }

    console.log('🚀 Calling Gemini API...');
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      console.log(`📱 Model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Prepare data summary for Gemini
      const topPerformers = analysis.topPerformers.slice(0, 3).map(p => `${p.name}: ${p.value}`).join(', ');
      const bottomPerformers = analysis.bottomPerformers.slice(0, 3).map(p => `${p.name}: ${p.value}`).join(', ');
      
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
      
      console.log('✅ Gemini API response received');
      console.log('📄 Response length:', responseText.length, 'characters');
      
      // Parse JSON from response
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('⚠️  No JSON found in response, showing first 500 chars:');
        console.log(responseText.substring(0, 500));
        throw new Error('Invalid response format from Gemini');
      }

      try {
        const geminiResponse = JSON.parse(jsonMatch[0]);
        console.log('✅ Gemini insights parsed successfully');
        console.log('   - Insight length:', geminiResponse.insight?.length || 0);
        console.log('   - Summary length:', geminiResponse.summary?.length || 0);
        console.log('   - Recommendation length:', geminiResponse.recommendation?.length || 0);
        console.log('='.repeat(60) + '\n');

        return {
          insight: geminiResponse.insight || '',
          summary: geminiResponse.summary || '',
          recommendation: geminiResponse.recommendation || '',
          source: 'gemini-ai',
        };
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
        console.error('❌ Tried to parse:', jsonMatch[0].substring(0, 200));
        throw new Error('Failed to parse Gemini response');
      }
    } catch (apiError) {
      console.error('❌ Gemini API call failed:', apiError.message);
      console.error('❌ Error details:', apiError);
      console.log('='.repeat(60) + '\n');
      throw apiError;
    }
  } catch (error) {
    console.error('❌ Gemini insights generation FAILED');
    console.error('   Error:', error.message);
    console.log('='.repeat(60) + '\n');
    return null; // Return null to use fallback
  }
};

/**
 * Generate Gemini insights with fallback to local analysis
 */
export const generateAIInsights = async (data, columns, metricColumn, dimensionColumn, basicStats, analysis) => {
  console.log('🤖 Starting AI insights generation...');
  console.log('   Attempting Gemini API...');
  
  // Try Gemini first
  const geminiInsights = await generateGeminiInsights(data, columns, metricColumn, dimensionColumn, basicStats, analysis);
  
  if (geminiInsights) {
    console.log('🎯 SUCCESS: Using Gemini AI insights');
    return geminiInsights;
  }

  console.log('📈 FALLBACK: Using local analysis (Gemini failed or not configured)');
  // Fallback: Return null and let caller use local analysis
  return null;
};
