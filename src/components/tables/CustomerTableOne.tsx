import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function CustomerTableOne() {
  const [customers, setCustomers] = useState<
    {
      name: string;
      img: string;
      customerId: string;
      createdDate: string;
      email: string;
      phonenumber: string;
      subscription: string;
      action: number;
    }[]
  >([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    axios
      .get(`${BASE_API_URL}/user/getAllCustomers`)
      .then((res) => {
        const fetched = res.data.data.map((cust: any) => ({
          name: cust.username,
          img: "/images/user/user-17.jpg",
          customerId: cust.customerId,
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
      await axios.delete(`${BASE_API_URL}/user/deleteCustomer/${id}`);
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
          className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white/80 dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-white font-semibold">
                Customer
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-white font-semibold">
                Customer ID
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-white font-semibold">
                Created Date
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-white font-semibold">
                Email
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-white font-semibold">
                Phone
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-white font-semibold">
                Subscription
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-600 font-semibold text-center"
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
                      <img
                        src={cust.img}
                        alt={cust.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {cust.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    {cust.customerId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    {cust.createdDate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    {cust.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    {cust.phonenumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                      onClick={() => handleDelete(cust.customerId)}
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
                  colSpan={7}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No customers found.
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
