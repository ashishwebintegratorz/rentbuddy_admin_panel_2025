import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import ModalWrapper from "../../layout/ModalWrapper";
import { Pencil, Trash2 } from "lucide-react";

interface Complaint {
  _id: string;
  complaintId: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
}

const itemsPerPage = 6;

const ComplaintTableOne = () => {
  // ✅ formatDate MOVED INSIDE (no longer a prop)
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [openModal, setOpenModal] = useState<{ type: string; complaint: Complaint | null }>({ type: "", complaint: null });
  const [formStatus, setFormStatus] = useState<string>("");

  const menuRef = useRef<HTMLDivElement | null>(null);
  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (complaints.length) {
      setSelectedRows(new Array(complaints.length).fill(false));
      setSelectAll(false);
    } else {
      setSelectedRows([]);
      setSelectAll(false);
    }
  }, [complaints]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_API_URL}/user/getQuery`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setComplaints(response.data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllChange = () => {
    const newVal = !selectAll;
    setSelectAll(newVal);
    setSelectedRows(new Array(complaints.length).fill(newVal));
  };

  const handleRowCheckboxChange = (index: number) => {
    if (!selectedRows.length) return;
    const newSelected = [...selectedRows];
    newSelected[index] = !newSelected[index];
    setSelectedRows(newSelected);
    setSelectAll(newSelected.every(Boolean));
  };

  const openEditModal = (complaint: Complaint) => {
    setOpenModal({ type: "edit", complaint });
    setFormStatus(complaint.status);
  };

  const closeModal = () => {
    setOpenModal({ type: "", complaint: null });
    setFormStatus("");
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openModal.complaint) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_API_URL}/complaints/${openModal.complaint._id}`,
        { status: formStatus },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status !== 200) throw new Error("Failed to update complaint");
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === openModal.complaint?._id ? { ...c, status: formStatus } : c
        )
      );
      closeModal();
    } catch (err: any) {
      alert(err.message || "Failed to update complaint");
    }
  };

  const totalPages = Math.max(1, Math.ceil(complaints.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const currentComplaints = complaints.slice(start, start + itemsPerPage);

  const handlePrevPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const handleNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 flex flex-col h-[82vh] min-h-0 overflow-hidden">
        <div className="max-w-full overflow-x-auto rounded-lg flex-grow" style={{ minHeight: 0 }}>
          {loading && <p className="text-center text-blue-600 py-8">Loading...</p>}
          {error && <p className="text-center text-red-600 py-8">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 dark:bg-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 rounded-l-lg w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      className="w-4 h-4"
                      aria-label="Select all complaints"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Complaint ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Phone</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Message</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-gray-dark">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 rounded-r-lg dark:text-white text-gray-dark">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 italic text-gray-500">
                      No complaints found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentComplaints.map((complaint, index) => (
                    <TableRow key={complaint._id} className="text-center border-b">
                      <TableCell className="px-5 py-3 w-10 ">
                        <input
                          type="checkbox"
                          checked={selectedRows[start + index] || false}
                          onChange={() => handleRowCheckboxChange(start + index)}
                          className="w-4 h-4"
                          aria-label={`Select complaint ${complaint.complaintId}`}
                        />
                      </TableCell>
                      <TableCell className="px-5 py-3 dark:text-white text-gray-dark">{complaint.complaintId}</TableCell>
                      <TableCell className="px-5 py-3 dark:text-white text-gray-dark">{formatDate(complaint.date)}</TableCell>
                      <TableCell className="px-5 py-3 dark:text-white text-gray-dark">{complaint.name}</TableCell>
                      <TableCell className="px-5 py-3 dark:text-white text-gray-dark">{complaint.email}</TableCell>
                      <TableCell className="px-5 py-3 dark:text-white text-gray-dark">{complaint.phone}</TableCell>
                      <TableCell className="px-5 py-3 text-left dark:text-white text-gray-dark">{complaint.message}</TableCell>
                      <TableCell className="px-5 py-3 dark:text-white text-gray-dark">{complaint.status}</TableCell>
                      <TableCell className="px-5 py-3 flex justify-center space-x-2 dark:text-white text-gray-dark">
                        <button onClick={() => openEditModal(complaint)} className="p-1 rounded hover:bg-gray-200" aria-label="Edit Complaint">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setOpenModal({ type: "delete", complaint })} className="p-1 rounded hover:bg-red-200 text-red-600" aria-label="Delete Complaint">
                          <Trash2 size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 space-x-4 text-sm">
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>

        {/* Edit Modal */}
        {openModal.type === "edit" && openModal.complaint && (
          <ModalWrapper isOpen={true} onClose={closeModal}>
            <h2 className="text-xl font-bold mb-4">Edit Complaint Status</h2>
            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <label>
                <span className="block mb-1 font-medium">Status</span>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </div>
            </form>
          </ModalWrapper>
        )}

        {/* Delete Modal */}
        {openModal.type === "delete" && openModal.complaint && (
          <ModalWrapper isOpen={true} onClose={closeModal}>
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Complaint</h2>
            <p>
              Are you sure you want to delete complaint{" "}
              <strong>{openModal.complaint.complaintId}</strong>?
            </p>
            <div className="mt-4 flex justify-end space-x-4">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  alert("Delete logic not implemented");
                  closeModal();
                }}
              >
                Delete
              </Button>
            </div>
          </ModalWrapper>
        )}
      </div>
    </>
  );
};

export default ComplaintTableOne;
