"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RowDetailItem } from "@/components/dashboard/row-details-dialog";

export interface DialogItemRow {
  name: string;
  quantity: React.ReactNode;
  price: React.ReactNode;
  total: React.ReactNode;
}

interface ItemsDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  details: RowDetailItem[];
  items: DialogItemRow[];
  totalLabel: string;
  totalValue: React.ReactNode;
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onExport?: () => void;
}

export function ItemsDetailsDialog({
  open,
  onOpenChange,
  title,
  description,
  details,
  items,
  totalLabel,
  totalValue,
  loading = false,
  errorMessage = null,
  onRetry,
  onExport,
}: ItemsDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-[#edd7aa] bg-[#fffaf0] p-5 sm:p-6">
        <DialogHeader className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>{title}</DialogTitle>
            {onExport ? (
              <Button variant="soft" size="sm" className="shrink-0" onClick={onExport}>
                Export
              </Button>
            ) : null}
          </div>
          {description ? (
            <DialogDescription className="text-[#8a7346]">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="overflow-hidden rounded-xl border border-[#f1dfb7] bg-white">
          {loading ? (
            <div className="p-5 text-sm text-[#6e5c39]">Loading items...</div>
          ) : errorMessage ? (
            <div className="flex items-center justify-between gap-3 p-5">
              <p className="text-sm text-[#9a2b2b]">{errorMessage}</p>
              {onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length ? (
                    items.map((item, index) => (
                      <TableRow key={`${item.name}-${index}`}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.price}</TableCell>
                        <TableCell className="text-right">{item.total}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-[#7d6f54]">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end border-t border-[#f1dfb7] px-5 py-4">
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a98a47]">{totalLabel}</div>
                  <div className="mt-1 text-sm font-semibold text-[#2f2a21]">{totalValue}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
