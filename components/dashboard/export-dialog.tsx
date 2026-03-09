"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadReport, type ExportFormat } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";

const exportOptions: { label: string; value: ExportFormat; description: string }[] = [
  { label: "PDF", value: "pdf", description: "Document download for sharing or printing." },
  { label: "Excel CSV", value: "csv", description: "Spreadsheet-friendly export." },
  { label: "JSON", value: "json", description: "Raw structured data export." },
];

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  reportPath: string;
  params?: Record<string, unknown>;
}

export function ExportDialog({ open, onOpenChange, title, subtitle, reportPath, params }: ExportDialogProps) {
  const [selected, setSelected] = React.useState<ExportFormat>(exportOptions[0].value);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadReport(reportPath, selected, params);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to export report"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#edd7aa] bg-[#fffaf0] p-5 sm:p-6">
        <DialogHeader className="mb-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[#c9841d]">{subtitle}</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-[#f1e2c6] bg-[#fffaf0] p-4 sm:p-5">
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelected(option.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border border-[#f1d6a4] bg-white px-4 py-3 text-left text-sm font-medium text-[#5f513a] shadow-sm transition-colors hover:border-[#e4bd7b]",
                  selected === option.value && "ring-2 ring-[#d39a2f]"
                )}
              >
                <div>
                  <div>{option.label}</div>
                  <div className="mt-1 text-xs font-normal text-[#927b52]">{option.description}</div>
                </div>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border border-[#d39a2f]",
                    selected === option.value ? "bg-[#d39a2f]" : "bg-white"
                  )}
                >
                  {selected === option.value ? (
                    <span className="block h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5">
            <Button variant="gold" size="lg" className="w-full" onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
