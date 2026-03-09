"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DateFilter } from "@/components/dashboard/date-filter";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { RowDetailsDialog } from "@/components/dashboard/row-details-dialog";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getRevenueAnalysis,
  getTopSoldItems,
  getTypeOfPayment,
  type RevenueAnalysisItem,
} from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

function buildConicStops(items: { value: number; color: string }[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return items.reduce<{ start: number; end: number; color: string }[]>((acc, item) => {
    const start = acc.length ? acc[acc.length - 1].end : 0;
    const end = start + (total ? (item.value / total) * 100 : 0);
    acc.push({ start, end, color: item.color });
    return acc;
  }, []);
}

function AnalyticCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <Skeleton className="h-44 w-44 rounded-full" />
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticPage() {
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("last7Days"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<RevenueAnalysisItem | null>(null);

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);
  const referenceDate = queryParams.to || queryParams.from || undefined;
  const referenceYear = referenceDate ? new Date(referenceDate).getFullYear() : undefined;

  const paymentQuery = useQuery({
    queryKey: ["dashboard", "type-of-payment", queryParams],
    queryFn: () => getTypeOfPayment(queryParams),
  });

  const revenueAnalysisQuery = useQuery({
    queryKey: ["dashboard", "revenue-analysis", referenceYear],
    queryFn: () => getRevenueAnalysis(referenceYear ? { year: referenceYear } : undefined),
  });

  const topSoldQuery = useQuery({
    queryKey: ["dashboard", "top-sold-items", queryParams],
    queryFn: () => getTopSoldItems({ ...queryParams, limit: 10 }),
  });

  React.useEffect(() => {
    const firstError = paymentQuery.error || revenueAnalysisQuery.error || topSoldQuery.error;
    if (firstError) {
      toast.error(getErrorMessage(firstError, "Failed to load analytics"));
    }
  }, [paymentQuery.error, revenueAnalysisQuery.error, topSoldQuery.error]);

  const paymentItems = paymentQuery.data?.data || [];
  const revenueRows = revenueAnalysisQuery.data?.data || [];
  const topSoldRows = topSoldQuery.data?.data || [];

  const paymentStops = buildConicStops(
    paymentItems.map((item, index) => ({
      value: item.totalAmount,
      color: ["#c18b1f", "#d9a441", "#f1c66b", "#ab7a1a", "#e8b85c"][index % 5],
    }))
  );
  const topSoldStops = buildConicStops(
    topSoldRows.map((item, index) => ({
      value: item.totalAmount,
      color: ["#e28a00", "#f3c774", "#cfa344", "#a86f00", "#ecc16d"][index % 5],
    }))
  );
  const topSoldGrand = topSoldRows.reduce((sum, row) => sum + row.totalAmount, 0);

  const maxRevenue = Math.max(
    1,
    ...revenueRows.flatMap((item) => [item.thisYearTotal || 0, item.lastYearTotal || 0])
  );

  const {
    page: revenuePage,
    setPage: setRevenuePage,
    totalPages: revenueTotalPages,
    totalItems: revenueTotalItems,
    items: pagedRevenueRows,
  } = usePagination(revenueRows, 6);

  React.useEffect(() => {
    setRevenuePage(1);
  }, [referenceYear, setRevenuePage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytic"
        description="Explore organized analytics data. View data in clear lists. Get useful insights"
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

      <div className="grid gap-6 lg:grid-cols-2">
        {paymentQuery.isLoading ? (
          <AnalyticCardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Type of Payment</CardTitle>
              <p className="text-sm text-[#7b6a48]">See the type of payment.</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{
                  background: `conic-gradient(${paymentStops
                    .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
                    .join(", ")})`,
                }}
              >
                <div className="absolute inset-10 rounded-full bg-white" />
              </div>
              <div className="w-full space-y-2">
                {paymentItems.map((item, index) => (
                  <div key={`${item.paymentType}-${index}`} className="flex items-center justify-between gap-3 text-sm text-[#4c4231]">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: ["#c18b1f", "#d9a441", "#f1c66b", "#ab7a1a", "#e8b85c"][index % 5] }}
                      />
                      {item.paymentType}
                    </span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {topSoldQuery.isLoading ? (
          <AnalyticCardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top Sold Items (Top 10)</CardTitle>
              <p className="text-sm text-[#7b6a48]">Top sold items split in pie chart.</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{
                  background: `conic-gradient(${topSoldStops
                    .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
                    .join(", ")})`,
                }}
              >
                <div className="absolute inset-10 rounded-full bg-white" />
              </div>
              <div className="w-full space-y-2">
                {topSoldRows.map((item, index) => {
                  const percent = topSoldGrand ? Number(((item.totalAmount * 100) / topSoldGrand).toFixed(2)) : 0;
                  return (
                    <div key={`${item.articleId}-${item.rank}`} className="flex items-center justify-between gap-3 text-sm text-[#4c4231]">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: ["#e28a00", "#f3c774", "#cfa344", "#a86f00", "#ecc16d"][index % 5] }}
                        />
                        {item.itemName}
                      </span>
                      <span>{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
            <p className="text-sm text-[#7b6a48]">Monthly comparison with years included.</p>
          </CardHeader>
          <CardContent>
            {revenueAnalysisQuery.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                  {revenueRows.map((item) => (
                    <div key={item.monthNumber} className="flex flex-col items-center gap-2">
                      <div className="flex items-end gap-1">
                        <div
                          className="w-2 rounded-sm bg-[#f4d58a]"
                          style={{ height: `${((item.lastYearTotal || 0) / maxRevenue) * 140}px` }}
                        />
                        <div
                          className="w-2 rounded-sm bg-[#c18b1f]"
                          style={{ height: `${((item.thisYearTotal || 0) / maxRevenue) * 140}px` }}
                        />
                      </div>
                      <div className="text-center text-[10px] text-[#7b6a48]">{item.monthPairLabel}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#7b6a48]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#f4d58a]" />
                    Last year
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#c18b1f]" />
                    This year
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Revenue Comparison Table</CardTitle>
            <p className="text-sm text-[#7b6a48]">Month by month: last year vs this year with differences.</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {revenueAnalysisQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Last Year</TableHead>
                      <TableHead className="text-right">This Year</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRevenueRows.map((item) => {
                      const hasGrowth = item.differenceAmount >= 0;
                      return (
                        <TableRow
                          key={item.monthNumber}
                          className="cursor-pointer"
                          onClick={() => setSelectedRow(item)}
                        >
                          <TableCell>{item.monthComparisonLabel}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.lastYearTotal)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.thisYearTotal)}</TableCell>
                          <TableCell className={`text-right ${hasGrowth ? "text-[#128a3a]" : "text-[#b33a2f]"}`}>
                            {`${hasGrowth ? "+" : ""}${formatCurrency(item.differenceAmount)} (${item.differencePercent}%)`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <PaginationBar
                    page={revenuePage}
                    totalPages={revenueTotalPages}
                    totalItems={revenueTotalItems}
                    itemsPerPage={6}
                    onPageChange={setRevenuePage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Export"
        subtitle="Analytic dashboard"
        reportPath="/api/analytics/analytic-dashboard/export"
        params={{
          ...queryParams,
          limit: 10,
          year: referenceYear,
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedRow)}
        onOpenChange={(open) => {
          if (!open) setSelectedRow(null);
        }}
        title={selectedRow?.monthComparisonLabel || "Revenue comparison details"}
        description="Selected revenue comparison details"
        details={
          selectedRow
            ? [
                { label: "Comparison", value: selectedRow.monthComparisonLabel },
                { label: `${selectedRow.lastYear} total`, value: formatCurrency(selectedRow.lastYearTotal) },
                { label: `${selectedRow.thisYear} total`, value: formatCurrency(selectedRow.thisYearTotal) },
                { label: "Difference", value: formatCurrency(selectedRow.differenceAmount) },
                { label: "Difference %", value: `${selectedRow.differencePercent}%` },
              ]
            : []
        }
      />
    </div>
  );
}
