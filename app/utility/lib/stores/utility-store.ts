"use client";

import { create } from "zustand";
import { strapiClient } from "../api/strapi-client";
import {
  simplifyAuditTrailData,
  simplifyUtilData,
  simplifyUtilDataForDashboard,
} from "../utils/data-processor";
import type {
  SimplifiedData,
  MeterWithTransformer,
  StrapiTransformer,
  TransformerWithSubstation,
  StrapiAuditTrail,
  SimplifiedAuditTrail,
} from "../types";

type SimplifiedDataState = {
  data: SimplifiedData;
  transformerData: StrapiTransformer[];
  auditTrail: SimplifiedAuditTrail[];
  setData: (data: SimplifiedData) => void;
  clear: () => void;
  fetchAndStore: () => Promise<void>;
  selectedHouse: MeterWithTransformer | null;
  setSelectedHouse: (house: MeterWithTransformer | null) => void;
  isLoading: boolean;
  isAuditTrailLoading: boolean;
  updateDerSettings: (
    meterId: number,
    newDersSettings: Array<{ id: number; isEnabled: boolean }>
  ) => void;
  fetchAndStoreTransformerData: (transformerId: number) => Promise<void>;
  startStream: (transformerId: number) => Promise<void>;
  fetchAndStoreAuditTrail: () => Promise<void>;
};

export const useSimplifiedUtilDataStore = create<SimplifiedDataState>(
  (set, get) => ({
    data: {
      substations: [],
      transformers: [],
      meters: [],
      auditTrail: [],
    },
    selectedHouse: null,
    isLoading: false,
    isAuditTrailLoading: false,
    transformerData: [],
    auditTrail: [],
    setSelectedHouse: (house) => set({ selectedHouse: house }),

    setData: (data) => set({ data }),

    setAuditTrail: (auditTrail: SimplifiedAuditTrail[]) => set({ auditTrail }),

    clear: () =>
      set({ data: { substations: [], transformers: [], meters: [] } }),

    fetchAndStore: async () => {
      set({ isLoading: true });

      // Deep populate query for Strapi v4
      const populateQuery =
        "substations.transformers.meters.energyResource.ders.appliance";

      const { data, error } = await strapiClient.GET(
        "/meter-data-simulator/utility/detailed",
        {
          populate: populateQuery,
        }
      );

      if (error) {
        console.error("Error fetching utility data from Strapi:", error);
        set({
          data: { substations: [], transformers: [], meters: [] },
          isLoading: false,
        });
        return;
      }

      if (data && data.utilities) {
        const simplified = simplifyUtilData(data);
        set({
          data: simplified,
          isLoading: false,
          transformerData: simplifyUtilDataForDashboard(data),
        });
      } else {
        console.error(
          "Fetched data is null or not in expected format (missing utilities array):",
          data
        );
        set({
          data: { substations: [], transformers: [], meters: [] },
          isLoading: false,
        });
      }
    },

    fetchAndStoreTransformerData: async (transformerId: number) => {
      try {
        get().startStream(transformerId);
      } catch (error) {
        console.error("Error fetching transformer data:", error);
      }
    },

    startStream: async (transformerId: number) => {
      set({ isLoading: true });
      const url = `https://playground.becknprotocol.io/meter-data-simulator/transformer-load-streamed/${transformerId}`;

      const connect = async () => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Connection': 'keep-alive'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          if (!response.body) {
            throw new Error("ReadableStream not supported");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          const readChunk = async () => {
            try {
              const { done, value } = await reader.read();

              if (done) {
                console.log("Stream complete.");
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const parsedArr = JSON.parse(line);
                    const newObj = Array.isArray(parsedArr)
                      ? parsedArr[0]
                      : parsedArr;
                    const newTransformerData = {
                      id: newObj.transformer.id,
                      name: newObj.transformer.name,
                      city: newObj.transformer.city,
                      state: newObj.transformer.state,
                      latitude: newObj.transformer.latitude,
                      longtitude: newObj.transformer.longtitude,
                      pincode: newObj.transformer.pincode,
                      max_capacity_KW: newObj.transformer.max_capacity_KW,
                      status: newObj.health_status,
                      currentLoad: newObj.load_percentage,
                      margin: newObj.margin_percentage,
                      emergencyService: newObj?.transformer?.emergency_service || false,
                    } as TransformerWithSubstation;

                    set((state) => {
                      const transformers = [...state.data.transformers];
                      const index = transformers.findIndex(t => t.id === newTransformerData.id);
                      if (index !== -1) {
                        transformers[index] = newTransformerData;
                      } else {
                        transformers.push(newTransformerData);
                      }
                      return {
                        data: {
                          ...state.data,
                          transformers,
                        },
                      };
                    });
                  } catch (e) {
                    console.warn("Error parsing line:", e);
                  }
                }
              }
              return readChunk();
            } catch (error: any) {
              if (error.name === "AbortError") {
                console.log("Stream aborted");
                return;
              }
              console.error("Error reading chunk:", error);
              connect();
              throw error;
            }
          };

          return readChunk();
        } catch (err) {
          console.error("Connection error");
          connect();
        } finally {
          set({ isLoading: false });
        }
      };

      // Start the connection
      connect();
    },

    updateDerSettings: (meterId, newDersSettings) => {
      set((state) => {
        const updatedData = state.data.meters.map((meter) => {
          if (meter.id === meterId) {
            const updatedDers = meter.ders.map((der) => {
              const setting = newDersSettings.find((s) => s.id === der.id);
              return setting ? { ...der, switched_on: setting.isEnabled } : der;
            });
            return { ...meter, ders: updatedDers };
          }
          return meter;
        });
        return {
          data: {
            substations: state.data.substations,
            transformers: state.data.transformers,
            meters: updatedData,
          },
        };
      });
    },

    fetchAndStoreAuditTrail: async () => {
      set({ isAuditTrailLoading: true });
      const url = "https://bpp-unified-strapi-deg.becknprotocol.io/unified-beckn-energy/audit-trail";
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });

      if (!response.ok) {
        console.error("Error fetching audit trail data from Strapi:", response.statusText);
        set({
          auditTrail: [],
          isAuditTrailLoading: false,
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const simplified = simplifyAuditTrailData(data);
        set({
          auditTrail: simplified,
          isAuditTrailLoading: false,
        });
      } else {
        console.error("Fetched data is null or not in expected format (missing audit trail array)");
        set({
          auditTrail: [],
          isAuditTrailLoading: false,
        });
      }
    },
  })
);
