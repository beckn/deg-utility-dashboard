"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useSimplifiedUtilDataStore } from "../lib/stores/utility-store"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardMetrics } from "./dashboard-metrics"
import { DashboardMap } from "./dashboard-map"
import { ControlPanel } from "./control-panel"
import { Button } from "@/components/ui/button"
import UtilityAgent from "@/components/UtilityAgent"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProcessedData } from "../lib/hooks/use-processed-data"
import type { MeterWithTransformer } from "../lib/types"

export default function UtilityDashboard() {
  const { fetchAndStore, fetchAndStoreTransformerData, isLoading, selectedHouse, setSelectedHouse, transformerData } = useSimplifiedUtilDataStore()
  const [isAgentOpen, setIsAgentOpen] = useState(false)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("Transformers")

  const { allAssets, systemMetrics, transformerSummaries, } = useProcessedData()

  useEffect(() => {
    fetchAndStore()
  }, [fetchAndStore])

  useEffect(() => {
    transformerData.forEach(transformer => {
      fetchAndStoreTransformerData(Number(transformer.id))
    })
  }, [fetchAndStoreTransformerData, transformerData])

  const handleOpenControlPanel = (meterData: MeterWithTransformer) => {
    setSelectedHouse(meterData)
    setIsControlPanelOpen(true)
  }

  const handleApplyControlPanelSettings = (
    houseData: MeterWithTransformer,
    newDersSettings: Array<{ id: number; isEnabled: boolean }>,
  ) => {
    // Update the store with new DER settings
    useSimplifiedUtilDataStore.getState().updateDerSettings(houseData.id, newDersSettings)

    setIsControlPanelOpen(false)
    setSelectedHouse(null)
  }

  if (isLoading && allAssets.length === 0 && transformerSummaries.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-200">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="ml-4 text-xl text-gray-700">Loading Utility Data...</p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <DashboardHeader />
      <div className="h-[calc(100vh-4rem)] flex flex-row p-2 gap-2 bg-background">
        {/* Left: Sidebar */}
        <div className="w-[340px] min-w-[280px] max-w-xs flex-shrink-0 bg-card rounded-lg shadow border border-border">
          <DashboardSidebar transformerSummaries={transformerSummaries} />
        </div>
        {/* Center: Map and Metrics */}
        <main className="flex-1 flex flex-col gap-2 min-w-0">
          {/* <DashboardMetrics metrics={systemMetrics} /> */}
          <section className="flex-1 p-3 bg-card rounded-lg shadow border border-border flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <Select defaultValue="San Francisco">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-full flex justify-end">
                <Tabs
                  defaultValue="Transformers"
                  value={selectedFilter}
                  onValueChange={setSelectedFilter}
                  className=""
                >
                  <TabsList className="flex flex-row gap-2 px-1 py-1 bg-[#232e47] rounded-lg shadow border border-[#232e47]">
                    <TabsTrigger value="Transformers" className="custom-tab px-4 py-1 font-semibold rounded text-white transition-colors cursor-pointer">Feeders</TabsTrigger>
                    <TabsTrigger value="Substations" className="custom-tab px-4 py-1 font-semibold rounded text-white transition-colors cursor-pointer">Substations</TabsTrigger>
                    <TabsTrigger value="Households" className="custom-tab px-4 py-1 font-semibold rounded text-white transition-colors cursor-pointer">Households</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border border-border">
              <DashboardMap assets={allAssets} filter={selectedFilter} onSelectMeter={handleOpenControlPanel} />
            </div>
          </section>
        </main>
        {/* Right: UtilityAgent Chat Panel */}
        <div className="w-[400px] min-w-[320px] max-w-md flex-shrink-0 h-full bg-card rounded-lg shadow border border-border">
          <div className="h-full flex flex-col">
            <UtilityAgent initialMessage="Hi! How can I help you today?" onClose={() => {}} />
          </div>
        </div>
      </div>
      {/* Control Panel Modal */}
      {isControlPanelOpen && selectedHouse && (
        <ControlPanel
          house={selectedHouse}
          isLoading={false}
          onClose={() => {
            setIsControlPanelOpen(false)
            setSelectedHouse(null)
          }}
          onApplySettings={handleApplyControlPanelSettings}
        />
      )}
    </div>
  )
}
