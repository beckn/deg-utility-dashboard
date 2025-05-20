"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AssetMarker, SimplifiedMeter, AssetType } from "../lib/types"; // Changed FeederData to AssetMarker, added AssetType
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";

interface UtilityMapProps {
  assets: AssetMarker[]; // Changed feeders to assets
  onSelectMeter?: (meter: SimplifiedMeter) => void;
  pingMarkers?: { lat: number; lng: number; type: string }[];
}

export function UtilityMap({
  assets,
  onSelectMeter,
  pingMarkers,
}: UtilityMapProps) {
  // Changed feeders to assets
  const createAssetIcon = (
    type: AssetType,
    status: "Critical" | "Warning" | "Normal" = "Normal"
  ) => {
    let iconColor = "#10b981"; // Default green (Normal)
    let symbol = "❓";

    if (status === "Critical") iconColor = "#ef4444"; // Red
    else if (status === "Warning") iconColor = "#f59e0b"; // Yellow

    switch (type) {
      case "substation":
        symbol = "⚡"; // Lightning for substation
        break;
      case "transformer":
        symbol = "T"; // T for transformer
        iconColor =
          status === "Critical"
            ? "#ef4444"
            : status === "Warning"
            ? "#f59e0b"
            : "#3b82f6"; // Blue for normal transformer
        break;
      case "household":
        symbol = "🏠"; // House for household
        iconColor =
          status === "Critical"
            ? "#ef4444"
            : status === "Warning"
            ? "#f59e0b"
            : "#10b981"; // Green for normal household
        break;
      default:
        symbol = "📍"; // Default pin
        break;
    }

    const svgString = `<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.2)"/></filter></defs><g filter="url(#shadow)"><path d="M20 5 C12 5 5 12 5 20 C5 24 10 30 20 40 C30 30 35 24 35 20 C35 12 28 5 20 5" fill="${iconColor}" stroke="white" strokeWidth="3"/><text x="20" y="24" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold">${symbol}</text></g></svg>`;

    return new Icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(svgString)}`,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    });
  };

  // Helper to create a ping icon for ping markers by type, styled like asset markers
  const createPingIcon = (type: string) => {
    let color = "#64748b";
    let symbol = "●";
    let iconSymbol = "❓";
    let border = "#fff";
    switch (type) {
      case "Substations":
        color = "#f59e42";
        iconSymbol = "⚡";
        break;
      case "Transformers":
        color = "#38bdf8";
        iconSymbol = "T";
        break;
      case "Households":
        color = "#4ade80";
        iconSymbol = "🏠";
        break;
      case "DER's":
        color = "#f472b6";
        iconSymbol = "⬤";
        break;
      case "All":
        color = "#64748b";
        iconSymbol = "●";
        break;
      default:
        color = "#64748b";
        iconSymbol = "❓";
    }
    // Make ping marker slightly different: add a thicker white border
    const svgString = `<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/></filter></defs><g filter="url(#shadow)"><path d="M20 5 C12 5 5 12 5 20 C5 24 10 30 20 40 C30 30 35 24 35 20 C35 12 28 5 20 5" fill="${color}" stroke="${border}" stroke-width="5"/><text x="20" y="24" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${iconSymbol}</text></g></svg>`;
    return new Icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(svgString)}`,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
    });
  };

  // Calculate map center: prefer pingMarkers, then assets, then default
  let centerLat = 37.7749; // Default San Francisco
  let centerLng = -122.4194;
  if (pingMarkers && pingMarkers.length > 0) {
    centerLat =
      pingMarkers.reduce((sum, m) => sum + m.lat, 0) / pingMarkers.length;
    centerLng =
      pingMarkers.reduce((sum, m) => sum + m.lng, 0) / pingMarkers.length;
  } else if (assets.length > 0) {
    centerLat =
      assets.reduce((sum, asset) => sum + asset.coordinates[0], 0) /
      assets.length;
    centerLng =
      assets.reduce((sum, asset) => sum + asset.coordinates[1], 0) /
      assets.length;
  }

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={12}
      className="h-full w-full rounded-lg z-10"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {assets.map((asset) => (
        <Marker
          key={asset.id}
          position={asset.coordinates}
          icon={createAssetIcon(asset.type, asset.status)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-gray-800 mb-1 text-base">
                {asset.name}
              </h3>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{asset.type}</span>
                </div>
                {/* Add other relevant details based on asset type if needed */}
                {/* For example, load for substations/transformers, DER info for households */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={asset.status || "Normal"} size="sm" />
                </div>
                {asset.type === "household" && asset.hasDers && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DERs:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                )}
              </div>

              {asset.type === "household" && onSelectMeter && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1 text-xs h-6"
                    onClick={() => {
                      // This needs to be tied to the actual SimplifiedMeter data for the control panel
                      // For now, we're passing a placeholder. This part needs actual meter data.
                      // The 'asset.id' for household is `house_${meter.meterId}`. We need to extract meterId.
                      const meterId = parseInt(
                        asset.id.replace("house_", ""),
                        10
                      );
                      const dummyMeter = {
                        // This is a placeholder, ideally find the full meter data
                        meterId: meterId,
                        meterCode: asset.name,
                        ders: [],
                      } as unknown as SimplifiedMeter;
                      onSelectMeter(dummyMeter);
                    }}
                  >
                    Control Panel
                  </Button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render ping markers for the selected tab */}
      {pingMarkers &&
        pingMarkers.map((marker, idx) => (
          <Marker
            key={`ping-${idx}`}
            position={[marker.lat, marker.lng]}
            icon={createPingIcon(marker.type)}
          >
            <Popup>
              Ping: {marker.type} ({marker.lat.toFixed(4)},{" "}
              {marker.lng.toFixed(4)})
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
