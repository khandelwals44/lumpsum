"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, Image as ImageIcon, Share2 } from "lucide-react";
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
        <Button variant="outline" className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={loading !== null}>
          <FileText className="mr-2 h-4 w-4" />
          {loading === "pdf" ? "Exporting PDF..." : "Export as PDF"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")} disabled={loading !== null}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {loading === "excel" ? "Exporting Excel..." : "Export as Excel"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={loading !== null}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {loading === "csv" ? "Exporting CSV..." : "Export as CSV"}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("image")} 
          disabled={loading !== null || !elementRef}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {loading === "image" ? "Exporting Image..." : "Export as Image"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
