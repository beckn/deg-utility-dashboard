"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ControlPanel from "@/components/ControlPanel";
import HouseList from "@/components/HouseList";
import { Menu } from "lucide-react";
import { useSimplifiedData } from "@/lib/useSimplifiedData";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

const Page = () => {
  const { data: simplifiedData, fetchAndStore } = useSimplifiedData();

  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    fetchAndStore();

  }, []);

  const handleHouseSelect = (house: House) => {
    setSelectedHouse(house);
  };

  const handleApplySettings = async (updatedHouse: House) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSelectedHouse(null);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-transparent">
        <div className="flex items-center space-x-2">
          <Menu className="w-6 h-6 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-800">
            Aggregators Dashboard
          </h1>
        </div>
        <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">A</span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - House List */}
        <div className="w-80 bg-white/70 backdrop-blur-sm rounded-lg mx-4 my-2 p-4 shadow-lg">
          <HouseList />
        </div>

        {/* Main Content - Map */}
        <div className="flex-1 mx-4 my-2">
          <MapComponent/>
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
