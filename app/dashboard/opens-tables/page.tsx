"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DateFilter } from "@/components/dashboard/date-filter";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { ItemsDetailsDialog } from "@/components/dashboard/items-details-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpenTableItems, getOpenTables, type OpenTableItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function OpensTablesPage() {
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("all"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [detailExportOpen, setDetailExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<OpenTableItem | null>(null);

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);

  const openTablesQuery = useQuery({
    queryKey: ["dashboard", "open-tables", queryParams],
    queryFn: () => getOpenTables(queryParams),
  });

  const selectedTableId = selectedItem?.status === "Occupied" ? selectedItem.tableId : undefined;
  const openTableItemsQuery = useQuery({
    queryKey: ["dashboard", "open-table-items", selectedTableId],
    queryFn: () => getOpenTableItems(String(selectedTableId)),
    enabled: Boolean(selectedTableId),
  });

  React.useEffect(() => {
    if (!openTablesQuery.error) return;
    toast.error(getErrorMessage(openTablesQuery.error, "Failed to load open tables"));
  }, [openTablesQuery.error]);

  React.useEffect(() => {
    if (!openTableItemsQuery.error) return;
    toast.error(getErrorMessage(openTableItemsQuery.error, "Failed to load table items"));
  }, [openTableItemsQuery.error]);

  const rows = React.useMemo(() => openTablesQuery.data?.data || [], [openTablesQuery.data?.data]);
  const occupiedCount = React.useMemo(
    () => rows.filter((item) => item.status === "Occupied").length,
    [rows]
  );
  const { page, setPage, totalPages, totalItems, items } = usePagination(rows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [dateFilter, setPage]);

  const detailData = openTableItemsQuery.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opens Tables"
        description="Track current table occupancy and waiter assignment."
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
        {openTablesQuery.isLoading ? (
          <TableSkeleton headers={["Table", "Sector", "Waiter", "Status"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.tableId} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.tableName}</TableCell>
                  <TableCell>{item.sectorName || "-"}</TableCell>
                  <TableCell>{item.waiterName || "-"}</TableCell>
                  <TableCell className={item.status === "Occupied" ? "text-[#d97706]" : "text-[#22c55e]"}>
                    {item.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          showSearch={false}
          totalLabel="Occupied tables"
          totalValue={formatNumber(occupiedCount, 0)}
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
        subtitle="Open tables"
        reportPath="/api/analytics/open-tables/export"
        params={queryParams}
      />

      <ItemsDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
            setDetailExportOpen(false);
          }
        }}
        title={detailData?.tableName || selectedItem?.tableName || "Table details"}
        description={
          selectedItem?.status === "Occupied"
            ? "Occupied table item details"
            : "This table is currently available."
        }
        details={
          selectedItem
            ? [
                { label: "Table ID", value: detailData?.tableId || selectedItem.tableId },
                { label: "Table", value: detailData?.tableName || selectedItem.tableName },
                { label: "Waiter", value: detailData?.waiter || selectedItem.waiterName || "-" },
                { label: "Status", value: selectedItem.status },
                { label: "Updated", value: formatDate(selectedItem.updatedAt) },
              ]
            : []
        }
        items={(detailData?.items || []).map((item) => ({
          name: item.name,
          quantity: item.qty,
          price: formatCurrency(item.price),
          total: formatCurrency(item.total),
        }))}
        totalLabel="Table total"
        totalValue={formatCurrency(detailData?.tableTotal || 0)}
        loading={Boolean(selectedTableId) && openTableItemsQuery.isLoading}
        errorMessage={selectedTableId && openTableItemsQuery.error ? getErrorMessage(openTableItemsQuery.error) : null}
        onRetry={() => {
          void openTableItemsQuery.refetch();
        }}
        onExport={selectedTableId ? () => setDetailExportOpen(true) : undefined}
      />

      {selectedTableId ? (
        <ExportDialog
          open={detailExportOpen}
          onOpenChange={setDetailExportOpen}
          title="Export"
          subtitle="Open table item details"
          reportPath={`/api/open-tables/${encodeURIComponent(selectedTableId)}/items/export`}
        />
      ) : null}
    </div>
  );
}
