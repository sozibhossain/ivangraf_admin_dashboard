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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCancelOrderItems, getCancelOrders, type CancelOrderItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatSummaryValue } from "@/lib/summary";

const ITEMS_PER_PAGE = 12;

export default function CancelOrdersPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("last7Days"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [detailExportOpen, setDetailExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<CancelOrderItem | null>(null);
  const deferredSearch = React.useDeferredValue(search);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      search: deferredSearch || undefined,
      ...buildDateFilterParams(dateFilter),
    }),
    [page, deferredSearch, dateFilter]
  );

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, dateFilter]);

  const cancelOrdersQuery = useQuery({
    queryKey: ["lists", "cancel-orders", queryParams],
    queryFn: () => getCancelOrders(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const selectedInvoiceId = selectedItem?.id;
  const cancelOrderItemsQuery = useQuery({
    queryKey: ["lists", "cancel-order-items", selectedInvoiceId],
    queryFn: () => getCancelOrderItems(String(selectedInvoiceId)),
    enabled: Boolean(selectedInvoiceId),
  });

  React.useEffect(() => {
    if (!cancelOrdersQuery.error) return;
    toast.error(getErrorMessage(cancelOrdersQuery.error, "Failed to load cancel orders"));
  }, [cancelOrdersQuery.error]);

  React.useEffect(() => {
    if (!cancelOrderItemsQuery.error) return;
    toast.error(getErrorMessage(cancelOrderItemsQuery.error, "Failed to load cancel order items"));
  }, [cancelOrderItemsQuery.error]);

  const rows = cancelOrdersQuery.data?.data || [];
  const totalItems = cancelOrdersQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const summary = cancelOrdersQuery.data?.meta?.summary;
  const detailData = cancelOrderItemsQuery.data?.data;

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancel Orders"
        description="Review cancelled orders and cancellation values."
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
        {cancelOrdersQuery.isLoading ? (
          <TableSkeleton headers={["Order", "Time", "Waiter", "Amount"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.orderNumber}</TableCell>
                  <TableCell>{formatDate(item.time)}</TableCell>
                  <TableCell>{item.waiter || "-"}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
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
        subtitle="Cancel orders"
        reportPath="/api/lists/cancel-orders/export"
        params={{
          search: deferredSearch || undefined,
          ...buildDateFilterParams(dateFilter),
        }}
      />

      <ItemsDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
            setDetailExportOpen(false);
          }
        }}
        title={detailData?.invoiceNumberFormatted || selectedItem?.orderNumber || "Cancel order details"}
        description="Cancelled order item details"
        details={
          selectedItem
            ? [
                { label: "Order ID", value: detailData?.invoiceId || selectedItem.id },
                {
                  label: "Order Number",
                  value: detailData?.invoiceNumberFormatted || selectedItem.orderNumber,
                },
                { label: "Table", value: detailData?.tableName || "-" },
                { label: "Waiter", value: detailData?.waiter || selectedItem.waiter || "-" },
                { label: "Time", value: formatDate(detailData?.dateCreated || selectedItem.time) },
              ]
            : []
        }
        items={(detailData?.items || []).map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: formatCurrency(item.price),
          total: formatCurrency(item.total),
        }))}
        totalLabel="Cancelled total"
        totalValue={formatCurrency(detailData?.cancelledTotal || 0)}
        loading={cancelOrderItemsQuery.isLoading}
        errorMessage={cancelOrderItemsQuery.error ? getErrorMessage(cancelOrderItemsQuery.error) : null}
        onRetry={() => {
          void cancelOrderItemsQuery.refetch();
        }}
        onExport={selectedInvoiceId ? () => setDetailExportOpen(true) : undefined}
      />

      {selectedInvoiceId ? (
        <ExportDialog
          open={detailExportOpen}
          onOpenChange={setDetailExportOpen}
          title="Export"
          subtitle="Cancel order item details"
          reportPath={`/api/cancel-orders/${encodeURIComponent(selectedInvoiceId)}/items/export`}
        />
      ) : null}
    </div>
  );
}
