"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { House } from "@/types";
import "leaflet/dist/leaflet.css";

interface MapProps {
  houses: House[];
  onHouseSelect: (house: House) => void;
  selectedHouse: House | null;
}

const Map: React.FC<MapProps> = ({ houses, onHouseSelect, selectedHouse }) => {
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
        center={[37.4419, -122.143]}
        zoom={15}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {houses.map((house) => (
          <Marker
            key={house.id}
            position={house.coordinates}
            icon={createIcon(house.status)}
            eventHandlers={{
              click: () => onHouseSelect(house),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{house.name}</h3>
                <p className="text-sm text-gray-600">
                  Load: {house.currentLoad} MW
                </p>
                <p className="text-sm text-gray-600">Status: {house.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
