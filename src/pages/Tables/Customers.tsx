import React from "react";
import CustomerTableOne from "../../components/tables/CustomerTableOne";

const Customers = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-black dark:text-white">Customers</h1>
      <CustomerTableOne />
    </div>
  );
};

export default Customers;
