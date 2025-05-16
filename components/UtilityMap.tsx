// components/UtilityMap.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

interface UtilityMapProps {
  feeders: FeederData[];
  // substations?: Substation[];
  // households?: Meter[];
}

const UtilityMap: React.FC<UtilityMapProps> = ({ feeders = [] }) => {
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

  const createSubstationIcon = (status: "Critical" | "Warning" | "Normal") => {
    let iconColor = "#10b981"; // Default green
    if (status === "Critical") iconColor = "#ef4444"; // Red
    else if (status === "Warning") iconColor = "#f59e0b"; // Yellow

    const svgString = `
      <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <path d="M20 5 C12 5 5 12 5 20 C5 24 10 30 20 40 C30 30 35 24 35 20 C35 12 28 5 20 5" 
                fill="${iconColor}" 
                stroke="white" 
                stroke-width="3"/>
          <text x="20" y="24" 
                text-anchor="middle" 
                fill="white" 
                font-family="Arial, sans-serif" 
                font-size="16" 
                font-weight="bold">⚡</text>
        </g>
      </svg>
    `;

    return new Icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(svgString)}`,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    });
  };

  // Calculate map center based on all substations
  const centerLat = feeders.length > 0 
    ? feeders.reduce((sum, feeder) => sum + feeder.coordinates[0], 0) / feeders.length
    : 37.4419;
  const centerLng = feeders.length > 0
    ? feeders.reduce((sum, feeder) => sum + feeder.coordinates[1], 0) / feeders.length
    : -122.143;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Substation markers */}
        {feeders.map((feeder) => (
          <Marker
            key={feeder.id}
            position={feeder.coordinates}
            icon={createSubstationIcon(feeder.status)}
          >
            <Popup>
              <div className="p-3 min-w-48">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {feeder.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium">{feeder.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Load:</span>
                    <span className="font-medium">{feeder.currentLoad}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Meters:</span>
                    <span className="font-medium">{feeder.meters.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      feeder.status === "Critical" ? "bg-red-500 text-white" :
                      feeder.status === "Warning" ? "bg-yellow-500 text-white" :
                      "bg-green-500 text-white"
                    }`}>
                      {feeder.status}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Critical meters: {feeder.meters.filter(m => m.status === "Critical").length}
                    </p>
                    <p className="text-xs text-gray-500">
                      Warning meters: {feeder.meters.filter(m => m.status === "Warning").length}
                    </p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default UtilityMap;