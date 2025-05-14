"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Feeder {
  id: string;
  name: string;
  region: string;
  currentLoad: number;
  status: "Critical" | "Warning" | "Normal";
  coordinates: [number, number];
}

interface UtilityMapProps {
  feeders: Feeder[];
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

  // Create custom icons for different types that match the image
  const createIcon = (type: string, status?: string) => {
    let iconColor = "#3b82f6"; // Default blue
    let symbol = "";

    if (type === "DER") {
      iconColor = "#10b981"; // Green
      symbol = "⚡"; // Lightning for DER
    } else if (type === "household") {
      iconColor = "#06b6d4"; // Cyan/Teal
      symbol = "🏠"; // House for household
    } else if (type === "substation") {
      iconColor = "#eab308"; // Yellow/Golden
      symbol = "▣"; // Box for substation
    } else {
      // Feeder - Green with lightning
      iconColor = "#10b981";
      symbol = "⚡";
    }

    if (status) {
      if (status === "Critical") iconColor = "#ef4444";
      else if (status === "Warning") iconColor = "#f59e0b";
    }

    // Create SVG icons that match the image style
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
                font-weight="bold">${symbol}</text>
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

  // Mock data for different asset types positioned around Stanford University
  const derAssets = [
    {
      id: "der1",
      name: "Solar Farm 1",
      type: "DER",
      coordinates: [37.435, -122.155] as [number, number],
    },
    {
      id: "der2",
      name: "Solar Farm 2",
      type: "DER",
      coordinates: [37.44, -122.135] as [number, number],
    },
    {
      id: "der3",
      name: "Solar Farm 3",
      type: "DER",
      coordinates: [37.445, -122.165] as [number, number],
    },
  ];

  const households = [
    {
      id: "h1",
      name: "Residential Area 1",
      type: "household",
      coordinates: [37.43, -122.145] as [number, number],
    },
    {
      id: "h2",
      name: "Residential Area 2",
      type: "household",
      coordinates: [37.448, -122.148] as [number, number],
    },
  ];

  const substations = [
    {
      id: "s1",
      name: "Main Substation",
      type: "substation",
      coordinates: [37.438, -122.143] as [number, number],
    },
    {
      id: "s2",
      name: "Substation 2",
      type: "substation",
      coordinates: [37.442, -122.152] as [number, number],
    },
    {
      id: "s3",
      name: "Substation 3",
      type: "substation",
      coordinates: [37.439, -122.162] as [number, number],
    },
    {
      id: "s4",
      name: "Substation 4",
      type: "substation",
      coordinates: [37.43, -122.175] as [number, number],
    },
  ];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[37.4419, -122.143]}
        zoom={14}
        className="h-full w-full"
      >
        {/* Light/white themed tile layer - showing only roads and buildings */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Custom CSS for even lighter appearance */}
        <style jsx>{`
          .leaflet-container {
            background: #f8fafc !important;
          }
        `}</style>

        {/* Feeder markers - Green lightning icons */}
        {feeders &&
          feeders.length > 0 &&
          feeders.map((feeder) => (
            <Marker
              key={feeder.id}
              position={feeder.coordinates}
              icon={createIcon("feeder", feeder.status)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{feeder.name}</h3>
                  <p className="text-sm text-gray-600">
                    Region: {feeder.region}
                  </p>
                  <p className="text-sm text-gray-600">
                    Load: {feeder.currentLoad}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {feeder.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* DER assets - Green lightning icons */}
        {derAssets.map((asset) => (
          <Marker
            key={asset.id}
            position={asset.coordinates}
            icon={createIcon(asset.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{asset.name}</h3>
                <p className="text-sm text-gray-600">Type: DER Asset</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Households - Cyan house icons */}
        {households.map((house) => (
          <Marker
            key={house.id}
            position={house.coordinates}
            icon={createIcon(house.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{house.name}</h3>
                <p className="text-sm text-gray-600">Type: Household</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Substations - Yellow/Golden box icons */}
        {substations.map((substation) => (
          <Marker
            key={substation.id}
            position={substation.coordinates}
            icon={createIcon(substation.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{substation.name}</h3>
                <p className="text-sm text-gray-600">Type: Substation</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default UtilityMap;
