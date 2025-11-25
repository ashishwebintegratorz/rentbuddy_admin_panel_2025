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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Header with Search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Customers
        </h2>
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/[0.1] dark:bg-transparent dark:text-white sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-400"
              >
                Customer ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-400"
              >
                Created Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-400"
              >
                Phone
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-400"
              >
                Subscription
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-center font-semibold text-gray-700 dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {current.length > 0 ? (
              current.map((cust) => (
                <TableRow key={cust.customerId}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={cust.img || undefined}
                        alt={cust.name}
                        nameForInitials={cust.name}
                        size={40}
                      />
                      <span className="font-medium text-gray-700 dark:text-white/90">
                        {cust.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {cust.customerId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {cust.createdDate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {cust.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    {cust.phonenumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-400">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        cust.subscription === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cust.subscription}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() => openConfirm(cust.customerId)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td
                  colSpan={7}
                  className="py-6 text-center text-gray-500 italic"
                >
                  No customers found.
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
          Delete customer?
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          This action cannot be undone. Are you sure you want to delete this
          customer?
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
