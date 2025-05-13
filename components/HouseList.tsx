// components/HouseList.tsx
import React from "react";
import { House } from "@/types";

interface HouseListProps {
  houses: House[];
  onHouseSelect: (house: House) => void;
  selectedHouse: House | null;
}

const HouseList: React.FC<HouseListProps> = ({
  houses,
  onHouseSelect,
  selectedHouse,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-red-500 text-white";
      case "Warning":
        return "bg-yellow-500 text-white";
      case "Normal":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Houses</h2>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="space-y-4 pr-2">
          {houses.map((house) => (
            <div
              key={house.id}
              onClick={() => onHouseSelect(house)}
              className={`p-4 bg-white/90 rounded-lg cursor-pointer transition-all hover:bg-white shadow-sm ${
                selectedHouse?.id === house.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <h3 className="font-semibold text-gray-800 mb-2">{house.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Current Load</span>
                  <span className="font-medium">{house.currentLoad} MW</span>
                </div>
                <div className="flex justify-between">
                  <span>Total DER's</span>
                  <span className="font-medium">{house.totalDERs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      house.status
                    )}`}
                  >
                    {house.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HouseList;
