import { jsPDF } from "jspdf";

export function exportJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(filename: string, title: string, lines: string[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text(title, 40, 60);
  doc.setFontSize(11);
  let y = 90;
  for (const line of lines) {
    const split = doc.splitTextToSize(line, 520);
    doc.text(split as any, 40, y);
    y += (split as string[]).length * 14 + 6;
    if (y > 760) {
      doc.addPage();
      y = 60;
    }
  }
  doc.save(filename);
}
