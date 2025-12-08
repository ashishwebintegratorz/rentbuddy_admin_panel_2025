import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import ModalWrapper from "../../layout/ModalWrapper";
import Avatar from "../ui/avatar/Avatar";

type RecurringApi = any;

type DefaulterRow = {
  subscriptionId: string;
  customerName: string;
  email: string;
  phone?: string;
  orderId?: string;
  planAmount: number;
  status: string;
  cycleStatus: string;
  nextChargeAt?: string;
  graceUntil?: string;
  lastPaymentAt?: string | null;
  missedPayments: number;
  raw: RecurringApi;
};

const DefaultersTableOne: React.FC = () => {
  const [rows, setRows] = useState<DefaulterRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // WhatsApp modal
  const [selectedRow, setSelectedRow] = useState<DefaulterRow | null>(null);
  const [waPhone, setWaPhone] = useState("");
  const [waTemplate, setWaTemplate] = useState("Sale Order [Rentbuddy Whatsapp]");
  const [waMessage, setWaMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  const fetchDefaulters = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(
        `${BASE_API_URL}/payments/recurringPayments/current`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const apiData: RecurringApi[] = res.data?.data ?? [];

      // only overdue after grace period
      const mapped: DefaulterRow[] = apiData
        .filter((item) => item.cycleStatus === "overdue")
        .map((item) => {
          const user = item.user || {};
          const order = item.order || {};

          const customerName =
            user.username ||
            user.name ||
            order.customerName ||
            "Unknown Customer";

          const email = user.email || order.email || "N/A";
          const phone = user.phone || order.phone || "";

          const planAmount = Number(item.planAmount || 0);

          return {
            subscriptionId: item.subscriptionId,
            customerName,
            email,
            phone,
            orderId: order.orderId,
            planAmount,
            status: item.status || "unknown",
            cycleStatus: item.cycleStatus || "overdue",
            nextChargeAt: item.nextChargeAt,
            graceUntil: item.graceUntil,
            lastPaymentAt: item.lastPaymentAt,
            missedPayments: item.missedPayments || 0,
            raw: item,
          };
        });

      setRows(mapped);
    } catch (err: any) {
      console.error("Error fetching defaulters:", err);
      setError(err.message || "Failed to fetch defaulters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BASE_API_URL]);

  // reset page on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.customerName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q) ||
        (r.subscriptionId || "").toLowerCase().includes(q) ||
        (r.orderId || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const startIdx = (page - 1) * perPage;
  const current = filtered.slice(startIdx, startIdx + perPage);

  const openWhatsAppModal = (row: DefaulterRow) => {
    setSelectedRow(row);
    const phone = row.phone?.startsWith("+") ? row.phone : row.phone ? `+91${row.phone}` : "";
    setWaPhone(phone);

    const msg = `Hello ${row.customerName},

This is a gentle reminder from RENTBUDDY FURNISHING SOLUTIONS PRIVATE LIMITED.

Your current month's rental payment of ₹${row.planAmount.toLocaleString(
      "en-IN"
    )} for subscription ${row.subscriptionId} is overdue, even after the 5 days grace period.

Please clear your payment at the earliest to avoid interruption of services.

If you have already paid, kindly ignore this message.

Thank you.`;
    setWaMessage(msg);
  };

  const closeWhatsAppModal = () => {
    if (isSending) return;
    setSelectedRow(null);
  };

  const handleSendWhatsApp = async () => {
    if (!selectedRow) return;
    setIsSending(true);
    try {
      // later you will hit your WhatsApp API here
      console.log("WhatsApp send payload:", {
        to: waPhone,
        template: waTemplate,
        message: waMessage,
        defaulter: selectedRow,
      });
    } finally {
      setIsSending(false);
      setSelectedRow(null);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Recurring Defaulters
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customers on recurring plans who have not paid this month, even after the 5-day grace period.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone, subscription..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="mb-4 rounded-xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-300">
          Loading defaulters...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
        <Table>
          <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Customer
              </TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Contact
              </TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Subscription
              </TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Plan Amount
              </TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Next Charge
              </TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Grace Until
              </TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Missed
              </TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">
                Status
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-center font-semibold">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-white/10 dark:divide-white/10">
            {current.length > 0 ? (
              current.map((row) => (
                <TableRow
                  key={row.subscriptionId}
                  className="border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)] transition-all duration-200"
                >
                  {/* Customer */}
                  <TableCell className="px-4 py-4 text-sm text-slate-900 dark:text-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar
                        alt={row.customerName}
                        nameForInitials={row.customerName}
                        size={32}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{row.customerName}</span>
                        {row.orderId && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Order: {row.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="px-4 py-4 text-xs text-slate-700 dark:text-slate-300">
                    <div className="space-y-1">
                      <div className="rounded-full bg-white/60 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                        {row.email}
                      </div>
                      {row.phone && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {row.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Subscription */}
                  <TableCell className="px-4 py-4 text-xs text-slate-700 dark:text-slate-300">
                    <div className="space-y-1">
                      <div className="font-mono text-[11px]">
                        {row.subscriptionId}
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-400 ring-1 ring-rose-500/40">
                        Overdue
                      </div>
                    </div>
                  </TableCell>

                  {/* Plan amount */}
                  <TableCell className="px-4 py-4 text-sm text-slate-800 dark:text-slate-100">
                    ₹{row.planAmount.toLocaleString("en-IN")}
                  </TableCell>

                  {/* Next charge */}
                  <TableCell className="px-4 py-4 text-xs text-slate-700 dark:text-slate-300">
                    {row.nextChargeAt
                      ? new Date(row.nextChargeAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </TableCell>

                  {/* Grace until */}
                  <TableCell className="px-4 py-4 text-xs text-slate-700 dark:text-slate-300">
                    {row.graceUntil
                      ? new Date(row.graceUntil).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>

                  {/* Missed */}
                  <TableCell className="px-4 py-4 text-center text-sm text-slate-800 dark:text-slate-100">
                    {row.missedPayments}
                  </TableCell>

                  {/* App-level status */}
                  <TableCell className="px-4 py-4 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-100/5 dark:text-slate-200">
                      {row.status}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-4 py-4 text-center text-sm">
                    <button
                      onClick={() => openWhatsAppModal(row)}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-[0_10px_25px_rgba(34,197,94,0.55)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/70"
                    >
                      Send WhatsApp
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0">
                <td
                  colSpan={9}
                  className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                >
                  {loading
                    ? "Loading defaulters..."
                    : "No defaulters found for this month. 🎉"}
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
          <p className="flex items-center gap-1">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
              {page}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              of {totalPages} pages
            </span>
          </p>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            windowSize={3}
          />
        </div>
      )}

      {/* WhatsApp Modal */}
      <ModalWrapper isOpen={!!selectedRow} onClose={closeWhatsAppModal}>
        {selectedRow && (
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            {/* Left: form */}
            <div className="flex-1 space-y-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Send WhatsApp Message
              </h3>

              {/* Template select */}
              <div className="space-y-1 text-xs">
                <label className="block text-slate-600 dark:text-slate-300">
                  Template
                </label>
                <select
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="Sale Order [Rentbuddy Whatsapp]">
                    Sale Order [Rentbuddy Whatsapp]
                  </option>
                  <option value="Payment Reminder">
                    Payment Reminder (Custom)
                  </option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1 text-xs">
                <label className="block text-slate-600 dark:text-slate-300">
                  Phone
                </label>
                <input
                  type="text"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Message */}
              <div className="space-y-1 text-xs">
                <label className="block text-slate-600 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  rows={6}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={closeWhatsAppModal}
                  disabled={isSending}
                  className="rounded-lg border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Close
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  disabled={isSending || !waPhone}
                  className="rounded-lg bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(34,197,94,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>

            {/* Right: Preview card */}
            <div className="hidden w-72 flex-none rounded-xl bg-[#e5ddd5] p-3 text-xs text-slate-900 shadow-inner md:block">
              <div className="mb-2 rounded-lg bg-white/80 p-2">
                <div className="aspect-[16/9] w-full rounded-md bg-slate-200" />
              </div>
              <div className="rounded-lg bg-white p-3 leading-relaxed">
                <p className="mb-1">
                  Hello{" "}
                  <span className="font-semibold">
                    {selectedRow.customerName}
                  </span>
                  ,
                </p>
                <p className="mb-2 whitespace-pre-line text-[11px]">
                  {waMessage}
                </p>
                <p className="mt-2 text-[10px] text-slate-500">
                  Write &apos;stop&apos; to stop receiving messages.
                </p>
              </div>
              <div className="mt-1 text-[10px] text-right text-slate-500">
                06:00
              </div>
            </div>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};

export default DefaultersTableOne;
