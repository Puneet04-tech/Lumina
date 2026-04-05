import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

export const exportToPDF = async (fileName, data, columns, chartImage = null, analysisData = null) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('📊 Analysis Report', 10, yPosition);
    yPosition += 12;

    // File name
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(fileName, 10, yPosition);
    yPosition += 8;

    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 10, yPosition);
    yPosition += 12;

    // Chart Image if provided - POSITIONED AT TOP
    if (chartImage) {
      try {
        const chartHeight = 100;
        const chartWidth = pageWidth - 20;
        doc.addImage(chartImage, 'PNG', 10, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 12;
      } catch (error) {
        console.error('Error adding chart to PDF:', error);
      }
    }

    // Statistics Section if analysis data provided
    if (analysisData && analysisData.stats) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('📈 Statistics', 10, yPosition);
      yPosition += 8;

      const stats = analysisData.stats;
      const statsData = [
        ['Metric', 'Value'],
        ['Count', String(stats.count)],
        ['Sum', String(Math.round(stats.sum * 100) / 100)],
        ['Average', String(Math.round(stats.average * 100) / 100)],
        ['Maximum', String(Math.round(stats.max * 100) / 100)],
        ['Minimum', String(Math.round(stats.min * 100) / 100)],
      ];

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [statsData[0]],
          body: statsData.slice(1),
          startY: yPosition,
          margin: 10,
          theme: 'grid',
          headerStyles: {
            fillColor: [99, 102, 241],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 250],
          },
        });
        yPosition = doc.lastAutoTable.finalY + 8;
      }
    }

    // Insights Section
    if (analysisData && analysisData.insights) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('💡 AI Insights', 10, yPosition);
      yPosition += 8;

      const insights = analysisData.insights;

      // Key Insight
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text('Key Insight:', 10, yPosition);
      yPosition += 5;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const insightLines = doc.splitTextToSize(insights.insight || 'N/A', pageWidth - 20);
      doc.text(insightLines, 10, yPosition);
      yPosition += insightLines.length * 5 + 5;

      // Summary
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 15;
      }
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text('Summary:', 10, yPosition);
      yPosition += 5;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const summaryLines = doc.splitTextToSize(insights.summary || 'N/A', pageWidth - 20);
      doc.text(summaryLines, 10, yPosition);
      yPosition += summaryLines.length * 5 + 5;

      // Recommendation
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 15;
      }
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text('Recommendation:', 10, yPosition);
      yPosition += 5;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const recLines = doc.splitTextToSize(insights.recommendation || 'N/A', pageWidth - 20);
      doc.text(recLines, 10, yPosition);
      yPosition += recLines.length * 5 + 5;

      // Confidence
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Confidence: ${Math.round(insights.confidence * 100)}%`, 10, yPosition);
    }

    // Data Preview Section
    if (data && data.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 15;
      }

      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('📋 Data Preview (First 20 rows)', 10, yPosition);
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

export const exportToExcel = async (fileName, data, columns) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Add headers
  worksheet.addRow(columns);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

  // Add data
  data.forEach((row) => {
    worksheet.addRow(columns.map((col) => row[col] || ''));
  });

  // Auto-fit columns
  columns.forEach((col, idx) => {
    const maxLength = Math.max(
      col.length,
      ...data.map((row) => String(row[col] || '').length)
    );
    worksheet.getColumn(idx + 1).width = Math.min(maxLength + 2, 50);
  });

  await workbook.xlsx.writeFile(`${fileName}_${Date.now()}.xlsx`);
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
