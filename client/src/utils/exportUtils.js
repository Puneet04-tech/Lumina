import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

export const exportToPDF = async (fileName, data, columns, chartImage = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;

  // Title
  doc.setFontSize(16);
  doc.text(fileName, 10, yPosition);
  yPosition += 10;

  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 10, yPosition);
  yPosition += 10;

  // Chart Image if provided
  if (chartImage) {
    try {
      doc.addImage(chartImage, 'PNG', 10, yPosition, pageWidth - 20, 80);
      yPosition += 90;
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
    }
  }

  // Table
  doc.setTextColor(0, 0, 0);
  doc.autoTable({
    head: [columns],
    body: data.slice(0, 100).map((row) => columns.map((col) => row[col] || '')),
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

  doc.save(`${fileName}_${Date.now()}.pdf`);
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
