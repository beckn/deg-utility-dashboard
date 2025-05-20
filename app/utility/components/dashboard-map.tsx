"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { AssetMarker, SimplifiedMeter } from "../lib/types"; // Changed FeederData to AssetMarker

interface DashboardMapProps {
  assets: AssetMarker[]; // Changed feeders to assets
  filter: string;
  onSelectMeter?: (meter: SimplifiedMeter) => void;
  pingMarkers?: { lat: number; lng: number; type: string }[];
}

export function DashboardMap({
  assets,
  filter,
  onSelectMeter,
  pingMarkers,
}: DashboardMapProps) {
  // Changed feeders to assets
  const [isClient, setIsClient] = useState(false);

  // Import the map component dynamically to avoid SSR issues with Leaflet
  const DynamicUtilityMap = dynamic(
    () => import("./utility-map").then((mod) => mod.UtilityMap),
    {
      ssr: false,
      loading: () => (
        <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      ),
    }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Initializing map...</p>
      </div>
    );
  }

  // Filter assets based on selected filter
  const filteredAssets = assets.filter((asset) => {
    if (filter === "All") return true;
    if (filter === "Substations") return asset.type === "substation";
    if (filter === "Transformers") return asset.type === "transformer";
    if (filter === "Households") return asset.type === "household";
    if (filter === "DER's") return asset.type === "household" && asset.hasDers;
    return false; // Should not happen if filter values are controlled
  });

  return (
    <DynamicUtilityMap
      assets={filteredAssets}
      onSelectMeter={onSelectMeter}
      pingMarkers={pingMarkers}
    />
  );
}
