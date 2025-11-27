import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import SidebarProducts from "../../components/rental/SidebarProducts";
import BarcodeTable from "../../components/rental/BarcodeTable";
import RentalHistoryPanel from "../../components/rental/RentalHistoryPanel";
import { motion, AnimatePresence } from "framer-motion";

export interface RentalItem {
  productID: string;
  productSerialID: string;
  rentalDuration: string;
  productName: string;
  rentalPrice: number;
}

export interface CurrentRental {
  customerID?: {
    _id: string;
    username: string;
    email: string;
  };
  orderID?: string;
  rentedDate?: string;
  rentedTill?: string;
}

export interface RentalHistoryEntry {
  _id: string;
  customerID: {
    _id: string;
    username: string;
    email: string;
  };
  orderID: string;
  rentedDate: string;
  rentedTill: string;
  rentalPrice: number;
  conditionAtReturn: string;
}

export interface BarcodeRecord {
  _id: string;
  brID: string;
  rentalItem: RentalItem;
  currentRental?: CurrentRental | null;
  rentalHistory?: RentalHistoryEntry[];
  createdAt?: string;
}

const RentalStockPage: React.FC = () => {
  const [barcodes, setBarcodes] = useState<BarcodeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProductID, setSelectedProductID] = useState<string | null>(
    null
  );
  const [selectedBarcode, setSelectedBarcode] =
    useState<BarcodeRecord | null>(null);

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    const fetchBarcodes = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_API_URL}/barcode/getAllBarcodes`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setBarcodes(res.data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch rental barcodes");
      } finally {
        setLoading(false);
      }
    };

    fetchBarcodes();
  }, [BASE_API_URL]);

  const products = useMemo(() => {
    const map = new Map<
      string,
      { productID: string; productName: string; rentalPrice: number }
    >();
    barcodes.forEach((b) => {
      if (!b.rentalItem) return;
      const { productID, productName, rentalPrice } = b.rentalItem;
      if (!map.has(productID)) {
        map.set(productID, { productID, productName, rentalPrice });
      }
    });
    return Array.from(map.values());
  }, [barcodes]);

  const filteredBarcodes = useMemo(() => {
    if (!selectedProductID) return [];
    return barcodes.filter(
      (b) => b.rentalItem && b.rentalItem.productID === selectedProductID
    );
  }, [barcodes, selectedProductID]);

  useEffect(() => {
    if (!selectedProductID && products.length > 0) {
      setSelectedProductID(products[0].productID);
    }
  }, [products, selectedProductID]);

  const goBack = () => setSelectedBarcode(null);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-col lg:flex-row">
          <SidebarProducts
            products={products}
            selectedProductID={selectedProductID}
            onSelectProduct={(id) => {
              setSelectedProductID(id);
              setSelectedBarcode(null);
            }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-4 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Rental Stock
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View and manage rental items, barcodes, and rental history.
            </p>
          </div>

          {/* Breadcrumbs */}
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="cursor-pointer hover:underline">Home</span>
            <span>/</span>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => setSelectedBarcode(null)}
            >
              Rental Stock
            </span>
            {selectedBarcode && (
              <>
                <span>/</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {selectedBarcode.rentalItem?.productName || "History"}
                </span>
              </>
            )}
          </div>

          {/* Glass inner container */}
          <div className="max-w-full overflow-hidden rounded-xl border border-white/20 bg-white/30 p-4 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
            {loading && (
              <p className="py-10 text-center text-sm text-blue-600 dark:text-blue-400">
                Loading rental barcodes...
              </p>
            )}
            {error && (
              <p className="py-10 text-center text-sm text-rose-500">
                {error}
              </p>
            )}

            {!loading && !error && !selectedProductID && (
              <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Select a product from the sidebar to view its barcodes.
              </p>
            )}

            <AnimatePresence mode="wait">
              {!loading &&
                !error &&
                selectedProductID &&
                selectedBarcode === null && (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <BarcodeTable
                      barcodes={filteredBarcodes}
                      onSelectBarcode={setSelectedBarcode}
                    />
                  </motion.div>
                )}

              {!loading && !error && selectedBarcode !== null && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <RentalHistoryPanel
                    selectedBarcode={selectedBarcode}
                    onBack={goBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalStockPage;
