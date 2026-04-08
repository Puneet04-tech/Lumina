const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const fs = require("fs");
const path = require("path");

function generateTestPDF() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Lumina Analytics Test Report", 14, 22);

    // Some introductory text
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Generated on: " + new Date().toLocaleString(), 14, 30);
    doc.text("This is a sample document to test the PDF parsing and table extraction capabilities.", 14, 38);

    // Table Data
    const head = [['ID', 'Full Name', 'Department', 'Salary', 'Performance Score']];
    const body = [
        [1, 'John Doe', 'Engineering', '$120,000', '9.5'],
        [2, 'Jane Smith', 'Product', '$135,000', '9.8'],
        [3, 'Bob Johnson', 'Marketing', '$95,000', '8.2'],
        [4, 'Alice Brown', 'Sales', '$110,000', '8.9'],
        [5, 'Charlie Wilson', 'Engineering', '$115,000', '9.1'],
        [6, 'Diana Prince', 'HR', '$85,000', '9.3'],
        [7, 'Evan Wright', 'Engineering', '$125,000', '8.7'],
        [8, 'Fiona Glenanne', 'Security', '$140,000', '9.9'],
        [9, 'George Bluth', 'Development', '$75,000', '7.5'],
        [10, 'Hannah Abbott', 'Quality Assurance', '$92,000', '9.0']
    ];

    // Generate Table
    autoTable(doc, {
        head: head,
        body: body,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
    });

    // Final summary text below the table
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text("Summary Section:", 14, finalY);
    doc.setFontSize(10);
    doc.text("Total Employees Analyzed: 10", 14, finalY + 7);
    doc.text("Average Performance: 8.99", 14, finalY + 14);

    // Get the array buffer and save to file
    const pdfOutput = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfOutput);
    
    const outputPath = path.join(__dirname, 'test_data.pdf');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Test PDF successfully generated at: ${outputPath}`);
}

generateTestPDF();
