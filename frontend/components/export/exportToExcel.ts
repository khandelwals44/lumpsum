import ExcelExport from "excel-export";

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
  // Prepare data for excel-export
  const conf: any = {};
  
  // Input parameters sheet
  const inputData = Object.entries(data.inputs).map(([key, value]) => ({
    Parameter: key,
    Value: value
  }));
  
  conf.inputs = {
    name: "Input Parameters",
    cols: [
      { caption: 'Parameter', type: 'string' },
      { caption: 'Value', type: 'string' }
    ],
    rows: inputData.map(item => [item.Parameter, item.Value])
  };

  // Results sheet
  const resultData = Object.entries(data.results).map(([key, value]) => ({
    Result: key,
    Value: typeof value === 'number' ? value.toLocaleString() : value
  }));
  
  conf.results = {
    name: "Results",
    cols: [
      { caption: 'Result', type: 'string' },
      { caption: 'Value', type: 'string' }
    ],
    rows: resultData.map(item => [item.Result, item.Value])
  };

  // Chart data sheet (if available)
  if (data.chartData && data.chartData.length > 0) {
    const chartKeys = Object.keys(data.chartData[0] || {});
    conf.chartData = {
      name: "Chart Data",
      cols: chartKeys.map(key => ({ caption: key, type: 'string' })),
      rows: data.chartData.map(item => chartKeys.map(key => item[key]))
    };
  }

  // Summary sheet
  const summaryData = [
    { Field: "Calculator Type", Value: calculatorType },
    { Field: "Generated Date", Value: new Date().toLocaleDateString() },
    { Field: "Generated Time", Value: new Date().toLocaleTimeString() },
    { Field: "Website", Value: "lumpsum.in" }
  ];
  
  conf.summary = {
    name: "Summary",
    cols: [
      { caption: 'Field', type: 'string' },
      { caption: 'Value', type: 'string' }
    ],
    rows: summaryData.map(item => [item.Field, item.Value])
  };

  // Generate and download the file
  const result = ExcelExport(conf);
  const fileName = `${calculatorType}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Create blob and download
  const blob = new Blob([result as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

