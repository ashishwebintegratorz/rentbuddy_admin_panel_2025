import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  productName: string;
  stocks: number;
  city?: string;
}

interface TrackingRow {
  trackingId: string;
  productName: string;
  city: string;
  remainingStock: number;
}

const itemsPerPage = 10;

const TrackTableOne: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_API_URL}/products/trackProductsRoute`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setProducts(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch product data");
      toast.error(err.message || "Failed to fetch product data");
    } finally {
      setLoading(false);
    }
  };

  const makeTrackingId = (productName: string) => {
    if (!productName) return "N/A";
    return productName
      .split(" ")
      .slice(0, 4)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  const allTrackingRows: TrackingRow[] = products.map((p) => ({
    trackingId: `${makeTrackingId(p.productName)}#${p._id.slice(-4)}`,
    productName: p.productName,
    city: p.city || "N/A",
    remainingStock: p.stocks,
  }));

  const filteredRows = allTrackingRows.filter((row) => {
    const matchSearch =
      !search ||
      row.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      row.productName.toLowerCase().includes(search.toLowerCase());

    const matchCity =
      !cityFilter || row.city.toLowerCase() === cityFilter.toLowerCase();

    return matchSearch && matchCity;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const currentRows = filteredRows.slice(start, start + itemsPerPage);

  const cityOptions = Array.from(
    new Set(products.map((p) => p.city).filter(Boolean))
  );

  return (
    <Fragment>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 flex flex-col h-[82vh] min-h-0 table-scrollbar">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Product Tracking
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Tracking ID or Product..."
              className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white/80 dark:bg-transparent px-3 py-2 text-sm dark:text-white"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              autoComplete="off"
              spellCheck={false}
            />
            <select
              className="
    w-full sm:w-48 rounded-lg 
    border border-gray-300 
    dark:border-white/[0.1] 
    bg-white dark:bg-neutral-950 
    px-3 py-2 text-sm 
    text-gray-800 dark:text-white
  "
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option
                value=""
                className="bg-white dark:bg-neutral-900 text-gray-dark dark:text-white"
              >
                All Cities
              </option>

              {cityOptions.map((city) => (
                <option
                  key={city}
                  value={city}
                  className="bg-white dark:bg-neutral-900 text-gray-dark dark:text-white"
                >
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-auto flex-grow rounded-lg"
          style={{ minHeight: 0 }}
        >
          {loading && (
            <p className="text-center text-blue-600 py-8">Loading...</p>
          )}
          {error && <p className="text-center text-red-600 py-8">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 dark:bg-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="min-w-[160px] dark:text-white text-gray-dark"
                  >
                    Tracking ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="min-w-[200px] dark:text-white text-gray-dark"
                  >
                    Product Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="min-w-[140px] dark:text-white text-gray-dark"
                  >
                    City
                  </TableCell>
                  <TableCell
                    isHeader
                    className="min-w-[100px] dark:text-white text-gray-dark"
                  >
                    Stock
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-gray-500 italic"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((row, idx) => (
                    <TableRow key={`${row.trackingId}-${idx}`}>
                      <TableCell className="dark:text-white text-gray-dark text-center py-3">
                        {row.trackingId}
                      </TableCell>
                      <TableCell className="dark:text-white text-gray-dark text-center">
                        {row.productName}
                      </TableCell>
                      <TableCell className="dark:text-white text-gray-dark text-center">
                        {row.city}
                      </TableCell>
                      <TableCell className="dark:text-white text-gray-dark text-center">
                        {row.remainingStock}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default TrackTableOne;
