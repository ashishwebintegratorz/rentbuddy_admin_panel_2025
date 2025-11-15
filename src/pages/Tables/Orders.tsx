import React from "react";
import OrderTableOne from "../../components/tables/OrderTableOne";

const Orders = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Orders
      </h1>
      <OrderTableOne />
    </div>
  );
};

export default Orders;
