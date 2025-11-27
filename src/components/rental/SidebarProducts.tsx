import React from "react";

interface SidebarProduct {
  productID: string;
  productName: string;
  rentalPrice: number;
}

interface Props {
  products: SidebarProduct[];
  selectedProductID: string | null;
  onSelectProduct: (id: string) => void;
}

const SidebarProducts: React.FC<Props> = ({
  products,
  selectedProductID,
  onSelectProduct,
}) => {
  return (
    <aside className=" rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4 h-[82vh] overflow-y-auto table-scrollbar">
      <h2 className="text-lg font-semibold mb-3 text-gray-dark dark:text-white">Products</h2>
      <ul className="space-y-2">
        {products.map((p) => {
          const active = p.productID === selectedProductID;
          return (
            <li key={p.productID}>
              <button
                onClick={() => onSelectProduct(p.productID)}
                className={`w-full text-left px-3 py-2 rounded-md border transition
                  ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-transparent text-gray-800 dark:text-gray-100 border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  }`}
              >
                <div className="font-medium text-sm">{p.productName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Rent: ₹{p.rentalPrice.toFixed(2)}
                </div>
              </button>
            </li>
          );
        })}
        {products.length === 0 && (
          <li className="text-sm text-gray-500 italic">No products found.</li>
        )}
      </ul>
    </aside>
  );
};

export default SidebarProducts;
