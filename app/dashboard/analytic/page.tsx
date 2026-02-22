"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  paymentBreakdown,
  timePeriodBreakdown,
  revenueAnalysis,
  topSoldItems,
} from "@/data/dashboard";

const timeOptions = ["This month", "Last month", "Custom"];

export default function AnalyticPage() {
  const [timeFilter, setTimeFilter] = React.useState(timeOptions[0]);
  const {
    page: topPage,
    setPage: setTopPage,
    totalPages: topTotalPages,
    totalItems: topTotalItems,
    items: topItems,
  } = usePagination(topSoldItems, 6);

  const paymentTotal = paymentBreakdown.reduce((sum, item) => sum + item.value, 0);
  const paymentStops = paymentBreakdown.reduce<{ start: number; end: number; color: string }[]>(
    (acc, item) => {
      const start = acc.length ? acc[acc.length - 1].end : 0;
      const end = start + (item.value / paymentTotal) * 100;
      acc.push({ start, end, color: item.color });
      return acc;
    },
    []
  );

  const timeStops = timePeriodBreakdown.reduce<{ start: number; end: number; color: string }[]>(
    (acc, item) => {
      const start = acc.length ? acc[acc.length - 1].end : 0;
      const end = start + item.value;
      acc.push({ start, end, color: item.color });
      return acc;
    },
    []
  );

  const maxRevenue = Math.max(...revenueAnalysis.map((item) => item.thisYear));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytic"
        description="Explore organized analytics data. View data in clear lists. Get useful insights"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Type of Payment</CardTitle>
              <p className="text-sm text-[#7b6a48]">See the Type of Payment.</p>
            </div>
            <Select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)}>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
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
              <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold text-white">
                <span>Cash</span>
              </div>
            </div>
            <div className="space-y-2">
              {paymentBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-[#4c4231]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Time Periods</CardTitle>
              <p className="text-sm text-[#7b6a48]">See Time Periods.</p>
            </div>
            <Select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)}>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div
              className="relative h-44 w-44 rounded-full"
              style={{
                background: `conic-gradient(${timeStops
                  .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
                  .join(", ")})`,
              }}
            >
              <div className="absolute inset-10 rounded-full bg-white" />
            </div>
            <div className="space-y-2">
              {timePeriodBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-[#4c4231]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Revenue Analysis</CardTitle>
              <p className="text-sm text-[#7b6a48]">See the Revenue</p>
            </div>
            <Select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)}>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 items-end gap-2">
              {revenueAnalysis.map((item) => (
                <div key={item.month} className="flex flex-col items-center gap-2">
                  <div
                    className="w-6 rounded-md bg-gradient-to-b from-[#f4d58a] via-[#d6a54a] to-[#b57a1a]"
                    style={{ height: `${(item.thisYear / maxRevenue) * 180}px` }}
                  />
                  <div className="text-[10px] text-[#7b6a48]">
                    {item.month.slice(0, 3)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-6 text-xs text-[#7b6a48]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#f4d58a]" />
                February 2025
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#d6a54a]" />
                February 2026
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Top 10 most sold items</CardTitle>
            <p className="text-sm text-[#7b6a48]">See Top 10 most sold items</p>
          </CardHeader>
          <CardContent className="flex-1 max-h-[340px] overflow-y-auto pr-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Last Years</TableHead>
                  <TableHead>This Years</TableHead>
                  <TableHead>Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.map((item) => (
                  <TableRow key={item.month}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.lastYear}</TableCell>
                    <TableCell>{item.thisYear}</TableCell>
                    <TableCell className={item.difference > 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
                      {item.difference > 0 ? "+" : ""}
                      {item.difference}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <PaginationBar
                page={topPage}
                totalPages={topTotalPages}
                totalItems={topTotalItems}
                itemsPerPage={6}
                onPageChange={setTopPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
