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
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "cumulative" | "recurring">("all");

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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
      {/* Header with Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Orders
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by order ID, name, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white/80 dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />

          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className="dropdown-toggle flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 shadow-sm text-sm"
            >
              <span>{statusLabelMap[statusFilter]}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
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
              className="dropdown-toggle flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 shadow-sm text-sm"
            >
              <span>{paymentLabelMap[paymentFilter]}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
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
      <div className="max-w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400"
              >
                Order ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400"
              >
                Customer Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400"
              >
                Payment Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-700 font-semibold text-center dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {current.length > 0 ? (
              current.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {order.orderId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-white/90">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {order.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-gray-700 dark:text-gray-400">
                    ₹{order.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {order.paymentType}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {order.createdDate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() => openConfirm(order.orderId)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td
                  colSpan={8}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No orders found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {Array.isArray(filtered) && filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Delete order?
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          This action cannot be undone. Are you sure you want to delete this order?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={closeConfirm}
            disabled={isDeleting}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            No, keep
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </ModalWrapper>
    </div>
  );
}
