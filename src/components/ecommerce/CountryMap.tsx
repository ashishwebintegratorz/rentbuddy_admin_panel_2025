import { useState, useEffect } from "react";
import { VectorMap } from "@react-jvectormap/core";
import { inMill } from "@react-jvectormap/india";

// State coordinates mapping
const stateCoordinates: Record<string, [number, number]> = {
  gujarat: [22.2587, 71.1924],
  "madhya pradesh": [22.9734, 78.6569],
  maharashtra: [19.7515, 75.7139],
  rajasthan: [27.0238, 74.2179],
  "uttar pradesh": [26.8467, 80.9462],
  karnataka: [15.3173, 75.7139],
  "tamil nadu": [11.1271, 78.6569],
  "andhra pradesh": [15.9129, 79.7400],
  telangana: [18.1124, 79.0193],
  kerala: [10.8505, 76.2711],
  "west bengal": [22.9868, 87.8550],
  punjab: [31.1471, 75.3412],
  haryana: [29.0588, 76.0856],
  bihar: [25.0961, 85.3131],
  odisha: [20.9517, 85.0985],
  "himachal pradesh": [31.1048, 77.1734],
  uttarakhand: [30.0668, 79.0193],
  jharkhand: [23.6102, 85.2799],
  chhattisgarh: [21.2787, 81.8661],
  assam: [26.2006, 92.9376],
  goa: [15.2993, 74.1240],
};

// Normalize state name
const normalizeStateName = (name: string): string => {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
};

interface OrderData {
  name: string;
  ordersCount: number;
  totalProducts: number;
  totalAmount: number;
}

interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  const [ordersData, setOrdersData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/orders/orders-by-state"
      );
      const result = await response.json();
      if (result.success) {
        setOrdersData(result.data);
      }
    } catch (error) {
      console.error("Error fetching orders data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate orders by state (handling duplicates and variations)
  const aggregatedData = ordersData.reduce((acc, item) => {
    const normalizedName = normalizeStateName(item.name);
    
    // Skip invalid state names
    if (normalizedName === "state" || normalizedName === "india" || normalizedName === "mp") {
      return acc;
    }

    if (!acc[normalizedName]) {
      acc[normalizedName] = {
        name: item.name,
        ordersCount: 0,
        totalProducts: 0,
        totalAmount: 0,
      };
    }

    acc[normalizedName].ordersCount += item.ordersCount;
    acc[normalizedName].totalProducts += item.totalProducts;
    acc[normalizedName].totalAmount += item.totalAmount;

    return acc;
  }, {} as Record<string, OrderData>);

  // Convert to markers
  const markers = Object.entries(aggregatedData)
    .map(([key, data]) => {
      const coords = stateCoordinates[key];
      if (!coords) return null;

      return {
        latLng: coords,
        name: `${data.name}\nOrders: ${data.ordersCount}\nProducts: ${data.totalProducts}\nAmount: ₹${data.totalAmount.toFixed(2)}`,
        style: {
          fill: "#465FFF",
          r: Math.max(4, Math.min(data.ordersCount / 5, 15)), // Dynamic marker size
        },
      };
    })
    .filter(Boolean) as any[];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-10">
      <style>
        {`
          .jvectormap-tip {
            z-index: 100 !important;
          }
        `}
      </style>
      <VectorMap
        map={inMill}
        backgroundColor="transparent"
        containerStyle={{
          width: "100%",
          height: "100%",
        }}
        containerClassName="relative z-10"
        markerStyle={{
          initial: {
            fill: "#465FFF",
            stroke: "#ffffff",
            "stroke-width": 2,
            "stroke-opacity": 1,
            r: 6,
          },
          hover: {
            fill: "#2E47D9",
            cursor: "pointer",
            r: 8,
          },
        }}
        markers={markers}
      />
      
      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Orders by State</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {Object.entries(aggregatedData)
            .sort((a, b) => b[1].ordersCount - a[1].ordersCount)
            .slice(0, 6)
            .map(([key, data]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#465FFF]"></div>
                <span className="font-medium">{data.name}:</span>
                <span className="text-gray-600">{data.ordersCount} orders</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CountryMap;