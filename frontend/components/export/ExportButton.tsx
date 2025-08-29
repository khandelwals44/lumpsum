"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  ChevronDown,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPDF } from "./exportToPDF";
import { exportToExcel } from "./exportToExcel";
import { exportToCSV } from "./exportToCSV";
import { exportToImage } from "./exportToImage";

interface ExportButtonProps {
  data: any;
  title: string;
  calculatorType: string;
  elementRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export default function ExportButton({
  data,
  title,
  calculatorType,
  elementRef,
  className = ""
}: ExportButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      switch (type) {
        case "pdf":
          await exportToPDF(data, title, calculatorType);
          break;
        case "excel":
          await exportToExcel(data, title, calculatorType);
          break;
        case "csv":
          await exportToCSV(data, title, calculatorType);
          break;
        case "image":
          if (elementRef?.current) {
            await exportToImage(elementRef.current, title);
          }
          break;
      }
    } catch (error) {
      console.error(`Export to ${type} failed:`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`group relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-blue-800 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
        >
          <Download className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium text-blue-700 dark:text-blue-300">Export Results</span>
          <ChevronDown className="ml-2 h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:rotate-180 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-lg"
      >
        <DropdownMenuItem 
          onClick={() => handleExport("pdf")} 
          disabled={loading !== null}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-100 dark:bg-red-900/30">
            <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Export as PDF</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">High-quality document</div>
          </div>
          {loading === "pdf" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport("excel")} 
          disabled={loading !== null}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-100 dark:bg-green-900/30">
            <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Export as Excel</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Spreadsheet format</div>
          </div>
          {loading === "excel" && <Loader2 className="h-4 w-4 animate-spin text-green-600" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport("csv")} 
          disabled={loading !== null}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/30">
            <FileSpreadsheet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Export as CSV</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Simple data format</div>
          </div>
          {loading === "csv" && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport("image")} 
          disabled={loading !== null || !elementRef}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-orange-100 dark:bg-orange-900/30">
            <ImageIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Export as Image</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Screenshot with charts</div>
          </div>
          {loading === "image" && <Loader2 className="h-4 w-4 animate-spin text-orange-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
