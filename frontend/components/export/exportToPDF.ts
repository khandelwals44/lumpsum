import jsPDF from "jspdf";

interface ExportData {
  inputs: Record<string, any>;
  results: Record<string, any>;
  chartData?: any[];
  monthlyBreakdown?: any[];
  yearlyBreakdown?: any[];
  summary?: Record<string, any>;
  absoluteReturn?: number;
  cagr?: number;
}

export async function exportToPDF(
  data: ExportData,
  title: string,
  calculatorType: string
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 25;

  // Add header with logo/branding
  doc.setFillColor(59, 130, 246); // Blue color
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("LUMPSUM.IN", margin, 10);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 30;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Calculator type and date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Calculator Type: ${calculatorType}`, margin, yPosition);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin, yPosition, { align: "right" });
  yPosition += 15;

  // Executive Summary Section
  if (data.summary || data.absoluteReturn || data.cagr) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    doc.text("EXECUTIVE SUMMARY", margin + 2, yPosition + 7);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (data.absoluteReturn !== undefined) {
      doc.text(`Absolute Return: ₹${data.absoluteReturn.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, margin + 5, yPosition);
      yPosition += 8;
    }

    if (data.cagr !== undefined) {
      doc.text(`CAGR: ${data.cagr.toFixed(2)}%`, margin + 5, yPosition);
      yPosition += 8;
    }

    if (data.summary) {
      Object.entries(data.summary).forEach(([key, value]) => {
        const text = `${key}: ${typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value}`;
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 25;
        }
        doc.text(text, margin + 5, yPosition);
        yPosition += 8;
      });
    }
    yPosition += 10;
  }

  // Input Parameters Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.text("INPUT PARAMETERS", margin + 2, yPosition + 7);
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Create table for inputs
  const inputData = Object.entries(data.inputs);
  const tableStartY = yPosition;

  // Table headers
  doc.setFont("helvetica", "bold");
  doc.text("Parameter", margin + 5, yPosition);
  doc.text("Value", pageWidth - margin - 50, yPosition);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  inputData.forEach(([key, value]) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 25;
    }

    const keyText = key.replace(/([A-Z])/g, ' $1').trim();
    const valueText = typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : String(value);

    doc.text(keyText, margin + 5, yPosition);
    doc.text(valueText, pageWidth - margin - 50, yPosition, { align: "right" });
    yPosition += 7;
  });
  yPosition += 10;

  // Results Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.text("CALCULATION RESULTS", margin + 2, yPosition + 7);
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Create table for results
  const resultData = Object.entries(data.results);
  const resultsTableStartY = yPosition;

  // Table headers
  doc.setFont("helvetica", "bold");
  doc.text("Result", margin + 5, yPosition);
  doc.text("Value", pageWidth - margin - 50, yPosition);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  resultData.forEach(([key, value]) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 25;
    }

    const keyText = key.replace(/([A-Z])/g, ' $1').trim();
    const valueText = typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : String(value);

    doc.text(keyText, margin + 5, yPosition);
    doc.text(valueText, pageWidth - margin - 50, yPosition, { align: "right" });
    yPosition += 7;
  });
  yPosition += 15;

  // Monthly Breakdown Section (if available)
  if (data.monthlyBreakdown && data.monthlyBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    doc.text("MONTHLY BREAKDOWN", margin + 2, yPosition + 7);
    yPosition += 15;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    // Table headers for monthly breakdown
    const headers = Object.keys(data.monthlyBreakdown[0]);
    const colWidth = (pageWidth - 2 * margin) / headers.length;

    headers.forEach((header, index) => {
      const x = margin + (index * colWidth);
      doc.text(header.replace(/([A-Z])/g, ' $1').trim(), x + 2, yPosition);
    });

    doc.setLineWidth(0.3);
    doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
    yPosition += 8;

    doc.setFont("helvetica", "normal");

    // Show first 24 months only to avoid too long PDF
    const displayData = data.monthlyBreakdown.slice(0, 24);
    displayData.forEach((row, rowIndex) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 25;
      }

      headers.forEach((header, colIndex) => {
        const x = margin + (colIndex * colWidth);
        const value = row[header];
        const text = typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : String(value);
        doc.text(text, x + 2, yPosition);
      });
      yPosition += 6;
    });

    if (data.monthlyBreakdown.length > 24) {
      doc.setFont("helvetica", "italic");
      doc.text(`... and ${data.monthlyBreakdown.length - 24} more months`, margin + 5, yPosition);
      yPosition += 10;
    }
    yPosition += 10;
  }

  // Yearly Breakdown Section (if available)
  if (data.yearlyBreakdown && data.yearlyBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    doc.text("YEARLY BREAKDOWN", margin + 2, yPosition + 7);
    yPosition += 15;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    // Table headers for yearly breakdown
    const yearHeaders = Object.keys(data.yearlyBreakdown[0]);
    const yearColWidth = (pageWidth - 2 * margin) / yearHeaders.length;

    yearHeaders.forEach((header, index) => {
      const x = margin + (index * yearColWidth);
      doc.text(header.replace(/([A-Z])/g, ' $1').trim(), x + 2, yPosition);
    });

    doc.setLineWidth(0.3);
    doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
    yPosition += 8;

    doc.setFont("helvetica", "normal");

    data.yearlyBreakdown.forEach((row) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 25;
      }

      yearHeaders.forEach((header, colIndex) => {
        const x = margin + (colIndex * yearColWidth);
        const value = row[header];
        const text = typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : String(value);
        doc.text(text, x + 2, yPosition);
      });
      yPosition += 7;
    });
    yPosition += 10;
  }

  // Chart Data Summary (if available)
  if (data.chartData && data.chartData.length > 0 && data.chartData[0]) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    doc.text("CHART DATA SUMMARY", margin + 2, yPosition + 7);
    yPosition += 15;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Total data points: ${data.chartData.length}`, margin + 5, yPosition);
    yPosition += 8;

    // Show summary statistics of chart data
    const chartDataForStats = data.chartData; // Type guard
    const numericKeys = Object.keys(chartDataForStats[0]).filter(key => typeof chartDataForStats[0][key] === 'number');

    if (numericKeys.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics:", margin + 5, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "normal");
      numericKeys.forEach(key => {
        const values = chartDataForStats.map(item => item[key]).filter(v => typeof v === 'number');
        if (values.length > 0) {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;

          doc.text(`${key}: Min: ${min.toLocaleString('en-IN', { maximumFractionDigits: 2 })}, Max: ${max.toLocaleString('en-IN', { maximumFractionDigits: 2 })}, Avg: ${avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, margin + 10, yPosition);
          yPosition += 6;
        }
      });
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Generated by lumpsum.in - Your trusted financial calculator", pageWidth / 2, pageHeight - 15, { align: "center" });
  doc.text(`Report generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 8, { align: "center" });

  // Save the PDF
  const fileName = `${calculatorType}_detailed_report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

