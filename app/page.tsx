"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { House, DER } from "@/types/grid";
import ControlPanel from "@/components/ControlPanel";
import HouseList from "@/components/HouseList";

// Dynamically import map to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const Page = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockHouses: House[] = [
      {
        id: 1,
        name: "House - 1",
        currentLoad: 1.07,
        totalDERs: 4,
        status: "Critical",
        coordinates: [37.4419, -122.143],
        ders: [
          { id: 1, name: "DER 1", currentLoad: 1, isEnabled: true },
          { id: 2, name: "DER 2", currentLoad: 2, isEnabled: true },
          { id: 3, name: "DER 3", currentLoad: 3, isEnabled: true },
        ],
      },
      {
        id: 2,
        name: "House - 2",
        currentLoad: 0.85,
        totalDERs: 3,
        status: "Warning",
        coordinates: [37.4389, -122.1436],
        ders: [
          { id: 1, name: "DER 1", currentLoad: 1.5, isEnabled: true },
          { id: 2, name: "DER 2", currentLoad: 1.2, isEnabled: true },
        ],
      },
      {
        id: 3,
        name: "House - 3",
        currentLoad: 1.45,
        totalDERs: 2,
        status: "Warning",
        coordinates: [37.435, -122.144],
        ders: [
          { id: 1, name: "DER 1", currentLoad: 0.8, isEnabled: true },
          { id: 2, name: "DER 2", currentLoad: 0.9, isEnabled: true },
        ],
      },
      {
        id: 4,
        name: "House - 4",
        currentLoad: 0.55,
        totalDERs: 5,
        status: "Normal",
        coordinates: [37.438, -122.146],
        ders: [{ id: 1, name: "DER 1", currentLoad: 0.5, isEnabled: true }],
      },
      {
        id: 5,
        name: "House - 5",
        currentLoad: 0.55,
        totalDERs: 5,
        status: "Normal",
        coordinates: [37.436, -122.147],
        ders: [{ id: 1, name: "DER 1", currentLoad: 0.4, isEnabled: true }],
      },
      {
        id: 6,
        name: "House - 6",
        currentLoad: 0.55,
        totalDERs: 5,
        status: "Normal",
        coordinates: [37.434, -122.148],
        ders: [{ id: 1, name: "DER 1", currentLoad: 0.3, isEnabled: true }],
      },
    ];
    setHouses(mockHouses);
  }, []);

  const handleHouseSelect = (house: House) => {
    setSelectedHouse(house);
  };

  const handleApplySettings = async (updatedHouse: House) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Update the house status to Normal after applying settings
      const updatedHouses = houses.map((h) =>
        h.id === updatedHouse.id
          ? { ...updatedHouse, status: "Normal" as const }
          : h
      );
      setHouses(updatedHouses);
      setSelectedHouse(null);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-transparent">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-black rounded"></div>
          <h1 className="text-lg font-semibold text-gray-800">
            Utility Monitoring System
          </h1>
        </div>
        <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - House List */}
        <div className="w-80 bg-white/70 backdrop-blur-sm rounded-lg mx-4 my-2 p-4 shadow-lg">
          <HouseList
            houses={houses}
            onHouseSelect={handleHouseSelect}
            selectedHouse={selectedHouse}
          />
        </div>

        {/* Main Content - Map */}
        <div className="flex-1 mx-4 my-2">
          <Map
            houses={houses}
            onHouseSelect={handleHouseSelect}
            selectedHouse={selectedHouse}
          />
        </div>
      </div>

      {/* Control Panel Modal */}
      {selectedHouse && (
        <ControlPanel
          house={selectedHouse}
          isLoading={isLoading}
          onClose={() => setSelectedHouse(null)}
          onApplySettings={handleApplySettings}
        />
      )}
    </div>
  );
};

export default Page;
