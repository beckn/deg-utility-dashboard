"use client"

import { create } from "zustand"
import { strapiClient } from "../api/strapi-client"
import { simplifyUtilData } from "../utils/data-processor"
import type { SimplifiedMeter } from "../types"

type SimplifiedDataState = {
  data: SimplifiedMeter[]
  setData: (data: SimplifiedMeter[]) => void
  clear: () => void
  fetchAndStore: () => Promise<void>
  selectedHouse: SimplifiedMeter | null
  setSelectedHouse: (house: SimplifiedMeter | null) => void
  isLoading: boolean
  updateDerSettings: (meterId: number, newDersSettings: Array<{ id: number; isEnabled: boolean }>) => void
}

export const useSimplifiedUtilDataStore = create<SimplifiedDataState>((set, get) => ({
  data: [],
  selectedHouse: null,
  isLoading: false,

  setSelectedHouse: (house) => set({ selectedHouse: house }),

  setData: (data) => set({ data }),

  clear: () => set({ data: [] }),

  fetchAndStore: async () => {
    set({ isLoading: true })

    // Deep populate query for Strapi v4
    const populateQuery = "substations.transformers.meters.energyResource.ders.appliance"

    const { data, error } = await strapiClient.GET("/meter-data-simulator/utility/detailed", {
      populate: populateQuery,
    })

    if (error) {
      console.error("Error fetching utility data from Strapi:", error)
      set({ data: [], isLoading: false })
      return
    }

    if (data && data.utilities) {
      const simplified = simplifyUtilData(data)
      set({ data: simplified, isLoading: false })
    } else {
      console.error("Fetched data is null or not in expected format (missing utilities array):", data)
      set({ data: [], isLoading: false })
    }
  },

  updateDerSettings: (meterId, newDersSettings) => {
    set((state) => {
      const updatedData = state.data.map((meter) => {
        if (meter.meterId === meterId) {
          const updatedDers = meter.ders.map((der) => {
            const setting = newDersSettings.find((s) => s.id === der.id)
            return setting ? { ...der, switched_on: setting.isEnabled } : der
          })
          return { ...meter, ders: updatedDers }
        }
        return meter
      })
      return { data: updatedData }
    })
  },
}))
