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
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/barcode" element={<Barcode />} />
            <Route path="/products" element={<Product />} />
            <Route path="/subscriptions" element={<Subscription />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/invoice" element={<Invoice />} />
             <Route path="/invoice/:id" element={<InvoiceDetail />} />
            <Route path="/documents" element={<Document />} />
            <Route path="/recurring" element={<Recurring />} />
            <Route path="/repair" element={<Repair />} />
            <Route path="/track" element={<Track />} />
            <Route path="/complaints" element={<Complaint />} />
            <Route path="/rent-history" element={< RentalHistoryTable/>} />
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
