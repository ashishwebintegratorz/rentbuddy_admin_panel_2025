import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import BasicTables from "./pages/Tables/BasicTables";
import Customers from "./pages/Tables/Customers";
import Orders from "./pages/Tables/Orders";
import Barcode from "./pages/Tables/Barcode";
import Subscription from "./pages/Tables/Subscription";
import Payments from "./pages/Tables/Payments";
import Invoice from "./pages/Tables/Invoice";
import Document from "./pages/Tables/Document";
import Recurring from "./pages/Tables/Recurring";
import Repair from "./pages/Tables/Repair";
import Track from "./pages/Tables/Track";
import Complaint from "./pages/Tables/Complaint";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Product from "./pages/Tables/Product";
import RentalHistoryTable from "./pages/Tables/RentHistoryTable";
import InvoiceDetail from "./components/tables/InvoiceDetail";
import ProtectedRoute from "./components/protected/ProtectedRoutes";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />



            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/customers" element={<ProtectedRoute allowedRoles={["admin","customer manager"]}><Customers /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute allowedRoles={["admin","Order manager"]}><Orders /></ProtectedRoute>} />
            <Route path="/barcode" element={<ProtectedRoute allowedRoles={["admin","Product manager"]}><Barcode /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute allowedRoles={["admin","Product manager"]}><Product /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute allowedRoles={["admin","Order manager"]}><Subscription /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute allowedRoles={["admin","Finance manager"]}><Payments /></ProtectedRoute>} />
            <Route path="/invoice" element={<ProtectedRoute allowedRoles={["admin","Finance manager"]}><Invoice /></ProtectedRoute>} />
             <Route path="/invoice/:id" element={<ProtectedRoute allowedRoles={["admin","Finance manager"]}><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute allowedRoles={["admin","Finance manager"]}><Document /></ProtectedRoute>} />
            <Route path="/recurring" element={<ProtectedRoute allowedRoles={["admin","Order manager"]}><Recurring /></ProtectedRoute>} />
            <Route path="/repair" element={<ProtectedRoute allowedRoles={["admin","Order manager"]}><Repair /></ProtectedRoute>} />
            <Route path="/track" element={<ProtectedRoute allowedRoles={["admin","Product manager"]}><Track /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute allowedRoles={["admin","customer manager"]}><Complaint /></ProtectedRoute>} />
            <Route path="/rent-history" element={<ProtectedRoute allowedRoles={["admin","customer manager"]}>< RentalHistoryTable/></ProtectedRoute>} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
