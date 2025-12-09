import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

type StatusFilter = "all" | "created" | "active" | "past_due" | "expired" | "cancelled";

type SubscriptionRow = {
  subscriptionId: string;
  customerName: string;
  email: string;
  planAmount: number;
  currency: string;
  status: string;
  nextChargeDate: string;
  remainingLabel: string;
  remainingDays: number;
};

export default function SubscriptionTable() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const subscriptionsPerPage = 10;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    axios
      .get(`${BASE_API_URL}/user/getSubscription`)
      .then((res) => {
        const list = res.data?.message || [];

        const mapped: SubscriptionRow[] = list.map((sub: any) => {
          const name =
            sub.userName ||
            sub.userDetails?.name ||
            sub.userDetails?.username ||
            "Unknown";

          const email =
            sub.userEmail || sub.userDetails?.email || "N/A";

          // planAmount from Razorpay is in paise; convert to rupees (safe fallback)
          const planAmountRupees =
            sub.planAmount && typeof sub.planAmount === "number"
              ? sub.planAmount / 100
              : 0;

          const nextChargeDate = sub.nextChargeAt
            ? new Date(sub.nextChargeAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—";

          const remainingLabel =
            sub.remainingDurationLabel ||
            (typeof sub.remainingDays === "number"
              ? `${sub.remainingDays} days`
              : "—");

          return {
            subscriptionId: sub.subscriptionId,
            customerName: name,
            email,
            planAmount: planAmountRupees,
            currency: sub.currency || "INR",
            status: sub.status || "created",
            nextChargeDate,
            remainingLabel,
            remainingDays: sub.remainingDays || 0,
          };
        });

        setSubscriptions(mapped);
      })
      .catch((err) => {
        console.error("Error fetching subscriptions:", err);
      });
  }, [BASE_API_URL]);

  // reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filtered = subscriptions.filter((sub) => {
    const searchLower = search.toLowerCase();

    const searchMatch =
      sub.customerName.toLowerCase().includes(searchLower) ||
      sub.email.toLowerCase().includes(searchLower) ||
      sub.subscriptionId.toLowerCase().includes(searchLower);

    const statusLower = sub.status?.toLowerCase();

    const statusMatch =
      statusFilter === "all" ||
      statusLower === statusFilter.toLowerCase();

    return searchMatch && statusMatch;
  });

  const indexOfLast = currentPage * subscriptionsPerPage;
  const indexOfFirst = indexOfLast - subscriptionsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / subscriptionsPerPage) || 1;

  const statusLabelMap: Record<StatusFilter, string> = {
    all: "All Status",
    created: "Created",
    active: "Active",
    past_due: "Past Due",
    expired: "Expired",
    cancelled: "Cancelled",
  };

  const getStatusClasses = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active")
      return {
        badge:
          "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]",
        dot: "bg-emerald-400",
      };
    if (s === "past_due")
      return {
        badge:
          "bg-amber-500/10 text-amber-400 ring-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]",
        dot: "bg-amber-400",
      };
    if (s === "expired" || s === "cancelled")
      return {
        badge:
          "bg-rose-500/10 text-rose-400 ring-rose-500/40 shadow-[0_0_0_1px_rgba(248,113,113,0.35)]",
        dot: "bg-rose-400",
      };
    // created / default
    return {
      badge:
        "bg-slate-500/10 text-slate-300 ring-slate-500/40 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]",
      dot: "bg-slate-400",
    };
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glows */}
      <div
        className="
          pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl
          bg-gradient-to-br
          from-[#4E9CF2]/25 via-[#6FC5FF]/20 to-transparent
          dark:from-blue-600/30 dark:via-cyan-500/30 dark:to-transparent
        "
      />
      <div
        className="
          pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full blur-3xl
          bg-gradient-to-tr
          from-black/20 via-black/10 to-transparent
          dark:from-violet-500/25 dark:via-purple-500/25 dark:to-transparent
        "
      />

      <div className="relative">
        {/* Header with Search + Status Filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Subscriptions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitor all recurring subscriptions with status and next charge.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search by subscription ID, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsStatusDropdownOpen((prev) => !prev)
                }
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 focus:ring-2 focus:ring-indigo-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/90"
              >
                <span>{statusLabelMap[statusFilter]}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isStatusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <Dropdown
                isOpen={isStatusDropdownOpen}
                onClose={() => setIsStatusDropdownOpen(false)}
                className="w-44"
              >
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("all");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  All Status
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("created");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Created
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("active");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Active
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("past_due");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Past Due
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("expired");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Expired
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("cancelled");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Cancelled
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Subscription ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Plan Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Next Charge
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Remaining
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {current.length > 0 ? (
                current.map((sub) => {
                  const classes = getStatusClasses(sub.status);
                  return (
                    <TableRow
                      key={sub.subscriptionId}
                      className="group border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)]"
                    >
                      <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                        <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-mono tracking-tight dark:bg-slate-100/5">
                          {sub.subscriptionId}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-sm text-slate-900 dark:text-slate-50">
                        {sub.customerName}
                      </TableCell>

                      <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                        <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                          {sub.email}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-center text-sm text-slate-800 dark:text-slate-200">
                        ₹{sub.planAmount.toFixed(2)}{" "}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {sub.currency}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${classes.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${classes.dot}`}
                          />
                          {sub.status}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {sub.nextChargeDate}
                      </TableCell>

                      <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {sub.remainingLabel}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="border-0">
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No subscriptions found. Try adjusting your filters or
                    search.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {Array.isArray(filtered) && filtered.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                {currentPage}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                of {totalPages} pages
              </span>
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              windowSize={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}
