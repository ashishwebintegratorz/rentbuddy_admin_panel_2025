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
import ModalWrapper from "../../layout/ModalWrapper";

export default function OrderTableOne() {
  const [orders, setOrders] = useState<
    {
      orderId: string;
      customerName: string;
      email: string;
      amount: number;
      status: string;
      paymentType: string;
      createdDate: string;
    }[]
  >([]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "cumulative" | "recurring"
  >("all");

  // dropdown open states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  // delete confirm modal state
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    axios
      .get(`${BASE_API_URL}/orders/getOrders`)
      .then((res) => {
        const fetched = res.data.data.map((order: any) => ({
          orderId: order.orderId,
          customerName: order.userId?.username || "Unknown",
          email: order.userId?.email || "N/A",
          amount: order.totalAmount,
          status: order.status || "Pending",
          paymentType: order.paymentType || "N/A",
          createdDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }));
        setOrders(fetched);
      })
      .catch((err) => console.error("Error fetching orders:", err));
  }, [BASE_API_URL]);

  // API call to delete
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await axios.delete(`${BASE_API_URL}/orders/${id}`);
      setOrders((prev) => prev.filter((order) => order.orderId !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, paymentFilter]);

  const filtered = orders.filter((order) => {
    const searchMatch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase()) ||
      order.orderId.toLowerCase().includes(search.toLowerCase());

    const status = order.status?.toLowerCase();
    const payment = order.paymentType?.toLowerCase();

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "completed" && status === "completed") ||
      (statusFilter === "pending" && status === "pending");

    const paymentMatch =
      paymentFilter === "all" ||
      (paymentFilter === "cumulative" && payment === "cumulative payment") ||
      (paymentFilter === "recurring" && payment === "recurring payment");

    return searchMatch && statusMatch && paymentMatch;
  });

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / ordersPerPage) || 1;

  const statusLabelMap: Record<string, string> = {
    all: "All Status",
    completed: "Completed",
    pending: "Pending",
  };

  const paymentLabelMap: Record<string, string> = {
    all: "All Payments",
    cumulative: "Cumulative Payment",
    recurring: "Recurring Payment",
  };

  // modal helpers
  const openConfirm = (id: string) => {
    setConfirmId(id);
  };

  const closeConfirm = () => {
    if (isDeleting) return;
    setConfirmId(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    await handleDelete(confirmId);
    closeConfirm();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow accents */}
      {/* TOP LEFT BLOB */}
      <div
        className="
    pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl
    bg-gradient-to-br
    from-[#F24E6C]/25 via-[#FF6F8C]/20 to-transparent
    dark:from-blue-600/30 dark:via-purple-600/30 dark:to-transparent
  "
      />
      <div
        className="
    pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full blur-3xl
    bg-gradient-to-tr
    from-black/20 via-black/10 to-transparent
    dark:from-emerald-500/25 dark:via-cyan-500/25 dark:to-transparent
  "
      />

      <div className="relative">
        {/* Header with Search + Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Orders
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track all orders, filter by status and payment type.
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
                placeholder="Search by order ID, name, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
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
                    setStatusFilter("completed");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Completed
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("pending");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Pending
                </DropdownItem>
              </Dropdown>
            </div>

            {/* Payment type filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 focus:ring-2 focus:ring-indigo-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/90"
              >
                <span>{paymentLabelMap[paymentFilter]}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isPaymentDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <Dropdown
                isOpen={isPaymentDropdownOpen}
                onClose={() => setIsPaymentDropdownOpen(false)}
                className="w-52"
              >
                <DropdownItem
                  onItemClick={() => {
                    setPaymentFilter("all");
                    setIsPaymentDropdownOpen(false);
                  }}
                >
                  All Payments
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setPaymentFilter("cumulative");
                    setIsPaymentDropdownOpen(false);
                  }}
                >
                  Cumulative Payment
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setPaymentFilter("recurring");
                    setIsPaymentDropdownOpen(false);
                  }}
                >
                  Recurring Payment
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
                  Order ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Payment Type
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-center font-semibold"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {current.length > 0 ? (
                current.map((order) => (
                  <TableRow
                    key={order.orderId}
                    className="group border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)]"
                  >
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-mono tracking-tight dark:bg-slate-100/5">
                        {order.orderId}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-900 dark:text-slate-50">
                      {order.customerName}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                        {order.email}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center text-sm text-slate-800 dark:text-slate-200">
                      ₹{order.amount}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${
                          order.status.toLowerCase() === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                            : order.status.toLowerCase() === "pending"
                            ? "bg-amber-500/10 text-amber-400 ring-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]"
                            : "bg-slate-500/10 text-slate-300 ring-slate-500/40 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            order.status.toLowerCase() === "completed"
                              ? "bg-emerald-400"
                              : order.status.toLowerCase() === "pending"
                              ? "bg-amber-400"
                              : "bg-slate-400"
                          }`}
                        />
                        {order.status}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-100/5 dark:text-slate-200">
                        {order.paymentType}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {order.createdDate}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <button
                        onClick={() => openConfirm(order.orderId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-rose-500 hover:shadow-[0_10px_25px_rgba(248,113,113,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="text-xs">Delete</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No orders found. Try adjusting your filters or search.
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

        {/* Delete confirm modal */}
        <ModalWrapper isOpen={!!confirmId} onClose={closeConfirm}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Delete order?
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This action cannot be undone. Are you sure you want to permanently
            delete this order?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeConfirm}
              disabled={isDeleting}
              className="rounded-lg border border-slate-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              No, keep
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-lg bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(248,113,113,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </ModalWrapper>
      </div>
    </div>
  );
}
