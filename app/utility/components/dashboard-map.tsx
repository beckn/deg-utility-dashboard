"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { AssetMarker, MeterWithTransformer } from "../lib/types";

const DynamicUtilityMap = dynamic(
  () => import("./utility-map").then((mod) => mod.UtilityMap),
  {
    ssr: false,
    loading: () => <LoadingMap />,
  }
);

interface DashboardMapProps {
  assets: AssetMarker[];
  filter: string;
  onSelectMeter?: (meter: MeterWithTransformer) => void;
}

const LoadingMap = () => (
  <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-gray-500 text-sm">Loading map...</p>
    </div>
  </div>
);

export function DashboardMap({
  assets,
  filter,
  onSelectMeter,
}: DashboardMapProps) {
  const [isClient, setIsClient] = useState(false);

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

  const filteredAssets = assets.filter((asset) => {
    switch (filter) {
      case "Substations":
        return asset.type === "substation";
      case "Transformers":
        return asset.type === "transformer";
      case "Households":
        return asset.type === "household";
      default:
        return false;
    }
  });

  return filteredAssets.length > 0 ? (
    <DynamicUtilityMap
      assets={filteredAssets}
      onSelectMeter={onSelectMeter}
    />
  ) : (
    <LoadingMap />
  );
}
