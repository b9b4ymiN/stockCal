"use client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportButton() {
  const handleExport = async () => {
    const element = document.getElementById("report");
    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff", // Important to avoid "oklch" color error
      useCORS: true,
      scale: 2,
      logging: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("valuation-report.pdf");
  };

  return (
    <button
      onClick={handleExport}
      className="mt-4 px-4 py-2 bg-primary text-white rounded"
    >
      Export PDF
    </button>
  );
}
