import React, { useEffect, useState } from "react";
import axios from "axios";

import Badge from "../../components/ui/badge/Badge";
import { ArrowUpIcon, ArrowDownIcon, GroupIcon, BoxIconLine } from "../../icons";

/* ---------------- Import ORDER charts ---------------- */
import {
  RevenueByMonth,
  OrdersTrend,
  AvgOrderValueChart,
  TopProductsChart,
  TopCustomersChart,
  RevenueByState,
  PaymentTypeChart,
  PaymentStatusChart
} from "../../components/charts/OrdersCharts/OrderAnalyticsCharts";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

/* ---------------- TYPES ---------------- */
type Summary = {
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  avgOrderValue: number;
  repeatCustomerRate: number;
};

type OrderAnalytics = {
  summary: Summary;
  revenueByMonth: any[];
  topCustomers: any[];
  productRevenue: any[];
  revenueByState: any[];
  paymentType: any[];
  paymentStatus: any[];
};

/* ----------------------------------------------------- */

export default function OrdersDashboard() {
  const [data, setData] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_API_URL}/orders/analytics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("Order Analytics Response ->", res.data);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load Order Analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = data?.summary;

  /* =====================================================
     ▪▪▪ Loading Skeleton (Same UI as Billing Dashboard) ▪▪▪
  ====================================================== */
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 pb-10 pt-2 space-y-8">
        <div className="flex justify-between border-b pb-4">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[170px] rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[280px] rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /* =====================================================
     ▪▪▪ REAL DASHBOARD UI ▪▪▪
  ====================================================== */
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-2 lg:px-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order Analytics</h1>
          <p className="text-sm text-slate-500">Sales, customer behaviour & performance tracking.</p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg border text-sm shadow hover:bg-slate-100 transition"
        >
          ⟳ Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      {/* ─── Summary Cards ───────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <MetricCard
            icon={<GroupIcon className="size-6" />}
            title="Total Orders"
            value={summary.totalOrders}
            badge={<Badge color="success"><ArrowUpIcon /> +{summary.monthlyOrders} this month</Badge>}
          />

          <MetricCard
            icon={<span className="text-lg font-bold text-green-600">₹</span>}
            title="Total Revenue"
            value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
            badge={<Badge color="success"><ArrowUpIcon /> Revenue Growth</Badge>}
          />

          <MetricCard
            icon={<span className="text-lg font-bold text-indigo-500">Σ</span>}
            title="Avg Order Value"
            value={`₹${summary.avgOrderValue}`}
            badge={<Badge color="success">Good AOV</Badge>}
          />

          <MetricCard
            icon={<BoxIconLine className="size-6" />}
            title="Repeat Customer Rate"
            value={`${summary.repeatCustomerRate}%`}
            badge={<Badge color="success">Customer Retention</Badge>}
          />
        </div>
      )}

      {/* ─── Charts ───────────────────────────────────── */}
      {data && (
        <div className="grid gap-6">

          <GlassCard title="Monthly Performance" subtitle="Revenue & order trends">
            <div className="grid md:grid-cols-2 gap-5">
              <RevenueByMonth data={data.revenueByMonth} />
              <OrdersTrend data={data.revenueByMonth} />
            </div>
            <AvgOrderValueChart data={data.revenueByMonth} />
          </GlassCard>

          <GlassCard title="Top Performing Products">
            <TopProductsChart data={data.productRevenue} />
          </GlassCard>

          <GlassCard title="Top Customers">
            <TopCustomersChart data={data.topCustomers} />
          </GlassCard>

          <GlassCard title="Payment Insights">
            <div className="grid md:grid-cols-3 gap-5">
              <PaymentTypeChart data={data.paymentType} />
              <PaymentStatusChart data={data.paymentStatus} />
              <RevenueByState data={data.revenueByState} />
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   UI COMPONENTS
===================================================== */
type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  badge?: React.ReactNode;
};

function MetricCard({ icon, title, value, badge }: MetricCardProps) {
  return (
    <div className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-100 bg-white px-6 py-5 text-left shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
          {icon}
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      <div className="mt-4 flex-col items-center  gap-6">
        <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
          {value}
        </div>

        {badge && <div className=" text-[10px] ">{badge}</div>}
      </div>
    </div>
  );
}

type GlassCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

function GlassCard({ title, subtitle, children }: GlassCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

