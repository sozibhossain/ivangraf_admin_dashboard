"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const getVisiblePages = (page: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  pages.add(page);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);
  return Array.from(pages).sort((a, b) => a - b);
};

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationBarProps) {
  const start = Math.min(totalItems, (page - 1) * itemsPerPage + 1);
  const end = Math.min(totalItems, page * itemsPerPage);
  const pages = getVisiblePages(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 text-sm text-[#6f6146] sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div>
        Showing {start} to {end} of {totalItems} results
      </div>
      <Pagination className="w-full sm:mx-0 sm:w-auto sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationPrevious>
          </PaginationItem>
          {pages.map((pageNumber, index) => {
            const previous = pages[index - 1];
            const showEllipsis = previous && pageNumber - previous > 1;
            return (
              <React.Fragment key={pageNumber}>
                {showEllipsis ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null}
                <PaginationItem>
                  <PaginationLink
                    isActive={pageNumber === page}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              </React.Fragment>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
