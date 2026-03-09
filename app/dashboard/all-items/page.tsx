"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DateFilter } from "@/components/dashboard/date-filter";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { RowDetailsDialog } from "@/components/dashboard/row-details-dialog";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllItems, type AllItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatSummaryValue } from "@/lib/summary";

const ITEMS_PER_PAGE = 12;

export default function AllItemsPage() {
  const [page, setPage] = React.useState(1);
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("all"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<AllItem | null>(null);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      ...buildDateFilterParams(dateFilter),
    }),
    [page, dateFilter]
  );

  React.useEffect(() => {
    setPage(1);
  }, [dateFilter]);

  const itemsQuery = useQuery({
    queryKey: ["lists", "all-items", queryParams],
    queryFn: () => getAllItems(queryParams),
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!itemsQuery.error) return;
    toast.error(getErrorMessage(itemsQuery.error, "Failed to load all items"));
  }, [itemsQuery.error]);

  const rows = itemsQuery.data?.data || [];
  const totalItems = itemsQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const summary = itemsQuery.data?.meta?.summary;

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="List of All Items"
        description="See items and articles. Check details in clear lists and stay organized."
        actions={
          <>
            <DateFilter value={dateFilter} onChange={setDateFilter} />
            <Button variant="soft" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <Card className="p-4">
        {itemsQuery.isLoading ? (
          <TableSkeleton headers={["Name of Items", "Tax Group", "Price"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Items</TableHead>
                <TableHead>Tax Group</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.taxGroup || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          showSearch={false}
          totalLabel={summary?.label || "Total"}
          totalValue={formatSummaryValue(summary, totalItems)}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Export"
        subtitle="List of all items"
        reportPath="/api/lists/items/export"
        params={buildDateFilterParams(dateFilter)}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.name || "Item details"}
        description="Selected item details"
        details={
          selectedItem
            ? [
                { label: "Item ID", value: selectedItem.id },
                { label: "Name", value: selectedItem.name },
                { label: "Tax Group", value: selectedItem.taxGroup || "-" },
                { label: "Price", value: formatCurrency(selectedItem.price) },
                { label: "Updated", value: formatDate(selectedItem.updatedAt) },
              ]
            : []
        }
      />
    </div>
  );
}
