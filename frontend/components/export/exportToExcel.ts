import * as XLSX from "xlsx";

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

export async function exportToExcel(
  data: ExportData,
  title: string,
  calculatorType: string
): Promise<void> {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // 1. Executive Summary Sheet
  const summarySheetData = [
    ["LUMPSUM.IN - Financial Calculator Report"],
    [""],
    ["Report Details"],
    ["Calculator Type", calculatorType],
    ["Report Title", title],
    ["Generated Date", new Date().toLocaleDateString()],
    ["Generated Time", new Date().toLocaleTimeString()],
    [""],
    ["Key Metrics"]
  ];

  if (data.absoluteReturn !== undefined) {
    summarySheetData.push(["Absolute Return", `₹${data.absoluteReturn.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`]);
  }

  if (data.cagr !== undefined) {
    summarySheetData.push(["CAGR", `${data.cagr.toFixed(2)}%`]);
  }

  if (data.summary) {
    summarySheetData.push([""]);
    summarySheetData.push(["Additional Summary"]);
    Object.entries(data.summary).forEach(([key, value]) => {
      summarySheetData.push([
        key.replace(/([A-Z])/g, ' $1').trim(),
        typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value
      ]);
    });
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");

  // 2. Input Parameters Sheet
  const inputData = [
    ["INPUT PARAMETERS"],
    [""],
    ["Parameter", "Value", "Description"]
  ];

  Object.entries(data.inputs).forEach(([key, value]) => {
    inputData.push([
      key.replace(/([A-Z])/g, ' $1').trim(),
      value,
      "" // Description can be added later if needed
    ]);
  });

  const inputSheet = XLSX.utils.aoa_to_sheet(inputData);
  XLSX.utils.book_append_sheet(workbook, inputSheet, "Input Parameters");

  // 3. Calculation Results Sheet
  const resultData = [
    ["CALCULATION RESULTS"],
    [""],
    ["Result", "Value", "Formula/Notes"]
  ];

  Object.entries(data.results).forEach(([key, value]) => {
    resultData.push([
      key.replace(/([A-Z])/g, ' $1').trim(),
      typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value,
      "" // Formula can be added later if needed
    ]);
  });

  const resultSheet = XLSX.utils.aoa_to_sheet(resultData);
  XLSX.utils.book_append_sheet(workbook, resultSheet, "Results");

  // 4. Monthly Breakdown Sheet (if available)
  if (data.monthlyBreakdown && data.monthlyBreakdown.length > 0) {
    const monthlyData = [
      ["MONTHLY BREAKDOWN"],
      [""]
    ];

    // Add headers
    const headers = Object.keys(data.monthlyBreakdown[0]);
    monthlyData.push(headers.map(h => h.replace(/([A-Z])/g, ' $1').trim()));

    // Add data rows
    data.monthlyBreakdown.forEach((row, index) => {
      monthlyData.push(headers.map(header => {
        const value = row[header];
        if (typeof value === 'number') {
          return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        }
        return value;
      }));
    });

    // Add summary row
    if (data.monthlyBreakdown.length > 1) {
      monthlyData.push([""]);
      monthlyData.push(["SUMMARY STATISTICS"]);

      const monthlyBreakdown = data.monthlyBreakdown; // Type guard
      const numericHeaders = headers.filter(header => typeof monthlyBreakdown[0][header] === 'number');
      numericHeaders.forEach(header => {
        const values = monthlyBreakdown.map(row => row[header]).filter(v => typeof v === 'number');
        if (values.length > 0) {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const total = values.reduce((a, b) => a + b, 0);

          monthlyData.push([
            `${header.replace(/([A-Z])/g, ' $1').trim()} - Min`,
            min.toLocaleString('en-IN', { maximumFractionDigits: 2 })
          ]);
          monthlyData.push([
            `${header.replace(/([A-Z])/g, ' $1').trim()} - Max`,
            max.toLocaleString('en-IN', { maximumFractionDigits: 2 })
          ]);
          monthlyData.push([
            `${header.replace(/([A-Z])/g, ' $1').trim()} - Average`,
            avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })
          ]);
          monthlyData.push([
            `${header.replace(/([A-Z])/g, ' $1').trim()} - Total`,
            total.toLocaleString('en-IN', { maximumFractionDigits: 2 })
          ]);
        }
      });
    }

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Breakdown");
  }

  // 5. Yearly Breakdown Sheet (if available)
  if (data.yearlyBreakdown && data.yearlyBreakdown.length > 0 && data.yearlyBreakdown[0]) {
    const yearlyData = [
      ["YEARLY BREAKDOWN"],
      [""]
    ];

    // Add headers
    const yearlyBreakdown = data.yearlyBreakdown; // Type guard
    const yearHeaders = Object.keys(yearlyBreakdown[0]);
    yearlyData.push(yearHeaders.map(h => h.replace(/([A-Z])/g, ' $1').trim()));

    // Add data rows
    yearlyBreakdown.forEach((row) => {
      yearlyData.push(yearHeaders.map(header => {
        const value = row[header];
        if (typeof value === 'number') {
          return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        }
        return value;
      }));
    });

    // Add CAGR calculation if applicable
    if (yearlyBreakdown.length > 1 && yearlyBreakdown[0].value && yearlyBreakdown[yearlyBreakdown.length - 1].value) {
      yearlyData.push([""]);
      yearlyData.push(["CAGR CALCULATION"]);

      const firstValue = yearlyBreakdown[0].value;
      const lastValue = yearlyBreakdown[yearlyBreakdown.length - 1].value;
      const years = yearlyBreakdown.length - 1;

      if (firstValue > 0) {
        const calculatedCagr = (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100;
        yearlyData.push(["Calculated CAGR", `${calculatedCagr.toFixed(2)}%`]);
      }
    }

    const yearlySheet = XLSX.utils.aoa_to_sheet(yearlyData);
    XLSX.utils.book_append_sheet(workbook, yearlySheet, "Yearly Breakdown");
  }

  // 6. Chart Data Sheet (if available)
  if (data.chartData && data.chartData.length > 0 && data.chartData[0]) {
    const chartData = [
      ["CHART DATA"],
      [""]
    ];

    // Add headers
    const chartDataArray = data.chartData; // Type guard
    const chartHeaders = Object.keys(chartDataArray[0]);
    chartData.push(chartHeaders.map(h => h.replace(/([A-Z])/g, ' $1').trim()));

    // Add data rows
    chartDataArray.forEach((row) => {
      chartData.push(chartHeaders.map(header => {
        const value = row[header];
        if (typeof value === 'number') {
          return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        }
        return value;
      }));
    });

    // Add chart statistics
    chartData.push([""]);
    chartData.push(["CHART STATISTICS"]);

    const numericHeaders = chartHeaders.filter(header => typeof chartDataArray[0][header] === 'number');
    numericHeaders.forEach(header => {
      const values = chartDataArray.map(row => row[header]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        chartData.push([
          `${header.replace(/([A-Z])/g, ' $1').trim()} - Min`,
          min.toLocaleString('en-IN', { maximumFractionDigits: 2 })
        ]);
        chartData.push([
          `${header.replace(/([A-Z])/g, ' $1').trim()} - Max`,
          max.toLocaleString('en-IN', { maximumFractionDigits: 2 })
        ]);
        chartData.push([
          `${header.replace(/([A-Z])/g, ' $1').trim()} - Average`,
          avg.toLocaleString('en-IN', { maximumFractionDigits: 2 })
        ]);
      }
    });

    const chartSheet = XLSX.utils.aoa_to_sheet(chartData);
    XLSX.utils.book_append_sheet(workbook, chartSheet, "Chart Data");
  }

  // 7. Financial Calculations Sheet (with formulas)
  const formulaData = [
    ["FINANCIAL CALCULATIONS"],
    [""],
    ["Formula Reference Guide"],
    ["CAGR Formula", "(Ending Value / Beginning Value)^(1/Number of Years) - 1"],
    ["Absolute Return", "Ending Value - Beginning Value"],
    ["Annualized Return", "((Ending Value / Beginning Value)^(1/Number of Years) - 1) * 100"],
    [""],
    ["Common Financial Formulas"],
    ["Future Value (FV)", "PV * (1 + r)^n"],
    ["Present Value (PV)", "FV / (1 + r)^n"],
    ["Compound Interest", "P * (1 + r/n)^(nt)"],
    ["Simple Interest", "P * r * t"],
    [""],
    ["Where:"],
    ["PV", "Present Value"],
    ["FV", "Future Value"],
    ["r", "Rate of Return"],
    ["n", "Number of Periods"],
    ["t", "Time"],
    ["P", "Principal Amount"]
  ];

  const formulaSheet = XLSX.utils.aoa_to_sheet(formulaData);
  XLSX.utils.book_append_sheet(workbook, formulaSheet, "Financial Formulas");

  // 8. Data Analysis Sheet (if we have enough data)
  if (data.chartData && data.chartData.length > 5 && data.chartData[0] && data.chartData[data.chartData.length - 1]) {
    const analysisData = [
      ["DATA ANALYSIS"],
      [""],
      ["Trend Analysis"],
      ["Data Points", data.chartData.length],
      ["Time Period", `${data.chartData.length} periods`],
      [""],
      ["Performance Metrics"]
    ];

    // Calculate some basic metrics
    const chartDataForAnalysis = data.chartData; // Type guard
    const firstPoint = chartDataForAnalysis[0];
    const lastPoint = chartDataForAnalysis[chartDataForAnalysis.length - 1];

    // Look for value field
    const valueKeys = Object.keys(firstPoint).filter(key =>
      key.toLowerCase().includes('value') || key.toLowerCase().includes('amount')
    );

    if (valueKeys.length > 0) {
      const valueKey = valueKeys[0];
      const startValue = firstPoint[valueKey];
      const endValue = lastPoint[valueKey];

      if (typeof startValue === 'number' && typeof endValue === 'number') {
        const absoluteChange = endValue - startValue;
        const percentageChange = ((endValue - startValue) / startValue) * 100;

        analysisData.push(["Starting Value", startValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })]);
        analysisData.push(["Ending Value", endValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })]);
        analysisData.push(["Absolute Change", absoluteChange.toLocaleString('en-IN', { maximumFractionDigits: 2 })]);
        analysisData.push(["Percentage Change", `${percentageChange.toFixed(2)}%`]);
      }
    }

    const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData);
    XLSX.utils.book_append_sheet(workbook, analysisSheet, "Analysis");
  }

  // Save the file
  const fileName = `${calculatorType}_comprehensive_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

