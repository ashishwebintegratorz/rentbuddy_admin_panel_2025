import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

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

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${BASE_API_URL}/order/deleteOrder/${id}`);
      setOrders((prev) => prev.filter((order) => order.orderId !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filtered = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase()) ||
      order.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / ordersPerPage);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Orders
        </h2>
        <input
          type="text"
          placeholder="Search by order ID, name, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white/80 dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400">
                Order ID
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400">
                Customer Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400">
                Email
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400">
                Amount
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400">
                Payment Type
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-gray-700 font-semibold dark:text-gray-400">
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
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400 text-center">
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
                      onClick={() => handleDelete(order.orderId)}
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
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded-md border transition ${
                currentPage === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded-md border transition ${
                currentPage === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
