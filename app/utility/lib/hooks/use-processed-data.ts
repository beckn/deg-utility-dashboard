"use client";

import { useMemo } from "react";
import { useSimplifiedUtilDataStore } from "../stores/utility-store";
import type {
  AssetMarker,
  TransformerSummaryItem,
  SimplifiedMeter,
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
  const { data: rawData } = useSimplifiedUtilDataStore();

  return useMemo(() => {
    if (!rawData || rawData.length === 0) {
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

    // For calculating overall system metrics
    let overallTotalCapacity = 0;
    let overallTotalCurrentLoad = 0;
    let overallTotalActiveDers = 0; // Renamed from overallTotalActiveMeters for clarity with DERs
    let overallTotalMetersCount = rawData.length;

    // 1. Process Substations
    const substationDataMap = new Map<
      string,
      {
        info: SimplifiedMeter; // First meter encountered for this substation, for its details
        meters: SimplifiedMeter[]; // All meters under this substation
        totalLoad: number;
        totalCapacity: number;
      }
    >();

    rawData.forEach((meter) => {
      const key = meter.substationId.toString();
      if (!substationDataMap.has(key)) {
        substationDataMap.set(key, {
          info: meter,
          meters: [],
          totalLoad: 0,
          totalCapacity: 0,
        });
      }
      const entry = substationDataMap.get(key)!;
      entry.meters.push(meter);
      // Note: meter specific load calculation will be done when processing households
      // For substation/transformer status, we sum up meter capacities and their individual loads.
      const meterCurrentLoad = Math.round(
        meter.meterMaxCapacityKW *
          meter.meterConsumptionLoadFactor *
          (0.3 + Math.random() * 0.6) // Random load for now
      );
      entry.totalLoad += meterCurrentLoad;
      entry.totalCapacity += meter.meterMaxCapacityKW;

      // For system metrics
      overallTotalCurrentLoad += meterCurrentLoad;
      overallTotalCapacity += meter.meterMaxCapacityKW;
      if (
        meter.ders &&
        meter.ders.length > 0 &&
        meter.ders.some((der) => der.switched_on)
      ) {
        overallTotalActiveDers++;
      }
    });

    substationDataMap.forEach((data, id) => {
      if (data.info.substationLatitude && data.info.substationLongtitude) {
        allAssets.push({
          id: `sub_${id}`,
          name: data.info.substationName,
          type: "substation",
          coordinates: [
            Number.parseFloat(data.info.substationLatitude),
            Number.parseFloat(data.info.substationLongtitude),
          ],
          status: calculateStatus(data.totalLoad, data.totalCapacity),
        });
      }
    });

    // 2. Process Transformers
    const transformerDataMap = new Map<
      string,
      {
        info: SimplifiedMeter; // First meter for transformer details
        meters: SimplifiedMeter[];
        totalLoad: number;
        totalCapacity: number;
      }
    >();
    // For transformer summaries (sidebar)
    const transformerSummaries: TransformerSummaryItem[] = [];

    rawData.forEach((meter) => {
      const key = meter.transformerId.toString();
      if (!transformerDataMap.has(key)) {
        transformerDataMap.set(key, {
          info: meter,
          meters: [],
          totalLoad: 0,
          totalCapacity: 0,
        });
      }
      const entry = transformerDataMap.get(key)!;
      entry.meters.push(meter);
      const meterCurrentLoad = Math.round(
        meter.meterMaxCapacityKW *
          meter.meterConsumptionLoadFactor *
          (0.3 + Math.random() * 0.6)
      );
      entry.totalLoad += meterCurrentLoad;
      entry.totalCapacity += meter.meterMaxCapacityKW;
    });

    transformerDataMap.forEach((data, id) => {
      // Use first meter's coordinates as proxy for transformer location
      if (data.info.meterLatitude && data.info.meterLongitude) {
        allAssets.push({
          id: `trans_${id}`,
          name: data.info.transformerName,
          type: "transformer",
          coordinates: [data.info.meterLatitude, data.info.meterLongitude],
          status: calculateStatus(data.totalLoad, data.totalCapacity),
        });
      }
      // For sidebar transformer summaries
      transformerSummaries.push({
        id: data.info.transformerId.toString(),
        name: data.info.transformerName,
        substationName: data.info.substationName,
        city: data.info.transformerCity,
        currentLoad: Math.round(
          data.totalCapacity > 0
            ? (data.totalLoad / data.totalCapacity) * 100
            : 0
        ),
        load: Math.round(
          data.totalCapacity > 0
            ? (data.totalLoad / data.totalCapacity) * 100
            : 0
        ),
        status: calculateStatus(data.totalLoad, data.totalCapacity),
        metersCount: data.meters.length,
      });
    });

    transformerSummaries.sort((a, b) => a.name.localeCompare(b.name));

    // 3. Process Households (Meters)
    rawData.forEach((meter) => {
      if (meter.meterLatitude && meter.meterLongitude) {
        const meterCurrentLoad = Math.round(
          meter.meterMaxCapacityKW *
            meter.meterConsumptionLoadFactor *
            (0.3 + Math.random() * 0.6)
        );
        allAssets.push({
          id: `house_${meter.meterId}`,
          name: meter.meterCode,
          type: "household",
          coordinates: [meter.meterLatitude, meter.meterLongitude],
          status: calculateStatus(meterCurrentLoad, meter.meterMaxCapacityKW),
          hasDers: meter.ders && meter.ders.length > 0,
        });
      }
    });

    // --- Calculate System Metrics ---
    const finalOverallLoadPercentage =
      overallTotalCapacity > 0
        ? (overallTotalCurrentLoad / overallTotalCapacity) * 100
        : 0;

    // DER Utilization: percentage of meters that have at least one active DER.
    // This is a simplification; a more accurate metric might consider the capacity of active DERs.
    const finalDerUtilizationPercentage =
      overallTotalMetersCount > 0
        ? (overallTotalActiveDers / overallTotalMetersCount) * 100
        : 0;

    const finalMitigationPercentage = Math.round(25 + Math.random() * 25); // Placeholder

    const systemMetrics = {
      der: {
        current: Math.round(finalDerUtilizationPercentage),
        peak: Math.round(
          Math.min(100, finalDerUtilizationPercentage + 10 + Math.random() * 15)
        ),
        total: 100,
      },
      load: {
        current: Math.round(finalOverallLoadPercentage),
        peak: Math.round(
          Math.min(
            100,
            Math.max(finalOverallLoadPercentage + 10, 85 + Math.random() * 10)
          )
        ),
        total: 100,
      },
      mitigation: {
        current: finalMitigationPercentage,
        peak: Math.round(
          Math.min(100, finalMitigationPercentage + 10 + Math.random() * 10)
        ),
        total: 100,
      },
    };

    return {
      allAssets,
      systemMetrics,
      transformerSummaries, // Keep for sidebar
    };
  }, [rawData]);
}
