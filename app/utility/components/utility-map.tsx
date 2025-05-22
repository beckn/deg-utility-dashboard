"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { BaseIconOptions, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  AssetMarker,
  MeterWithTransformer,
  AssetType,
} from "../lib/types"; // Changed FeederData to AssetMarker, added AssetType
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { GetCustomMapMarker } from "../lib/utils/custom-icon";
interface UtilityMapProps {
  assets: AssetMarker[]; // Changed feeders to assets
  onSelectMeter?: (meter: MeterWithTransformer) => void;
}

export function UtilityMap({ assets, onSelectMeter }: UtilityMapProps) {
  // Changed feeders to assets
  const createAssetIcon = (
    type: AssetType,
    status: "Critical" | "Warning" | "Normal" = "Normal"
  ) => {
    let localType = type;
    let iconColor = "#2463EB"; // Default blue (Normal)
    let symbol = "❓";
    let showAnimate = false;

    if (status === "Critical") iconColor = "#ef4444"; // Red
    else if (status === "Warning") iconColor = "#f59e0b"; // Yellow

    switch (localType) {
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
            : "#10b981"; // Blue for normal transformer #2463EB
        showAnimate = status === "Critical";
        break;
      case "household":
        symbol = "🏠"; // House for household
        break;
      case "transformer_emergency_service":
        symbol = "🚨"; // Emergency service for emergency service
        iconColor =
          status === "Critical"
            ? "#ef4444"
            : status === "Warning"
            ? "#f59e0b"
            : "#10b981"; // "#DB4437" Blue for normal transformer #2463EB
        showAnimate = status === "Critical";
        break;
      default:
        symbol = "📍"; // Default pin
        break;
    }

    const iconDetails = GetCustomMapMarker({ type, color: iconColor, showAnimate });
    return new Icon(iconDetails as BaseIconOptions);
  };

  const centerLat =
    assets.length > 0
      ? assets.reduce((sum, asset) => sum + asset.coordinates[0], 0) /
        assets.length
      : 37.4419;

  const centerLng =
    assets.length > 0
      ? assets.reduce((sum, asset) => sum + asset.coordinates[1], 0) /
        assets.length
      : -122.143;

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
          icon={createAssetIcon(
            asset.type === "transformer" && asset.emergencyService
              ? "transformer_emergency_service"
              : asset.type,
            asset.status
          )}
        >
          {['transformer'].includes(asset.type) && <Popup>
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

              {/* {asset.type === "household" && onSelectMeter && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                   <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1 text-xs h-6"
                    onClick={() => {
                        // This needs to be tied to the actual MeterWithTransformer data for the control panel
                        // For now, we're passing a placeholder. This part needs actual meter data.
                        // The 'asset.id' for household is `house_${meter.meterId}`. We need to extract meterId.
                        const meterId = parseInt(asset.id.replace("house_", ""), 10)
                        const dummyMeter = { // This is a placeholder, ideally find the full meter data
                          meterId: meterId,
                          meterCode: asset.name,
                          ders: [],
                        } as unknown as MeterWithTransformer
                        onSelectMeter(dummyMeter)
                      }}
                  >
                    Control Panel
                  </Button>
                </div>
              )} */}
            </div>
          </Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}
