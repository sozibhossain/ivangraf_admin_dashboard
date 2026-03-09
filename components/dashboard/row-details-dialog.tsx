"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RowDetailItem {
  label: string;
  value: React.ReactNode;
}

interface RowDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  details: RowDetailItem[];
}

export function RowDetailsDialog({
  open,
  onOpenChange,
  title,
  description,
  details,
}: RowDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-[#edd7aa] bg-[#fffaf0] p-5 sm:p-6">
        <DialogHeader className="mb-5">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-[#8a7346]">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-xl border border-[#f1dfb7] bg-white px-4 py-3.5 sm:px-5 sm:py-4"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a98a47]">
                {detail.label}
              </div>
              <div className="mt-1.5 break-words text-base font-medium text-[#3f3728]">
                {detail.value ?? "-"}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
