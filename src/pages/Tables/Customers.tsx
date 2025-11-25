import React from "react";
import CustomerTableOne from "../../components/tables/CustomerTableOne";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const Customers = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Customer" />
      <div className="space-y-6">
        <CustomerTableOne />
      </div>
    </>
  );
};

export default Customers;
