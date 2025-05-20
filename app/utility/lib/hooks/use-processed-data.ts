"use client";

import { useMemo } from "react";
import { useSimplifiedUtilDataStore } from "../stores/utility-store";
import type {
  AssetMarker,
  TransformerSummaryItem,
  StrapiMeter,
  StrapiSubstation,
  StrapiTransformer,
} from "../types";

// Helper to calculate status
const calculateStatus = (
  currentLoad: number,
  capacity: number
): "Critical" | "Warning" | "Normal" => {
  if (capacity === 0) return "Normal"; // Avoid division by zero
  const loadPercentage = (currentLoad / capacity) * 100;
  if (loadPercentage > 85) return "Critical";
  if (loadPercentage > 60) return "Warning";
  return "Normal";
};

export function useProcessedData() {
  const { data } = useSimplifiedUtilDataStore();
  const { substations = [], transformers = [], meters = [] } = data || {};

  return useMemo(() => {
    if (!meters || meters.length === 0) {
      return {
        allAssets: [],
        systemMetrics: {
          der: { current: 0, peak: 0, total: 0 },
          load: { current: 0, peak: 0, total: 0 },
          mitigation: { current: 0, peak: 0, total: 0 },
        },
        transformerSummaries: [],
      };
    }

    const allAssets: AssetMarker[] = [];
    let overallTotalCapacity = 0;
    let overallTotalCurrentLoad = 0;
    let overallTotalActiveDers = 0;
    let overallTotalMetersCount = meters.length;

    // 1. Process Substations (from substations array)
    substations.forEach((sub) => {
      if (sub.latitude && sub.longtitude) {
        allAssets.push({
          id: `sub_${sub.id}`,
          name: sub.name,
          type: "substation",
          coordinates: [parseFloat(sub.latitude), parseFloat(sub.longtitude)],
          status: "Normal", // You can calculate status if needed
        });
      }
    });

    // 2. Process Transformers (from transformers array)
    const transformerSummaries: TransformerSummaryItem[] = [];
    if (transformers.length > 0) {
      transformers.forEach((tr) => {
        // Use first meter's coordinates as proxy for transformer location
        if (tr.latitude && tr.longtitude) {
          allAssets.push({
            id: `trans_${tr.id}`,
            name: tr.name,
            type: "transformer",
            coordinates: [
              parseFloat(String(tr.latitude)),
              parseFloat(String(tr.longtitude)),
            ],
            status: tr.status, // You can calculate status if needed
          });
        }
        transformerSummaries.push({
          id: tr.id.toString(),
          name: tr.name,
          substationName: "", // Fill if needed
          city: tr.city,
          currentLoad: tr.currentLoad || 0,
          status: tr.status || "Normal",
          metersCount: tr.meters ? tr.meters.length : 0,
          maxCapacity: tr.max_capacity_KW,
          margin: tr.margin || 0,
        });
      });
    }

    // 3. Process Households (Meters)
    meters.forEach((meter) => {
      if (meter.latitude && meter.longitude) {
        const lat =
          typeof meter.latitude === "number"
            ? meter.latitude
            : parseFloat(meter.latitude);
        const lng =
          typeof meter.longitude === "number"
            ? meter.longitude
            : parseFloat(meter.longitude);
        allAssets.push({
          id: `house_${meter.id}`,
          name: meter.code,
          type: "household",
          coordinates: [lat, lng],
          status: "Normal", // You can calculate status if needed
          hasDers: meter.ders && meter.ders.length > 0,
        });
      }
    });

    // --- Calculate System Metrics (optional, can be improved) ---
    const systemMetrics = {
      der: { current: 0, peak: 0, total: 0 },
      load: { current: 0, peak: 0, total: 0 },
      mitigation: { current: 0, peak: 0, total: 0 },
    };

    return {
      allAssets,
      systemMetrics,
      transformerSummaries,
    };
  }, [substations, transformers, meters]);
}
