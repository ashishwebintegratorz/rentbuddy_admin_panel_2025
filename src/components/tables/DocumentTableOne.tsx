import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "react-toastify";
import { Pagination } from "../ui/pagination/Pagination";
import { Eye } from "lucide-react";
import ModalWrapper from "../../layout/ModalWrapper";

interface DocFile { url?: string; uploadedAt?: string; }

interface DocumentType {
  _id: string;
  username: string;
  documents: {
    aadhar?: DocFile;
    pan?: DocFile;
    rentAgreement?: DocFile;
  };
  status: string;
}

const itemsPerPage = 10;

const DocumentTableOne = () => {
  const [docs, setDocs] = useState<DocumentType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [preview, setPreview] = useState<string | null>(null);

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  // Fetch documents
  const getDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_API_URL}/orders/getDocument`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDocs(res.data.documents || []);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getDocuments(); }, []);

  // Update status
  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_API_URL}/documents/update-status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Marked as ${status}`);
      setDocs(prev => prev.map(d => d._id === id ? { ...d, status } : d));
    } catch {
      toast.error("Failed to update");
    }
  };

  // Filters + Pagination
  const filtered = docs.filter(d =>
    d.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Status UI
  const StatusBadge = ({ status }: { status: string }) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      verified: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    } as any;

    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{status.toUpperCase()}</span>;
  };

  return (
    <Fragment>
      <div className="rounded-xl border bg-white dark:bg-white/[0.03] p-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold dark:text-white">Document Verification</h2>

          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border rounded-lg px-3 py-2 dark:bg-transparent dark:text-white"
          />
        </div>

        {/* Table Wrapper */}
        <div className="relative">
          <div className="max-h-[70vh] overflow-y-auto overflow-x-auto pr-2">

            {loading && <p className="text-blue-600 text-center py-6">Loading...</p>}
            {error && <p className="text-red-600 text-center py-6">{error}</p>}

            {!loading && (
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader>Username</TableCell>
                    <TableCell isHeader className="text-center">Aadhar</TableCell>
                    <TableCell isHeader className="text-center">PAN</TableCell>
                    <TableCell isHeader className="text-center">Rent Agreement</TableCell>
                    <TableCell isHeader className="text-center">Status</TableCell>
                    <TableCell isHeader className="text-center">Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {current.length > 0 ? (
                    current.map(d => (
                      <TableRow key={d._id}>

                        <TableCell className="font-medium dark:text-white">{d.username}</TableCell>

                        {/* Eye Preview Buttons */}
                        <TableCell className="text-center">
                          {d.documents.aadhar?.url ? (
                            <button onClick={() => setPreview(d.documents.aadhar?.url ?? null)} className="text-blue-600 hover:text-blue-700">
                              <Eye size={20} />
                            </button>
                          ) : "—"}
                        </TableCell>

                        <TableCell className="text-center">
                          {d.documents.pan?.url ? (
                            <button onClick={() => setPreview(d.documents.pan?.url ?? null)} className="text-blue-600 hover:text-blue-700">
                              <Eye size={20} />
                            </button>
                          ) : "—"}
                        </TableCell>

                        <TableCell className="text-center">
                          {d.documents.rentAgreement?.url ? (
                            <button onClick={() => setPreview(d.documents.rentAgreement?.url ?? null)} className="text-blue-600 hover:text-blue-700">
                              <Eye size={20} />
                            </button>
                          ) : "—"}
                        </TableCell>

                        <TableCell className="text-center"><StatusBadge status={d.status} /></TableCell>

                        {/* ACCEPT + REJECT Buttons */}
                        <TableCell className="text-center flex items-center justify-center gap-2 py-3">

                          <button
                            disabled={d.status === "verified"}
                            onClick={() => updateStatus(d._id, "verified")}
                            className={`px-3 py-1 text-sm font-medium rounded-md text-white 
                            ${d.status === "verified" ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                          >
                            Accept
                          </button>

                          <button
                            disabled={d.status === "rejected"}
                            onClick={() => updateStatus(d._id, "rejected")}
                            className={`px-3 py-1 text-sm font-medium rounded-md text-white
                            ${d.status === "rejected" ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
                          >
                            Reject
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">No documents found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex justify-between mt-4">
            <p className="text-sm dark:text-gray-300">Page {currentPage} of {totalPages}</p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* 📌 Image Preview Modal */}
      <ModalWrapper isOpen={!!preview} onClose={() => setPreview(null)}>
        <h2 className="text-lg font-semibold mb-3 dark:text-white">Uploaded Document</h2>

        <div className="w-full max-h-[65vh] overflow-auto rounded-lg border p-2 bg-gray-100 dark:bg-gray-800">
          <img src={preview!} alt="Document" className="w-full rounded-lg" />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setPreview(null)}
            className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </ModalWrapper>
    </Fragment>
  );
};

export default DocumentTableOne;
