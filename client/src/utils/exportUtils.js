import jsPDF from 'jspdf';
import AutoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

// Register autoTable plugin with jsPDF
AutoTable.jsPDF(jsPDF);

export const exportToPDF = async (fileName, data, columns, chartImage = null) => {
  try {
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
