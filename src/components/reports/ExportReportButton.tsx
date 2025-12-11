import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportReportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns: { key: string; label: string }[];
}

const ExportReportButton = ({ data, filename, columns }: ExportReportButtonProps) => {
  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    // Create CSV header
    const header = columns.map(col => col.label).join(",");
    
    // Create CSV rows
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    );

    const csv = [header, ...rows].join("\n");
    
    // Create and download file
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Rapport exporté avec succès");
  };

  return (
    <Button variant="outline" onClick={exportToCSV} className="gap-2">
      <Download className="h-4 w-4" />
      Exporter CSV
    </Button>
  );
};

export default ExportReportButton;
