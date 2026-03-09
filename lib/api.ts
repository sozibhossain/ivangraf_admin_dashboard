import type { AxiosResponse } from "axios";

import { apiClient, publicApiClient } from "@/lib/axios";

export interface ApiEnvelope<T, M = Record<string, unknown>> {
  success: boolean;
  message: string;
  data: T;
  meta?: M;
}

export interface Connection {
  id: string;
  host: string;
  port: number;
  database: string;
  username: string;
  encrypt: boolean;
  label: string;
  lastSyncAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  period?: string | null;
  from?: string;
  to?: string;
  dateField?: string;
  summary?: DatasetSummary;
}

export interface DatasetSummary {
  type: "amount" | "price" | "quantity" | "count";
  label: string;
  value: number;
  count: number;
  totalQuantity?: number;
}

export interface ReportMeta {
  period?: string | null;
  from?: string;
  to?: string;
  dateField?: string;
  summary?: DatasetSummary;
  [key: string]: unknown;
}

export interface PaymentBreakdownItem {
  paymentTypeId: string | null;
  paymentType: string;
  totalAmount: number;
  totalCount: number;
  percent: number;
}

export interface TimePeriodItem {
  key: string;
  label: string;
  total: number;
  percent: number;
}

export interface RevenueAnalysisItem {
  monthNumber: number;
  monthName: string;
  monthComparisonLabel: string;
  monthPairLabel: string;
  lastYear: number;
  lastYearTotal: number;
  thisYear: number;
  thisYearTotal: number;
  differenceAmount: number;
  differencePercent: number;
}

export interface TopSoldItem {
  rank: number;
  articleId: string | null;
  itemName: string;
  totalQty: number;
  totalAmount: number;
}

export interface SalesItem {
  articleId: string | null;
  itemName: string;
  quantity: number;
  total: number;
  percentOfAllItems: number;
}

export interface SpendGoodItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  latestPrice?: number;
  updatedAt?: string;
}

export interface AllItem {
  id: string;
  name: string;
  price: number;
  taxGroup: string | null;
  updatedAt?: string;
}

export interface RevenueByPaymentItem {
  paymentTypeId: string | null;
  paymentTypeName: string;
  total: number;
  percent: number;
}

export interface RevenueTaxGroupItem {
  taxGroup: string;
  total: number;
  taxAmount: number;
}

export interface RevenueWaiterItem {
  waiterId: string | null;
  waiterName: string;
  total: number;
  percentOfAllWaiters: number;
}

export interface OpenTableItem {
  tableId: string;
  tableName: string;
  sectorName: string | null;
  waiterName: string | null;
  status: string;
  updatedAt?: string;
}

export interface OpenTableItemDetailsRow {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface OpenTableDetails {
  tableId: string;
  tableName: string;
  waiter: string | null;
  items: OpenTableItemDetailsRow[];
  tableTotal: number;
}

export interface InvoiceItemDetailsRow {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BillDetails {
  invoiceId: string;
  invoiceNumberFormatted: string;
  tableName: string;
  waiter: string | null;
  items: InvoiceItemDetailsRow[];
  invoiceTotal: number;
}

export interface CancelOrderDetails {
  invoiceId: string;
  invoiceNumberFormatted: string;
  tableName: string;
  waiter: string | null;
  dateCreated: string | null;
  items: InvoiceItemDetailsRow[];
  cancelledTotal: number;
}

export interface StockGoodItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  latestPrice?: number;
  updatedAt?: string;
}

export interface BillItem {
  id: string;
  invoiceNumber: string;
  timeOfBill: string;
  waiter: string | null;
  paymentType: string | null;
  total: number;
}

export interface CancelOrderItem {
  id: string;
  orderNumber: string;
  time: string;
  waiter: string | null;
  amount: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    favoriteSidebarItems?: string[];
  };
}

export interface UserPreferences {
  favoriteSidebarItems: string[];
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  period?: DatePeriod;
  from?: string;
  to?: string;
}

export type DatePeriod =
  | "all"
  | "today"
  | "yesterday"
  | "last7Days"
  | "custom"
  | "thisMonth"
  | "thisYear"
  | "lastYear";

export interface PeriodParams {
  period?: DatePeriod;
  from?: string;
  to?: string;
}

export type ExportFormat = "pdf" | "csv" | "json";

async function unwrap<T, M = Record<string, unknown>>(
  request: Promise<AxiosResponse<ApiEnvelope<T, M>>>
): Promise<ApiEnvelope<T, M>> {
  const response = await request;
  return response.data;
}

export async function postLogin(payload: LoginPayload) {
  return unwrap<LoginResponse>(publicApiClient.post("/api/auth/login", payload));
}

export async function getMyConnections() {
  return unwrap<Connection[]>(apiClient.get("/api/connections"));
}

export async function getUserPreferences() {
  return unwrap<UserPreferences>(apiClient.get("/api/auth/preferences"));
}

export async function updateUserPreferences(payload: UserPreferences) {
  return unwrap<UserPreferences>(apiClient.patch("/api/auth/preferences", payload));
}

export async function runSyncNow() {
  return unwrap<{ synced: Record<string, number>; connection: Connection }>(
    apiClient.post("/api/sync/run")
  );
}

export async function getSyncStatus() {
  return unwrap<{
    hasConnection: boolean;
    totalConnections: number;
    connections: Connection[];
  }>(apiClient.get("/api/sync/status"));
}

export async function getTypeOfPayment(params?: PeriodParams) {
  return unwrap<PaymentBreakdownItem[], ReportMeta>(apiClient.get("/api/analytics/type-of-payment", { params }));
}

export async function getTimePeriods(params?: { referenceDate?: string }) {
  return unwrap<TimePeriodItem[], ReportMeta>(apiClient.get("/api/analytics/time-periods", { params }));
}

export async function getRevenueAnalysis(params?: { year?: number }) {
  return unwrap<RevenueAnalysisItem[], ReportMeta>(apiClient.get("/api/analytics/revenue-analysis", { params }));
}

export async function getTopSoldItems(params?: PeriodParams & { limit?: number }) {
  return unwrap<TopSoldItem[], ReportMeta>(apiClient.get("/api/analytics/top-sold-items", { params }));
}

export async function getSalesItems(params?: PeriodParams) {
  return unwrap<SalesItem[], ReportMeta>(apiClient.get("/api/analytics/sales-items", { params }));
}

export async function getRevenueByPayment(params?: PeriodParams) {
  return unwrap<RevenueByPaymentItem[], ReportMeta>(apiClient.get("/api/analytics/revenue-by-payment", { params }));
}

export async function getRevenueByTaxGroup(params?: PeriodParams) {
  return unwrap<RevenueTaxGroupItem[], ReportMeta>(apiClient.get("/api/analytics/revenue-by-tax-group", { params }));
}

export async function getRevenuePerWaiter(params?: PeriodParams) {
  return unwrap<RevenueWaiterItem[], ReportMeta>(apiClient.get("/api/analytics/revenue-waiter", { params }));
}

export async function getOpenTables(params?: PeriodParams) {
  return unwrap<OpenTableItem[], ReportMeta>(apiClient.get("/api/analytics/open-tables", { params }));
}

export async function getOpenTableItems(tableId: string) {
  return unwrap<OpenTableDetails, ReportMeta>(
    apiClient.get(`/api/open-tables/${encodeURIComponent(tableId)}/items`)
  );
}

export async function getAllItems(params?: ListParams) {
  return unwrap<AllItem[], PaginatedMeta>(apiClient.get("/api/lists/items", { params }));
}

export async function getSpendGoods(params?: ListParams) {
  return unwrap<SpendGoodItem[], PaginatedMeta>(apiClient.get("/api/lists/spend-goods", { params }));
}

export async function getStockGoods(params?: ListParams) {
  return unwrap<StockGoodItem[], PaginatedMeta>(apiClient.get("/api/lists/stock-goods", { params }));
}

export async function getBills(params?: ListParams) {
  return unwrap<BillItem[], PaginatedMeta>(apiClient.get("/api/lists/bills", { params }));
}

export async function getBillItems(invoiceId: string) {
  return unwrap<BillDetails, ReportMeta>(apiClient.get(`/api/bills/${encodeURIComponent(invoiceId)}/items`));
}

export async function getCancelOrders(params?: ListParams) {
  return unwrap<CancelOrderItem[], PaginatedMeta>(apiClient.get("/api/lists/cancel-orders", { params }));
}

export async function getCancelOrderItems(invoiceId: string) {
  return unwrap<CancelOrderDetails, ReportMeta>(
    apiClient.get(`/api/cancel-orders/${encodeURIComponent(invoiceId)}/items`)
  );
}

function parseFileName(disposition?: string) {
  if (!disposition) return null;
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  return match?.[1] || null;
}

export async function downloadReport(path: string, format: ExportFormat, params?: Record<string, unknown>) {
  const response = await apiClient.get<Blob>(path, {
    params: { ...params, format },
    responseType: "blob",
  });

  const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
  const fileName = parseFileName(response.headers["content-disposition"]) || `report.${format}`;
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
