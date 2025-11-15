import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { MoreVertical, Pencil, Tag, Trash2 } from "lucide-react";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import ModalWrapper from "../../layout/ModalWrapper";

function EditProductForm({
  product,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className=" mt-3 space-y-1 ">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
          Product Name
        </label>
        <input
          type="text"
          name="productName"
          value={product.productName || ""}
          onChange={onChange}
          placeholder="Enter product name"
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Category
        </label>
        <select
          name="category"
          value={product.category || ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
          required
        >
          <option value="">Select category</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Living Room">Living Room</option>
          <option value="Dining Room">Dining Room</option>
          <option value="Storage">Storage</option>
          <option value="Appliances">Appliances</option>
          <option value="Work From Home">Work From Home</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Rental Price
          </label>
          <input
            type="text"
            name="rentalPrice"
            value={product.rentalPrice || ""}
            onChange={onChange}
            placeholder="per month"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Cost Price
          </label>
          <input
            type="text"
            name="costPrice"
            value={product.costPrice || ""}
            onChange={onChange}
            placeholder="Amount"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Deposit
          </label>
          <input
            type="text"
            name="deposit"
            value={product.deposit || ""}
            onChange={onChange}
            placeholder="Amount"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Stock
          </label>
          <input
            type="number"
            name="stocks"
            value={product.stocks || ""}
            onChange={onChange}
            placeholder="Quantity"
            min="0"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">City</label>
        <input
          type="text"
          name="city"
          value={product.city || ""}
          onChange={onChange}
          placeholder="Enter city"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">Description</label>
        <textarea
          name="description"
          value={product.description || ""}
          onChange={onChange}
          placeholder="Enter product description"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base h-24 resize-none dark:text-white transition-colors"
        />
      </div>
      <div className="flex flex-col">
        <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-2.5 px-5 rounded-lg transition duration-300 flex items-center group hover:from-blue-600 hover:to-indigo-700 active:scale-95">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          Upload Product Image
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Button type="submit" variant="primary">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function EditOfferForm({ offer, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-2">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">Offer Code</label>
        <input
          type="text"
          name="offerCode"
          value={offer.offerCode || ""}
          onChange={onChange}
          placeholder="Enter offer code"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">Discount</label>
        <input
          type="text"
          name="discount"
          value={offer.discount || ""}
          onChange={onChange}
          placeholder="Enter discount"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">Validity (Days)</label>
        <input
          type="text"
          name="validity"
          value={offer.validity || ""}
          onChange={onChange}
          placeholder="Validity in days"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">Minimum Amount</label>
        <input
          type="text"
          name="minimumAmount"
          value={offer.minimumAmount || ""}
          onChange={onChange}
          placeholder="Minimum order amount"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">Expiry Date</label>
        <input
          type="date"
          name="date"
          value={offer.date || ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Button type="submit" variant="primary">Save Offer</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function EditDurationDiscountForm({ discount, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 dark:text-white text-gray-dark">
      <div>
        <label className="block text-sm mb-1 dark:text-white text-gray-dark">3 Months Discount</label>
        <input
          type="text"
          name="threeMonths"
          value={discount.threeMonths}
          onChange={onChange}
          placeholder="Discount % or amount"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1 dark:text-white text-gray-dark">6 Months Discount</label>
        <input
          type="text"
          name="sixMonths"
          value={discount.sixMonths}
          onChange={onChange}
          placeholder="Discount % or amount"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1 dark:text-white text-gray-dark">12 Months Discount</label>
        <input
          type="text"
          name="twelveMonths"
          value={discount.twelveMonths}
          onChange={onChange}
          placeholder="Discount % or amount"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">Save Discount</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function ProductTableOne() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(null);
  const [modal, setModal] = useState({ open: false, type: "", product: null });
  const [editProduct, setEditProduct] = useState({});
  const [editOffer, setEditOffer] = useState({});
  const [editDiscount, setEditDiscount] = useState({ threeMonths: "", sixMonths: "", twelveMonths: "" });

  const itemsPerPage = 10;
  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_API_URL}/products/getProduct`, {
        headers: { Authorization: token },
      });
      const data = res?.data?.data ?? res?.data ?? [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to fetch products");
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [BASE_API_URL]);

  const filtered = (Array.isArray(products) ? products : []).filter((p) => {
    return (
      (!search ||
        p?.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p?.sku?.toString().toLowerCase().includes(search.toLowerCase()) ||
        p?.serialNumber?.toLowerCase().includes(search.toLowerCase())) &&
      (!categoryFilter || p?.category?.toLowerCase() === categoryFilter.toLowerCase()) &&
      (!statusFilter || p?.availability?.toLowerCase() === statusFilter.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);

  const AvailabilityBadge = ({ availability }) => {
    const map = {
      available: "bg-green-100 text-green-700",
      rented: "bg-amber-100 text-amber-700",
      maintenance: "bg-blue-100 text-blue-700",
      unavailable: "bg-red-100 text-red-700",
    };
    const style = map[availability?.toLowerCase()] || "bg-gray-100 text-gray-700";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {availability ? availability.toUpperCase() : "—"}
      </span>
    );
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (type, product) => {
    setModal({ open: true, type, product });
    setMenuOpen(null);
    if (type === "edit-product") setEditProduct({ ...(product || {}) });
    if (type === "edit-offer") setEditOffer({ ...(product?.offer || {}) });
    if (type === "view-discount") {
      setEditDiscount({
        threeMonths: product?.durationsDiscount?.threeMonths || "",
        sixMonths: product?.durationsDiscount?.sixMonths || "",
        twelveMonths: product?.durationsDiscount?.twelveMonths || "",
      });
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: "", product: null });
  };

  const handleEditProductChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    setEditProduct((prev) => ({ ...prev, image: file }));
  };

  const handleEditOfferChange = (e) => {
    const { name, value } = e.target;
    setEditOffer((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDiscountChange = (e) => {
    const { name, value } = e.target;
    setEditDiscount((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { image, ...productData } = editProduct;
      await axios.put(`${BASE_API_URL}/products/editProduct`, productData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      toast.success("Product edited successfully!");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to edit product:", error);
      toast.error("Failed to edit product");
    }
  };

  const handleEditOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!modal.product?._id) {
        toast.error("Product ID missing");
        return;
      }
      await axios.post(
        `${BASE_API_URL}/products/editOffers/${modal.product._id}`,
        editOffer,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Offer updated successfully!");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to update offer:", error);
      toast.error("Failed to update offer");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!modal.product?._id) {
        toast.error("Product ID missing");
        return;
      }
      await axios.delete(`${BASE_API_URL}/products/deleteProduct/${modal.product._id}`, {
        headers: {
          Authorization: token,
        },
      });
      toast.success("Product deleted successfully!");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditDiscountSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!modal.product?._id) {
        toast.error("Product ID missing");
        return;
      }
      await axios.put(
        `${BASE_API_URL}/products/${modal.product._id}`,
        editDiscount,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      toast.success("Discount updated successfully!");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to update discount:", error);
      toast.error("Failed to update discount");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Product Table
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Product, SKU, Serial No..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white/80 dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 dark:text-white"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 dark:text-white hover:bg-gray-700"
          >
            <option value="">All Categories</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Living Room">Living Room</option>
            <option value="Dining Room">Dining Room</option>
            <option value="Storage">Storage</option>
            <option value="Appliances">Appliances</option>
            <option value="Work From Home">Work From Home</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 dark:text-white "
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">SR No</TableCell>
              <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Product</TableCell>
              <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Serial Number</TableCell>
              <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Category</TableCell>
              <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Rental Price</TableCell>
              <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Status</TableCell>
              <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Details</TableCell>
              <TableCell isHeader className="px-5 py-3 text-center dark:text-white text-gray-dark">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {current.length > 0 ? (
              current.map((p, index) => (
                <TableRow key={p._id}>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">{indexOfFirst + index + 1}</TableCell>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">{p.productName || "—"}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Stock: {p.stocks ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">{p.productId || "—"}</TableCell>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">{p.category || "—"}</TableCell>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">₹{p.rentalPrice + "/month" || "—"}</TableCell>
                  <TableCell className="px-5 py-4"><AvailabilityBadge availability={p.availability} /></TableCell>
                  <TableCell className="px-5 py-4">
                    <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => openModal("view-discount", p)}>View</button>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center relative">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(p._id)}>
                      <MoreVertical className="w-5 h-5 text-gray-700 dark:text-white" />
                    </button>
                    {menuOpen === p._id && (
                      <div ref={menuRef} className="absolute right-9 top-10 z-10 min-w-[180px] bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 text-left">
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={() => openModal("edit-product", p)}>
                          <Pencil className="w-4 h-4" /> Edit Product
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={() => openModal("edit-offer", p)}>
                          <Tag className="w-4 h-4" /> Edit Offer
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-gray-700 text-red-600" onClick={() => openModal("delete", p)}>
                          <Trash2 className="w-4 h-4" /> Delete Product
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><td colSpan={8} className="text-center py-6 text-gray-500 italic">No products found.</td></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border dark:text-white text-gray-dark disabled:opacity-50">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border dark:text-white text-gray-dark disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModalWrapper isOpen={modal.open && modal.type === "edit-product"} onClose={closeModal}>
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Edit Product</h3>
        <EditProductForm
          product={editProduct}
          onChange={handleEditProductChange}
          onFileChange={handleProductFileChange}
          onSubmit={handleEditProductSubmit}
          onCancel={closeModal}
        />
      </ModalWrapper>

      <ModalWrapper isOpen={modal.open && modal.type === "edit-offer"} onClose={closeModal}>
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Edit Offer</h3>
        <EditOfferForm
          offer={editOffer}
          onChange={handleEditOfferChange}
          onSubmit={handleEditOfferSubmit}
          onCancel={closeModal}
        />
      </ModalWrapper>

      <ModalWrapper isOpen={modal.open && modal.type === "delete"} onClose={closeModal}>
        <h3 className="text-lg font-semibold mb-3 text-red-600">Delete Product</h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete&nbsp;
          <span className="font-medium text-gray-900 dark:text-white">{modal.product?.productName}</span>?
        </p>
        <div className="flex gap-4 mt-6">
          <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={handleDeleteProduct}>Delete</Button>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={modal.open && modal.type === "view-discount"} onClose={closeModal}>
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Update Duration Discount</h3>
        <EditDurationDiscountForm
          discount={editDiscount}
          onChange={handleEditDiscountChange}
          onSubmit={handleEditDiscountSubmit}
          onCancel={closeModal}
        />
      </ModalWrapper>
    </div>
  );
}
