import React, { useEffect, useState } from "react";
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
import { useSidebar } from "../../context/SidebarContext";

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
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [openModal, setOpenModal] = useState<{
    type: string;
    complaint: Complaint | null;
  }>({ type: "", complaint: null });
  const [formStatus, setFormStatus] = useState<string>("");
  const { isExpanded } = useSidebar();

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

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <>
   
      <div
        className={`rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] transition-[max-width] duration-300 ease-in-out p-5 flex flex-col table-scrollbar ${
          isExpanded ? "max-w-40% xl:max-w-250" : "max-w-340 xl:max-w-300 2xl:max-w-70%"
        }`}
      >
        {/* Table scroll wrapper */}
        <div
          className="flex-grow overflow-x-auto overflow-y-auto rounded-lg"
          style={{ minHeight: 0 }}
        >
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              {loading && (
                <p className="text-center text-blue-600 py-8">Loading...</p>
              )}
              {error && (
                <p className="text-center text-red-600 py-8">{error}</p>
              )}
              {!loading && !error && (
                <Table className="min-w-[800px]">
                  <TableHeader className="border-b border-gray-200 bg-gray-50 dark:bg-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 rounded-l-lg w-10"
                      >
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAllChange}
                          className="w-4 h-4"
                          aria-label="Select all complaints"
                        />
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[110px] dark:text-white text-gray-dark"
                      >
                        Complaint ID
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[120px] dark:text-white text-gray-dark"
                      >
                        Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[130px] dark:text-white text-gray-dark"
                      >
                        Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[180px] dark:text-white text-gray-dark"
                      >
                        Email
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[120px] dark:text-white text-gray-dark"
                      >
                        Phone
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[160px] max-w-[200px] dark:text-white text-gray-dark"
                      >
                        Message
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[100px] dark:text-white text-gray-dark"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 min-w-[100px] rounded-r-lg dark:text-white text-gray-dark"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-6 italic text-gray-500"
                        >
                          No complaints found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentComplaints.map((complaint, index) => (
                        <TableRow
                          key={complaint._id}
                          className="text-center border-b"
                        >
                          <TableCell className="px-5 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={selectedRows[start + index] || false}
                              onChange={() =>
                                handleRowCheckboxChange(start + index)
                              }
                              className="w-4 h-4"
                              aria-label={`Select complaint ${complaint.complaintId}`}
                            />
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[110px] dark:text-white text-gray-dark">
                            <span
                              className="block overflow-hidden text-ellipsis whitespace-nowrap"
                              title={complaint.complaintId}
                            >
                              {complaint.complaintId}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[120px] dark:text-white text-gray-dark">
                            {formatDate(complaint.date)}
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[130px] dark:text-white text-gray-dark">
                            <span
                              className="block overflow-hidden text-ellipsis whitespace-nowrap"
                              title={complaint.name}
                            >
                              {complaint.name}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[180px] dark:text-white text-gray-dark">
                            <span
                              className="block overflow-hidden text-ellipsis whitespace-nowrap"
                              title={complaint.email}
                            >
                              {complaint.email}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[120px] dark:text-white text-gray-dark">
                            {complaint.phone}
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[160px] max-w-[200px] text-left dark:text-white text-gray-dark">
                            <div className="relative group">
                              <span className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer">
                                {complaint.message}
                              </span>
                              <div className="absolute z-20 hidden group-hover:block left-0 top-full mt-1 w-80 max-h-48 overflow-auto rounded-md border border-gray-300 bg-white p-3 text-xs text-gray-800 shadow-lg dark:bg-neutral-900 dark:text-white dark:border-white/10">
                                {complaint.message}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[100px] dark:text-white text-gray-dark">
                            {complaint.status}
                          </TableCell>
                          <TableCell className="px-5 py-3 min-w-[100px] flex justify-center space-x-2 dark:text-white text-gray-dark">
                            <button
                              onClick={() => openEditModal(complaint)}
                              className="p-1 rounded hover:bg-gray-200"
                              aria-label="Edit Complaint"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setOpenModal({ type: "delete", complaint })}
                              className="p-1 rounded hover:bg-red-200 text-red-600"
                              aria-label="Delete Complaint"
                            >
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
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border dark:text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border dark:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    

      {/* Edit Modal */}
      {openModal.type === "edit" && openModal.complaint && (
        <ModalWrapper isOpen={true} onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-dark">Edit Complaint Status</h2>
          <form onSubmit={handleEditProductSubmit} className="space-y-4">
            <label>
              <span className="block mb-1 font-medium dark:text-white text-gray-dark">Status</span>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 dark:text-white text-gray-dark bg-white dark:bg-neutral-900 "
              >
                <option value="pending" className="hover:bg-neutral-50 dark:hover:bg-neutral-800">Pending</option>
                <option value="completed" className="hover:bg-neutral-50 dark:hover:bg-neutral-800">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <div className="flex justify-end gap-4 pt-4">
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
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Delete Complaint
          </h2>
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
      
    </>
  );
};

export default ComplaintTableOne;
