import React from "react";
import CustomerTableOne from "../../components/tables/CustomerTableOne";
import ComplaintTableOne from "../../components/tables/ComplaintTableOne";

const Customers = () => {
  return (
    
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-black dark:text-white">Complaints</h1>
      <div className="p-4 h-screen flex flex-col w-full max-w-full overflow-x-hidden overflow-y-auto">
      <ComplaintTableOne />
      </div>
    </div>
  );
};

export default Customers;
