"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Table,
  Loader2,
  Download
} from "lucide-react";
import { exportToPDF } from "./exportToPDF";
import { exportToExcel } from "./exportToExcel";
import { exportToCSV } from "./exportToCSV";
import { exportToImage } from "./exportToImage";

interface ExportButtonsProps {
  data: any;
  title: string;
  calculatorType: string;
  elementRef?: React.RefObject<HTMLElement>;
  className?: string;
  layout?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
}

export default function ExportButtons({
  data,
  title,
  calculatorType,
  elementRef,
  className = "",
  layout = "horizontal",
  size = "md"
}: ExportButtonsProps) {
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

  const buttonSize = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3",
    lg: "px-5 py-4 text-lg"
  };

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const exportOptions = [
    {
      type: "pdf",
      label: "PDF Report",
      description: "Detailed professional report",
      icon: FileText,
      color: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
      lightColor: "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/50 dark:hover:bg-red-900/50 dark:border-red-800"
    },
    {
      type: "excel",
      label: "Excel Workbook",
      description: "Multi-sheet spreadsheet",
      icon: FileSpreadsheet,
      color: "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
      lightColor: "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/50 dark:hover:bg-green-900/50 dark:border-green-800"
    },
    {
      type: "csv",
      label: "CSV Data",
      description: "Simple data format",
      icon: Table,
      color: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
      lightColor: "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:border-blue-800"
    },
    {
      type: "image",
      label: "Image Screenshot",
      description: "Chart with results",
      icon: ImageIcon,
      color: "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
      lightColor: "bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 dark:border-purple-800"
    }
  ];

  return (
    <div className={`flex ${layout === "vertical" ? "flex-col" : "flex-wrap"} gap-3 ${className}`}>
      {exportOptions.map((option) => {
        const Icon = option.icon;
        const isLoading = loading === option.type;

        return (
          <Button
            key={option.type}
            onClick={() => handleExport(option.type)}
            disabled={isLoading || (option.type === "image" && !elementRef)}
            className={`
              group relative overflow-hidden border transition-all duration-200
              ${buttonSize[size]}
              ${option.lightColor}
              hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
              ${layout === "vertical" ? "w-full justify-start" : "flex-1 min-w-[140px]"}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                flex items-center justify-center rounded-md p-1.5
                ${iconSize[size]}
                ${option.color}
                transition-transform duration-200 group-hover:scale-110
              `}>
                {isLoading ? (
                  <Loader2 className={`${iconSize[size]} animate-spin text-white`} />
                ) : (
                  <Icon className={`${iconSize[size]} text-white`} />
                )}
              </div>

              <div className="flex flex-col items-start">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {option.label}
                </span>
                {size !== "sm" && (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {option.description}
                  </span>
                )}
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:translate-x-0" />
          </Button>
        );
      })}
    </div>
  );
}

// Legacy export button (dropdown) for backward compatibility
export function ExportButton({
  data,
  title,
  calculatorType,
  elementRef,
  className = ""
}: {
  data: any;
  title: string;
  calculatorType: string;
  elementRef?: React.RefObject<HTMLElement>;
  className?: string;
}) {
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
    <Button
      onClick={() => handleExport("pdf")}
      disabled={loading !== null}
      className={`group relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-blue-800 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
      ) : (
        <Download className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
      )}
      <span className="font-medium text-blue-700 dark:text-blue-300">
        {loading ? "Exporting..." : "Export PDF"}
      </span>
    </Button>
  );
}
