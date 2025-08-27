import * as XLSX from "xlsx";

interface ExportData {
  inputs: Record<string, any>;
  results: Record<string, any>;
  chartData?: any[];
}

export async function exportToExcel(
  data: ExportData,
  title: string,
  calculatorType: string
): Promise<void> {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Input parameters sheet
  const inputData = Object.entries(data.inputs).map(([key, value]) => ({
    Parameter: key,
    Value: value
  }));
  const inputSheet = XLSX.utils.json_to_sheet(inputData);
  XLSX.utils.book_append_sheet(workbook, inputSheet, "Input Parameters");

  // Results sheet
  const resultData = Object.entries(data.results).map(([key, value]) => ({
    Result: key,
    Value: typeof value === 'number' ? value.toLocaleString() : value
  }));
  const resultSheet = XLSX.utils.json_to_sheet(resultData);
  XLSX.utils.book_append_sheet(workbook, resultSheet, "Results");

  // Chart data sheet (if available)
  if (data.chartData && data.chartData.length > 0) {
    const chartSheet = XLSX.utils.json_to_sheet(data.chartData);
    XLSX.utils.book_append_sheet(workbook, chartSheet, "Chart Data");
  }

  // Summary sheet
  const summaryData = [
    { Field: "Calculator Type", Value: calculatorType },
    { Field: "Generated Date", Value: new Date().toLocaleDateString() },
    { Field: "Generated Time", Value: new Date().toLocaleTimeString() },
    { Field: "Website", Value: "lumpsum.in" }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Save the file
  const fileName = `${calculatorType}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

