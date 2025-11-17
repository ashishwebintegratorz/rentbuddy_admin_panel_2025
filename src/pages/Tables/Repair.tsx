import React from "react";
import RepairTableOne from "../../components/tables/RepairTableOne";

const Repair: React.FC = () => {
  return (
    <div className="p-4 h-screen flex flex-col min-w-0 overflow-x-hidden">
      <RepairTableOne />
    </div>
  );
};

export default Repair;
