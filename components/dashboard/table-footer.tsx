"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/dashboard/pagination-bar";

interface TableFooterProps {
  search: string;
  onSearchChange: (value: string) => void;
  totalLabel: string;
  totalValue: string;
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function TableFooter({
  search,
  onSearchChange,
  totalLabel,
  totalValue,
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: TableFooterProps) {
  return (
    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full max-w-none items-center sm:max-w-sm">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3916b]" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            className="h-11 rounded-l-md rounded-r-none pl-10"
          />
        </div>
        <Button variant="gold" size="icon" className="h-11 w-12 rounded-l-none">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm">
        <div className="font-semibold text-[#2f2a21]">{totalLabel}</div>
        <div className="text-[#22c55e]">{totalValue}</div>
      </div>
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        className="w-full md:ml-auto md:w-auto"
      />
    </div>
  );
}
