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
import type { SimplifiedMeter } from "../lib/types"

export default function UtilityDashboard() {
  const { fetchAndStore, isLoading, selectedHouse, setSelectedHouse } = useSimplifiedUtilDataStore()
  const [isAgentOpen, setIsAgentOpen] = useState(false)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")

  const { allAssets, systemMetrics, transformerSummaries } = useProcessedData()

  useEffect(() => {
    fetchAndStore()
  }, [fetchAndStore])

  const handleOpenControlPanel = (meterData: SimplifiedMeter) => {
    setSelectedHouse(meterData)
    setIsControlPanelOpen(true)
  }

  const handleApplyControlPanelSettings = (
    houseData: SimplifiedMeter,
    newDersSettings: Array<{ id: number; isEnabled: boolean }>,
  ) => {
    console.log("Applying settings for house:", houseData.meterId, "New DERs:", newDersSettings)

    // Update the store with new DER settings
    useSimplifiedUtilDataStore.getState().updateDerSettings(houseData.meterId, newDersSettings)

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
              <Tabs
                defaultValue="All"
                value={selectedFilter}
                onValueChange={setSelectedFilter}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-3 sm:grid-cols-5">
                  <TabsTrigger value="All">All</TabsTrigger>
                  <TabsTrigger value="Substations">Substations</TabsTrigger>
                  <TabsTrigger value="Transformers">Transformers</TabsTrigger>
                  <TabsTrigger value="Households">Households</TabsTrigger>
                  <TabsTrigger value="DER's">DER's</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border border-border">
              <DashboardMap assets={allAssets} filter={selectedFilter} onSelectMeter={handleOpenControlPanel} />
            </div>
          </section>
        </main>
        {/* Right: UtilityAgent Chat Panel */}
        <div className="w-[400px] min-w-[320px] max-w-md flex-shrink-0 h-full bg-card rounded-lg shadow border border-border">
          <div className="h-full flex flex-col">
            <UtilityAgent initialMessage="Alert: Grid Stress Detected – Capacity Breach Likely in 30 Minutes" onClose={() => {}} />
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
