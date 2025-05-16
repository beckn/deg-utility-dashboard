"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSimplifiedData } from "@/lib/useSimplifiedData";

const MapComponent = () => {
  const { data: houses, setSelectedHouse } = useSimplifiedData()
  // Create custom icons for different statuses
  const createIcon = (status: string) => {
    const iconColor =
      status === "Critical" ? "red" : status === "Warning" ? "yellow" : "blue";

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${
            iconColor === "red"
              ? "#ef4444"
              : iconColor === "yellow"
              ? "#eab308"
              : "#3b82f6"
          }" stroke="white" stroke-width="2"/>
          <svg x="9" y="9" width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L14.09 8.26L20 9L14.5 14.74L15.82 20.72L12 18.27L8.18 20.72L9.5 14.74L4 9L9.91 8.26L12 2"/>
          </svg>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  

  return (
    <div className="h-full w-full bg-white/70 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      <MapContainer
        center={[37.76, -122.42]}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {houses.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
          </div>
        )}
        {houses.map((house) => (
          <Marker
            key={house.id}
            position={house.coordinates}
            icon={createIcon(house.state ?? "Normal")}
            eventHandlers={{
              click: () => setSelectedHouse(house),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{house.name}</h3>
                <p className="text-sm text-gray-600">
                  Load: {house.max_capacity_KW} MW
                </p>
                <p className="text-sm text-gray-600">Status: {house.meterCode}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
