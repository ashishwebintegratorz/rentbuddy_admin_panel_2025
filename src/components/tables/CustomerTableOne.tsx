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
import Avatar from "../ui/avatar/Avatar";
import ModalWrapper from "../../layout/ModalWrapper";

type CustomerRow = {
  name: string;
  img?: string | null; // optional image
  customerId: string;
  createdDate: string;
  email: string;
  phonenumber: string;
  subscription: string;
  action: number;
};

export default function CustomerTableOne() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const customersPerPage = 10;

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    axios
      .get(`${BASE_API_URL}/user/getAllCustomers`)
      .then((res) => {
        const fetched: CustomerRow[] = res.data.data.map((cust: any) => ({
          name: cust.username,
          img: cust.avatarUrl ?? cust.profileImage ?? null,
          customerId: cust.customerId, // make sure this is the Auth _id if delete uses that
          createdDate: new Date(cust.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          email: cust.email,
          phonenumber: cust.phone,
          subscription: cust.isSubscribed ? "Active" : "Inactive",
          action: 1,
        }));
        setCustomers(fetched);
      })
      .catch((err) => console.error("Error fetching customers:", err));
  }, [BASE_API_URL]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token"); // if you use auth

      await axios.delete(`${BASE_API_URL}/user/deleteCustomer`, {
        data: { id }, // 👈 body goes here for axios.delete
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setCustomers((prev) => prev.filter((cust) => cust.customerId !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filtered = customers.filter(
    (cust) =>
      cust.name.toLowerCase().includes(search.toLowerCase()) ||
      cust.email.toLowerCase().includes(search.toLowerCase()) ||
      cust.customerId.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / customersPerPage);

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
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

      <div className="relative">
        {/* Header with Search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Customers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your customer list, subscriptions, and accounts.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Created Date
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Email
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Subscription
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
                current.map((cust) => (
                  <TableRow
                    key={cust.customerId}
                    className="group border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)] transition-all duration-200"
                  >
                    <TableCell className="px-4 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar
                            src={cust.img || undefined}
                            alt={cust.name}
                            nameForInitials={cust.name}
                            size={40}
                          />
                          {
                            cust.subscription === "Active" ? (
                              <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(248,250,252,0.9)] dark:shadow-[0_0_0_3px_rgba(15,23,42,1)]" />
                            ) : (
                              <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_0_3px_rgba(248,250,252,0.9)] dark:shadow-[0_0_0_3px_rgba(15,23,42,1)]" />
                            )
                          }
                          
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-50">
                            {cust.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            #{cust.customerId}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-mono tracking-tight dark:bg-slate-100/5">
                        {cust.customerId}
                      </span>
                    </TableCell> */}

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {cust.createdDate}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                        {cust.email}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {cust.phonenumber}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${
                          cust.subscription === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                            : "bg-rose-500/10 text-rose-400 ring-rose-500/40 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            cust.subscription === "Active"
                              ? "bg-emerald-400"
                              : "bg-rose-400"
                          }`}
                        />
                        {cust.subscription}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <button
                        onClick={() => openConfirm(cust.customerId)}
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
                    colSpan={7}
                    className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No customers found. Try adjusting your search.
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
            Delete customer?
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This action cannot be undone. Are you sure you want to permanently
            delete this customer and all associated data?
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
