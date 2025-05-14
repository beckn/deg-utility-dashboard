// components/MapWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";

interface Feeder {
  id: string;
  name: string;
  region: string;
  currentLoad: number;
  status: "Critical" | "Warning" | "Normal";
  coordinates: [number, number];
}

interface MapWrapperProps {
  feeders: Feeder[];
}

// Dynamically import the map with no SSR
const DynamicMap = dynamic(() => import("./UtilityMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

const MapWrapper: React.FC<MapWrapperProps> = ({ feeders }) => {
  return <DynamicMap feeders={feeders} />;
};

export default MapWrapper;
