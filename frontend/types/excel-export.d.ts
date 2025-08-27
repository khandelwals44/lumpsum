declare module 'excel-export' {
  interface ExcelConfig {
    [sheetName: string]: {
      name: string;
      cols: Array<{
        caption: string;
        type: string;
      }>;
      rows: any[][];
    };
  }

  function execute(config: ExcelConfig): Uint8Array;
  export default execute;
}