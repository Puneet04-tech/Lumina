import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

export const exportToPDF = async (fileName, data, columns, chartImage = null, analysisData = null) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Helper function to safely add text
    const addText = (text, x, y, fontSize = 10, color = [0, 0, 0]) => {
      if (!text) return 0;
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      try {
        // Remove emojis for safer text rendering
        const cleanText = String(text).replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu, '');
        if (Array.isArray(cleanText)) {
          doc.text(cleanText, x, y);
          return cleanText.length * 4;
        } else {
          doc.text(cleanText || '', x, y);
          return 5;
        }
      } catch (e) {
        console.warn('Error adding text:', e);
        return 0;
      }
    };

    // Title
    addText('Analysis Report', 10, yPosition, 20, [99, 102, 241]);
    yPosition += 12;

    // File name
    addText(fileName, 10, yPosition, 14, [0, 0, 0]);
    yPosition += 8;

    // Timestamp
    addText(`Generated: ${new Date().toLocaleString()}`, 10, yPosition, 10, [128, 128, 128]);
    yPosition += 12;

    // Chart Image if provided
    if (chartImage) {
      try {
        if (yPosition > pageHeight - 120) {
          doc.addPage();
          yPosition = 15;
        }
        const chartHeight = 80;
        const chartWidth = pageWidth - 20;
        doc.addImage(chartImage, 'PNG', 10, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 10;
      } catch (error) {
        console.error('Error adding chart to PDF:', error);
      }
    }

    // Statistics Section
    if (analysisData?.stats) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      addText('Statistics', 10, yPosition, 14, [99, 102, 241]);
      yPosition += 8;

      const stats = analysisData.stats || {};
      const statsData = [
        ['Metric', 'Value'],
        ['Count', String(stats.count !== undefined ? stats.count : 0)],
        ['Sum', stats.sum !== undefined ? String(Math.round(stats.sum * 100) / 100) : 'N/A'],
        ['Average', stats.average !== undefined ? String(Math.round(stats.average * 100) / 100) : 'N/A'],
        ['Maximum', stats.max !== undefined ? String(Math.round(stats.max * 100) / 100) : 'N/A'],
        ['Minimum', stats.min !== undefined ? String(Math.round(stats.min * 100) / 100) : 'N/A'],
      ];

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [statsData[0]],
          body: statsData.slice(1),
          startY: yPosition,
          margin: 10,
          theme: 'grid',
          headerStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 250] },
        });
        yPosition = doc.lastAutoTable.finalY + 8;
      }
    }

    // Insights Section
    if (analysisData?.insights) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      addText('AI Insights', 10, yPosition, 14, [99, 102, 241]);
      yPosition += 8;

      const insights = analysisData.insights || {};

      // Key Insight
      if (insights && typeof insights === 'object') {
        const insightText = insights.insight || insights.text || 'N/A';
        if (insightText && insightText !== 'N/A') {
          addText('Key Insight:', 10, yPosition, 11, [79, 70, 229]);
          yPosition += 5;
          const insightLines = doc.splitTextToSize(String(insightText), pageWidth - 20);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(insightLines, 10, yPosition);
          yPosition += insightLines.length * 4 + 5;
        }

        // Summary
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 15;
        }
        const summaryText = insights.summary || 'N/A';
        if (summaryText && summaryText !== 'N/A') {
          addText('Summary:', 10, yPosition, 11, [79, 70, 229]);
          yPosition += 5;
          const summaryLines = doc.splitTextToSize(String(summaryText), pageWidth - 20);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(summaryLines, 10, yPosition);
          yPosition += summaryLines.length * 4 + 5;
        }

        // Recommendation
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 15;
        }
        const recText = insights.recommendation || 'N/A';
        if (recText && recText !== 'N/A') {
          addText('Recommendation:', 10, yPosition, 11, [79, 70, 229]);
          yPosition += 5;
          const recLines = doc.splitTextToSize(String(recText), pageWidth - 20);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(recLines, 10, yPosition);
          yPosition += recLines.length * 4 + 5;
        }

        // Confidence
        const confidence = insights.confidence;
        if (confidence !== undefined && confidence !== null && !isNaN(confidence)) {
          addText(`Confidence: ${Math.round(Number(confidence) * 100)}%`, 10, yPosition, 10, [128, 128, 128]);
          yPosition += 10;
        }
      }
    }

    // Advanced Analysis
    if (analysisData?.analysis) {
      const analysis = analysisData.analysis || {};
      
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 15;
      }

      addText('Advanced Analysis', 10, yPosition, 14, [99, 102, 241]);
      yPosition += 10;

      // Top Performers
      if (analysis.topPerformers?.length > 0) {
        addText('Top Performers:', 10, yPosition, 11, [79, 70, 229]);
        yPosition += 6;

        const topData = [
          ['Rank', 'Name', 'Value'],
          ...analysis.topPerformers.slice(0, 5).map((p, i) => [
            String(i + 1),
            String(p.name || 'N/A').substring(0, 30),
            p.value !== undefined ? String(Math.round(p.value * 100) / 100) : 'N/A',
          ]),
        ];

        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            head: [topData[0]],
            body: topData.slice(1),
            startY: yPosition,
            margin: 10,
            theme: 'striped',
            headerStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
          });
          yPosition = doc.lastAutoTable.finalY + 6;
        }
      }

      // Trend Analysis
      if (analysis.trend?.direction) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 15;
        }

        addText('Trend Analysis:', 10, yPosition, 11, [79, 70, 229]);
        yPosition += 5;
        
        const direction = analysis.trend.direction.toUpperCase();
        const percentChange = analysis.trend.percentChange !== undefined ? analysis.trend.percentChange : 'N/A';
        const strength = analysis.trend.strength !== undefined ? (analysis.trend.strength * 100).toFixed(0) : 'N/A';
        
        addText(`Direction: ${direction} | Change: ${percentChange}% | Strength: ${strength}%`, 10, yPosition, 10, [0, 0, 0]);
        yPosition += 8;
      }

      // Data Quality
      if (analysis.dataQuality) {
        const dq = analysis.dataQuality || {};
        const completeness = dq.completeness !== undefined ? dq.completeness : 'N/A';
        const uniqueness = dq.uniquenessScore !== undefined ? dq.uniquenessScore : 'N/A';
        const rows = dq.totalRows !== undefined ? dq.totalRows : 'N/A';
        const qualityInfo = `Completeness: ${completeness}% | Uniqueness: ${uniqueness}% | Rows: ${rows}`;
        const qualityLines = doc.splitTextToSize(qualityInfo, pageWidth - 20);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(qualityLines, 10, yPosition);
        yPosition += qualityLines.length * 4 + 5;
      }

      // Outliers
      if (analysis.outlierCount !== undefined && analysis.outlierCount > 0) {
        addText(`Outliers Detected: ${analysis.outlierCount}`, 10, yPosition, 10, [200, 80, 80]);
        yPosition += 8;
      }
    }

    // PREMIUM AI FEATURES
    if (analysisData?.predictiveForecast || analysisData?.prioritizedInsights || analysisData?.dataQualityScore || analysisData?.queryRecommendations || analysisData?.comparativeBenchmarking) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      addText('PREMIUM AI FEATURES', 10, yPosition, 14, [147, 51, 234]);
      yPosition += 10;

      // Predictive Forecast
      if (analysisData?.predictiveForecast) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 15;
        }

        addText('Predictive Forecast', 10, yPosition, 12, [99, 102, 241]);
        yPosition += 7;

        const forecast = analysisData.predictiveForecast || {};
        if (forecast?.forecast && Array.isArray(forecast.forecast) && forecast.forecast.length > 0) {
          const forecastData = [
            ['Period', 'Predicted Value', 'Confidence'],
            ...forecast.forecast.map((f, i) => [
              `Period ${i + 1}`,
              f.value !== undefined ? String(Math.round(f.value * 100) / 100) : 'N/A',
              f.confidence !== undefined ? `${(f.confidence * 100).toFixed(0)}%` : 'N/A'
            ])
          ];

          if (typeof doc.autoTable === 'function') {
            doc.autoTable({
              head: [forecastData[0]],
              body: forecastData.slice(1),
              startY: yPosition,
              margin: 10,
              theme: 'grid',
              headerStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
            });
            yPosition = doc.lastAutoTable.finalY + 6;
          }

          if (forecast.trend && forecast.modelAccuracy !== undefined) {
            addText(`Trend: ${forecast.trend} | Model Accuracy: ${(forecast.modelAccuracy * 100).toFixed(1)}%`, 10, yPosition, 9, [128, 128, 128]);
            yPosition += 8;
          }
        } else {
          addText('No forecast data available', 10, yPosition, 10, [128, 128, 128]);
          yPosition += 8;
        }
      }

      // Prioritized Insights
      if (analysisData?.prioritizedInsights?.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 15;
        }

        addText('Prioritized Insights', 10, yPosition, 12, [217, 119, 6]);
        yPosition += 7;

        const insightData = [
          ['Priority', 'Score', 'Insight'],
          ...analysisData.prioritizedInsights.slice(0, 5).map(insight => [
            insight.priority || 'N/A',
            insight.score !== undefined ? String(Math.round(insight.score * 100) / 100) : 'N/A',
            String(insight.text || 'N/A').substring(0, 40)
          ])
        ];

        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            head: [insightData[0]],
            body: insightData.slice(1),
            startY: yPosition,
            margin: 10,
            theme: 'grid',
            headerStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold' },
          });
          yPosition = doc.lastAutoTable.finalY + 6;
        }
      }

      // 3. Data Quality Score
      if (analysisData?.dataQualityScore) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 15;
        }

        const dqs = analysisData.dataQualityScore || {};
        addText('Data Quality Score', 10, yPosition, 12, [6, 182, 212]);
        yPosition += 7;

        const overallScore = dqs.overallScore !== undefined ? dqs.overallScore.toFixed(1) : 'N/A';
        addText(`Overall Score: ${overallScore}/100`, 10, yPosition, 10, [0, 0, 0]);
        yPosition += 5;

        const completeness = dqs.completeness !== undefined ? dqs.completeness.toFixed(1) : 'N/A';
        const consistency = dqs.consistency !== undefined ? dqs.consistency.toFixed(1) : 'N/A';
        const accuracy = dqs.accuracy !== undefined ? dqs.accuracy.toFixed(1) : 'N/A';
        addText(`Completeness: ${completeness}% | Consistency: ${consistency}% | Accuracy: ${accuracy}%`, 10, yPosition, 10, [0, 0, 0]);
        yPosition += 5;

        const issuesFound = dqs.issuesFound !== undefined ? dqs.issuesFound : 0;
        addText(`Issues Found: ${issuesFound}`, 10, yPosition, 10, [0, 0, 0]);
        yPosition += 8;
      }

      // 4. Query Recommendations
      if (analysisData?.queryRecommendations?.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 15;
        }

        addText('Query Recommendations', 10, yPosition, 12, [34, 197, 94]);
        yPosition += 7;

        analysisData.queryRecommendations.slice(0, 5).forEach((rec, idx) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 15;
          }

          addText(`${idx + 1}. ${rec.question}`, 15, yPosition, 10, [0, 0, 0]);
          yPosition += 6;
        });
        yPosition += 4;
      }

      // 5. Comparative Benchmarking
      if (analysisData?.comparativeBenchmarking) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 15;
        }

        const bench = analysisData.comparativeBenchmarking || {};
        addText('Comparative Benchmarking', 10, yPosition, 12, [239, 68, 68]);
        yPosition += 7;

        const benchData = [
          ['Tier', 'Count', 'Avg Value', '% of Total'],
          ...Object.entries(bench.tiers || {}).map(([tier, data]) => [
            tier,
            String(data.count || 0),
            data.avgValue !== undefined ? String(Math.round(data.avgValue * 100) / 100) : 'N/A',
            data.percentage !== undefined ? `${(data.percentage * 100).toFixed(1)}%` : 'N/A'
          ])
        ];

        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            head: [benchData[0]],
            body: benchData.slice(1),
            startY: yPosition,
            margin: 10,
            theme: 'grid',
            headerStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
          });
          yPosition = doc.lastAutoTable.finalY + 6;
        }
      }
    }

    // Data Preview Section
    if (data?.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      addText('Data Preview (First 20 rows)', 10, yPosition, 14, [99, 102, 241]);
      yPosition += 8;

      const previewData = data.slice(0, 20).map((row) =>
        columns.map((col) => {
          const val = row[col];
          return val !== null && val !== undefined ? String(val).substring(0, 20) : '';
        })
      );

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [columns.map((col) => col.substring(0, 15))],
          body: previewData,
          startY: yPosition,
          margin: 10,
          theme: 'grid',
          headerStyles: {
            fillColor: [99, 102, 241],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
          },
          columnStyles: columns.reduce((acc, _, idx) => {
            acc[idx] = { cellWidth: (pageWidth - 20) / columns.length };
            return acc;
          }, {}),
          alternateRowStyles: {
            fillColor: [245, 245, 250],
          },
        });
      }
    }

    doc.save(`${fileName}_${Date.now()}.pdf`);
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error(`Failed to export PDF: ${error.message}`);
  }
};

export const exportToExcel = async (fileName, data, columns, chartImage = null, analysisData = null) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Summary/Insights Sheet
    if (analysisData && analysisData.insights) {
      const summarySheet = workbook.addWorksheet('Summary');
      const insights = analysisData.insights;

      summarySheet.columns = [{ header: 'Metric', key: 'metric', width: 20 }, { header: 'Value', key: 'value', width: 50 }];
      
      // Style header
      const headerRow = summarySheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

      summarySheet.addRow({ metric: 'Key Insight', value: insights.insight || 'N/A' });
      summarySheet.addRow({ metric: 'Summary', value: insights.summary || 'N/A' });
      summarySheet.addRow({ metric: 'Recommendation', value: insights.recommendation || 'N/A' });
      
      const confidenceValue = insights.confidence !== undefined ? `${Math.round(insights.confidence * 100)}%` : 'N/A';
      summarySheet.addRow({ metric: 'Confidence', value: confidenceValue });

      // Wrap text for better readability
      summarySheet.getColumn('value').alignment = { wrapText: true };
    }

    // Statistics Sheet
    if (analysisData && analysisData.stats) {
      const statsSheet = workbook.addWorksheet('Statistics');
      const stats = analysisData.stats || {};

      statsSheet.columns = [{ header: 'Metric', key: 'metric', width: 20 }, { header: 'Value', key: 'value', width: 30 }];
      
      // Style header
      const headerRow = statsSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

      statsSheet.addRow({ metric: 'Count', value: stats.count !== undefined ? stats.count : 'N/A' });
      statsSheet.addRow({ metric: 'Sum', value: stats.sum !== undefined ? Math.round(stats.sum * 100) / 100 : 'N/A' });
      statsSheet.addRow({ metric: 'Average', value: stats.average !== undefined ? Math.round(stats.average * 100) / 100 : 'N/A' });
      statsSheet.addRow({ metric: 'Maximum', value: stats.max !== undefined ? Math.round(stats.max * 100) / 100 : 'N/A' });
      statsSheet.addRow({ metric: 'Minimum', value: stats.min !== undefined ? Math.round(stats.min * 100) / 100 : 'N/A' });
    }

    // Chart Image Sheet
    if (chartImage) {
      try {
        const chartSheet = workbook.addWorksheet('Chart');
        // Convert data URL to base64
        const base64Data = chartImage.replace(/^data:image\/png;base64,/, '');
        const imageId = workbook.addImage({
          base64: base64Data,
          extension: 'png',
        });
        chartSheet.addImage(imageId, 'A1:H20');
      } catch (error) {
        console.error('Error adding chart to Excel:', error);
      }
    }

    // Advanced Analysis Sheet
    if (analysisData && analysisData.analysis) {
      const analysis = analysisData.analysis || {};

      // Top Performers Sheet
      if (analysis.topPerformers && analysis.topPerformers.length > 0) {
        const topSheet = workbook.addWorksheet('Top Performers');
        topSheet.columns = [
          { header: 'Rank', key: 'rank', width: 8 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Value', key: 'value', width: 15 },
        ];

        const headerRow = topSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } };

        analysis.topPerformers.forEach((p, idx) => {
          topSheet.addRow({
            rank: idx + 1,
            name: p.name || 'N/A',
            value: p.value !== undefined ? Math.round(p.value * 100) / 100 : 'N/A',
          });
        });
      }

      // Bottom Performers Sheet
      if (analysis.bottomPerformers && analysis.bottomPerformers.length > 0) {
        const bottomSheet = workbook.addWorksheet('Areas for Improvement');
        bottomSheet.columns = [
          { header: 'Rank', key: 'rank', width: 8 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Value', key: 'value', width: 15 },
        ];

        const headerRow = bottomSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };

        analysis.bottomPerformers.forEach((p, idx) => {
          bottomSheet.addRow({
            rank: idx + 1,
            name: p.name || 'N/A',
            value: p.value !== undefined ? Math.round(p.value * 100) / 100 : 'N/A',
          });
        });
      }

      // Trend & Quality Analysis Sheet
      if (analysis.trend || analysis.dataQuality) {
        const analysisSheet = workbook.addWorksheet('Analysis Metrics');
        analysisSheet.columns = [
          { header: 'Metric', key: 'metric', width: 25 },
          { header: 'Value', key: 'value', width: 25 },
        ];

        const headerRow = analysisSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

        if (analysis.trend) {
          const trend = analysis.trend || {};
          analysisSheet.addRow({ metric: 'Trend Direction', value: trend.direction || 'N/A' });
          const percentChange = trend.percentChange !== undefined ? trend.percentChange : 'N/A';
          analysisSheet.addRow({ metric: 'Percent Change', value: `${percentChange}%` });
          const strength = trend.strength !== undefined ? (trend.strength * 100).toFixed(0) : 'N/A';
          analysisSheet.addRow({ metric: 'Trend Strength', value: `${strength}%` });
        }

        if (analysis.dataQuality) {
          const dq = analysis.dataQuality || {};
          const completeness = dq.completeness !== undefined ? dq.completeness : 'N/A';
          analysisSheet.addRow({ metric: 'Data Completeness', value: `${completeness}%` });
          const uniqueness = dq.uniquenessScore !== undefined ? dq.uniquenessScore : 'N/A';
          analysisSheet.addRow({ metric: 'Uniqueness Score', value: `${uniqueness}%` });
          analysisSheet.addRow({ metric: 'Total Rows', value: dq.totalRows || 'N/A' });
        }

        if (analysis.outlierCount !== undefined && analysis.outlierCount > 0) {
          analysisSheet.addRow({ metric: 'Outliers Detected', value: analysis.outlierCount });
        }
      }
    }

    // ===== PREMIUM AI FEATURES SHEETS =====
    
    // 1. Predictive Forecast Sheet
    if (analysisData && analysisData.predictiveForecast) {
      const forecast = analysisData.predictiveForecast;
      const forecastSheet = workbook.addWorksheet('Predictive Forecast');
      forecastSheet.columns = [
        { header: 'Period', key: 'period', width: 12 },
        { header: 'Predicted Value', key: 'value', width: 15 },
        { header: 'Confidence %', key: 'confidence', width: 15 },
      ];

      const headerRow = forecastSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

      forecast.forecast.forEach((f, idx) => {
        forecastSheet.addRow({
          period: `Period ${idx + 1}`,
          value: Math.round(f.value * 100) / 100,
          confidence: `${(f.confidence * 100).toFixed(0)}%`,
        });
      });

      // Add trend info
      forecastSheet.addRow({ period: '', value: '', confidence: '' });
      forecastSheet.addRow({ period: 'Trend', value: forecast.trend, confidence: '' });
      forecastSheet.addRow({ period: 'Model Accuracy', value: `${(forecast.modelAccuracy * 100).toFixed(1)}%`, confidence: '' });
    }

    // 2. Prioritized Insights Sheet
    if (analysisData && analysisData.prioritizedInsights && Array.isArray(analysisData.prioritizedInsights)) {
      const insightsSheet = workbook.addWorksheet('Prioritized Insights');
      insightsSheet.columns = [
        { header: 'Priority', key: 'priority', width: 15 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Insight', key: 'text', width: 50 },
      ];

      const headerRow = insightsSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };

      analysisData.prioritizedInsights.slice(0, 20).forEach((insight) => {
        insightsSheet.addRow({
          priority: insight.priority,
          score: insight.score,
          text: insight.text,
        });
        insightsSheet.lastRow.alignment = { wrapText: true };
      });
    }

    // 3. Data Quality Score Sheet
    if (analysisData && analysisData.dataQualityScore) {
      const dqs = analysisData.dataQualityScore;
      const qualitySheet = workbook.addWorksheet('Data Quality');
      qualitySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      const headerRow = qualitySheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF06B6D4' } };

      qualitySheet.addRow({ metric: 'Overall Score', value: `${dqs.overallScore.toFixed(1)}/100` });
      qualitySheet.addRow({ metric: 'Completeness', value: `${dqs.completeness.toFixed(1)}%` });
      qualitySheet.addRow({ metric: 'Consistency', value: `${dqs.consistency.toFixed(1)}%` });
      qualitySheet.addRow({ metric: 'Accuracy', value: `${dqs.accuracy.toFixed(1)}%` });
      qualitySheet.addRow({ metric: 'Issues Found', value: dqs.issuesFound });
    }

    // 4. Query Recommendations Sheet
    if (analysisData && analysisData.queryRecommendations && Array.isArray(analysisData.queryRecommendations)) {
      const recSheet = workbook.addWorksheet('Query Recommendations');
      recSheet.columns = [
        { header: 'Rank', key: 'rank', width: 8 },
        { header: 'Question', key: 'question', width: 50 },
        { header: 'Difficulty', key: 'difficulty', width: 12 },
      ];

      const headerRow = recSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } };

      analysisData.queryRecommendations.slice(0, 10).forEach((rec, idx) => {
        recSheet.addRow({
          rank: idx + 1,
          question: rec.question,
          difficulty: rec.difficulty,
        });
        recSheet.lastRow.alignment = { wrapText: true };
      });
    }

    // 5. Comparative Benchmarking Sheet
    if (analysisData && analysisData.comparativeBenchmarking) {
      const bench = analysisData.comparativeBenchmarking;
      const benchSheet = workbook.addWorksheet('Benchmarking');
      benchSheet.columns = [
        { header: 'Tier', key: 'tier', width: 20 },
        { header: 'Count', key: 'count', width: 10 },
        { header: 'Avg Value', key: 'avgValue', width: 15 },
        { header: '% of Total', key: 'percentage', width: 12 },
      ];

      const headerRow = benchSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };

      Object.entries(bench.tiers).forEach(([tier, data]) => {
        benchSheet.addRow({
          tier: tier,
          count: data.count,
          avgValue: Math.round(data.avgValue * 100) / 100,
          percentage: `${(data.percentage * 100).toFixed(1)}%`,
        });
      });
    }

    // Data Sheet
    const dataSheet = workbook.addWorksheet('Data');
    
    // Add headers
    dataSheet.addRow(columns);

    // Style headers
    const headerRow = dataSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

    // Add data
    data.forEach((row) => {
      dataSheet.addRow(columns.map((col) => row[col] || ''));
    });

    // Auto-fit columns
    columns.forEach((col, idx) => {
      const maxLength = Math.max(
        col.length,
        ...data.map((row) => String(row[col] || '').length)
      );
      dataSheet.getColumn(idx + 1).width = Math.min(maxLength + 2, 50);
    });

    // Generate Excel file as buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error(`Failed to export Excel: ${error.message}`);
  }
};

export const exportToJSON = async (fileName, data, columns) => {
  const jsonData = {
    exportDate: new Date().toISOString(),
    fileName: fileName,
    rowCount: data.length,
    columns: columns,
    data: data.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        obj[col] = row[col] || null;
      });
      return obj;
    }),
  };

  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
