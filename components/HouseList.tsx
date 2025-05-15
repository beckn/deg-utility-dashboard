// components/HouseList.tsx
import { useSimplifiedData } from "@/lib/useSimplifiedData";
import React from "react";

const HouseList = () => {
  const { data: houses, selectedHouse, setSelectedHouse } = useSimplifiedData()

  const getStatusColor = (value: number, limit: number) => {
    const ratio = value / limit;
    if (ratio >= 0.9) {
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${"bg-red-500 text-white"}`}
        >
          Critical
        </span>
      )
    } if (ratio >= 0.7) {
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${"bg-yellow-500 text-white"}`}
        >
          Warning
        </span>

      )
    }
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${"bg-green-500 text-white"}`}
      >
        Normal
      </span>

    )
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Houses</h2>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="space-y-4 p-2">
          {houses.map((house) => (
            <div
              key={house.id}
              onClick={() => setSelectedHouse(house)}
              className={`p-4 bg-white/90 rounded-lg cursor-pointer transition-all hover:bg-white shadow-sm ${selectedHouse?.id === house.id ? "ring-2 ring-blue-500 scale-105" : ""
                }`}
            >
              <h3 className="font-semibold text-gray-800 mb-2">{house.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Meter Code</span>
                  <span className="font-medium">{house.meterCode} MW</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Capacity</span>
                  <span className="font-medium">{house.max_capacity_KW} MW</span>
                </div>
                <div className="flex justify-between">
                  <span>Total DER's</span>
                  <span className="font-medium">{house.ders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-medium">{house.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  {getStatusColor(1, house.max_capacity_KW ?? 1)}
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
