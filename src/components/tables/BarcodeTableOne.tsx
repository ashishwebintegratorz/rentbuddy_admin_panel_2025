import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Printer, Check, RotateCcw, AlertCircle } from "lucide-react";

export default function BarcodeTableOne() {
  const [barcodes, setBarcodes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "rented" | "available" | "returned" | "damaged" ...
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Added states
  const [viewBarcode, setViewBarcode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  // Fetch function (used after returns too)
  const fetchBarcodes = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/barcode/getAllBarcodes`);
      // API returns { data: [...] } earlier, preserve that:
      const data = res?.data?.data ?? res?.data ?? [];
      setBarcodes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching barcodes:", err);
      setBarcodes([]);
    }
  };

  useEffect(() => {
    fetchBarcodes();
  }, [BASE_API_URL]);

  // Safe filtered list applying search & status filter
  const filtered = (Array.isArray(barcodes) ? barcodes : []).filter((b) => {
    const matchesSearch =
      !search ||
      b?.brID?.toLowerCase().includes(search.toLowerCase()) ||
      b?.rentalItem?.productName
        ?.toString()
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (b?.status && b.status.toString().toLowerCase() === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = Array.isArray(filtered)
    ? filtered.slice(indexOfFirst, indexOfLast)
    : [];

  // Status badge component (kept same as your original styles)
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      rented: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        icon: <RotateCcw className="w-3 h-3" />,
      },
      returned: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        icon: <Check className="w-3 h-3" />,
      },
      available: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <Check className="w-3 h-3" />,
      },
      active: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: <Check className="w-3 h-3" />,
      },
      inactive: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <AlertCircle className="w-3 h-3" />,
      },
      damaged: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <AlertCircle className="w-3 h-3" />,
      },
      default: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };
    const key = status?.toString()?.toLowerCase();
    const config = statusConfig[key] || statusConfig.default;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.bg} ${config.text}`}
      >
        {config.icon}
        <span>{status ? status.toString().toUpperCase() : "—"}</span>
      </span>
    );
  };

  // --- Selection logic ---
  const toggleSelect = (id) => {
    setSelectedBarcodes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = Array.isArray(current) ? current.map((b) => b._id) : [];
    if (pageIds.length === 0) return;

    const allSelected = pageIds.every((id) => selectedBarcodes.includes(id));
    if (allSelected) {
      // remove page ids from selection
      setSelectedBarcodes((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      // add page ids to selection (unique)
      setSelectedBarcodes((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Print single barcode (keeps your original behavior)
  const handlePrint = (barcodeImg) => {
    if (!barcodeImg) return alert("No barcode image found!");
    const newWin = window.open();
    if (!newWin) return alert("Popup blocked — allow popups for this site.");
    newWin.document.write(
      `<html><head><title>Print</title></head><body style="display:flex;flex-direction:column;align-items:center;">` +
        `<img src="data:image/png;base64,${barcodeImg}" style="width:300px;">` +
        `</body></html>`
    );
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  // Print selected barcodes
  const handlePrintSelected = () => {
    if (!Array.isArray(selectedBarcodes) || selectedBarcodes.length === 0) {
      return alert("Please select at least one barcode to print.");
    }

    const itemsToPrint = (Array.isArray(barcodes) ? barcodes : [])
      .filter((b) => selectedBarcodes.includes(b._id))
      .map((b) => b.barcodeImg)
      .filter(Boolean);

    if (itemsToPrint.length === 0) {
      return alert("No barcode images found for selected items.");
    }

    handleMultiPrint(itemsToPrint);
  };

  // Return API call - only visible for rented items
  const handleReturn = async (barcodeId) => {
    if (!confirm("Mark this barcode as returned?")) return;
    try {
      const res = await axios.put(
        `${BASE_API_URL}/barcode/return/${barcodeId}`,
        {
          conditionAtReturn: "good",
        }
      );
      // Refresh list and clear selection for that barcode
      await fetchBarcodes();
      setSelectedBarcodes((prev) => prev.filter((id) => id !== barcodeId));
      // Optionally show a toast here (not included)
    } catch (err) {
      console.error("Error returning barcode:", err);
      alert("Failed to return barcode. See console for details.");
    }
  };

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);
  // MULTI-PAGE BARCODE SHEET PRINTING (24 per A4 page)

  // ONE BARCODE PER ROW PRINTING (auto multi-page)
  const handleMultiPrint = (barcodeList) => {
    if (!barcodeList || barcodeList.length === 0) {
      alert("No barcodes selected for printing");
      return;
    }

    const printWindow = window.open("", "", "width=900,height=700");

    const maxPerPage = 10; // 10 rows per page (you can increase to 12–15)

    let html = `
    <html>
    <head>
      <title>Print Barcodes</title>
      <style>
        body { 
          font-family: Arial; 
          padding: 20px; 
        }

        .page {
          page-break-after: always;
          margin-bottom: 40px;
        }

        .barcode-row {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px 0;
          border-bottom: 1px dashed #ccc;
        }

        img {
          width: 300px; /* increase/decrease size */
          height: auto;
        }
      </style>
    </head>
    <body>
  `;

    for (let i = 0; i < barcodeList.length; i += maxPerPage) {
      const pageSlice = barcodeList.slice(i, i + maxPerPage);

      html += `<div class="page">`;

      pageSlice.forEach((img) => {
        html += `
        <div class="barcode-row">
          <img src="data:image/png;base64,${img}" />
        </div>`;
      });

      html += `</div>`;
    }

    html += `</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
      {/* Header with Search + Status Filter + Print Selected */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Barcode Management
        </h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by BR ID or Product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white/80 dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />

          {/* Status filter (A: beside the search bar) */}
          <div className="flex items-center gap-3 mb-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
      bg-white dark:bg-neutral-900 
      border border-gray-300 dark:border-neutral-700 
      text-gray-700 dark:text-gray-200 
      px-3 py-1.5 rounded-lg 
      focus:outline-none focus:ring-2 
      focus:ring-indigo-500 
      transition-all duration-150
      shadow-sm
    "
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <button
            onClick={handlePrintSelected}
            disabled={
              !Array.isArray(selectedBarcodes) || selectedBarcodes.length === 0
            }
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
              selectedBarcodes.length > 0
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-300 cursor-not-allowed"
            }`}
          >
            <Printer className="w-4 h-4" /> Print Selected (
            {selectedBarcodes.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <TableRow>
              {/* Select all checkbox */}
              <TableCell isHeader className="px-5 py-3">
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(current) &&
                    current.length > 0 &&
                    current.every((b) => selectedBarcodes.includes(b._id))
                  }
                  onChange={toggleSelectAllOnPage}
                />
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                SR No
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                BR ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Product
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Created Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Barcode
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-center dark:text-white text-gray-dark"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.isArray(current) && current.length > 0 ? (
              current.map((b, index) => (
                <TableRow key={b._id}>
                  {/* row checkbox */}
                  <TableCell className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBarcodes.includes(b._id)}
                      onChange={() => toggleSelect(b._id)}
                    />
                  </TableCell>

                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    {indexOfFirst + index + 1}
                  </TableCell>

                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    {b.brID}
                  </TableCell>

                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    {b.rentalItem?.productName || "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    {b.createdAt
                      ? new Date(b.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>

                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    <StatusBadge status={b.status} />
                  </TableCell>

                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    {b.barcodeImg ? (
                      <img
                        src={`data:image/png;base64,${b.barcodeImg}`}
                        className="h-10 w-auto object-contain dark:bg-white bg-gray-100 p-1 rounded"
                        alt={b.brID ?? "barcode"}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Action column */}
                  <TableCell className="px-5 py-4 text-center flex items-center justify-center gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => {
                        setViewBarcode(b.barcodeImg);
                        setShowModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      View
                    </button>

                    {/* Print Button */}
                    <button
                      onClick={() => handlePrint(b.barcodeImg)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition flex items-center gap-1"
                    >
                      <Printer className="h-3 w-3" /> Print
                    </button>

                    {/* Return Button: only when rented */}
                    {b?.status?.toString().toLowerCase() === "rented" ? (
                      <button
                        onClick={() => handleReturn(b._id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                      >
                        Return
                      </button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td
                  colSpan={8}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No barcodes found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {Array.isArray(filtered) && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border dark:text-white text-gray-dark disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border dark:text-white text-gray-dark disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-xl w-[350px] sm:w-[450px] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Barcode Preview
            </h3>

            {viewBarcode ? (
              <img
                src={`data:image/png;base64,${viewBarcode}`}
                className="w-full max-h-[350px] object-contain bg-gray-100 p-2 rounded dark:bg-white"
                alt="preview"
              />
            ) : (
              <p className="text-center text-gray-500">No barcode available</p>
            )}

            <button
              onClick={() => handlePrint(viewBarcode)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Print Barcode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
