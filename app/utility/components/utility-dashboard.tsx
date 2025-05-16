"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useSimplifiedUtilDataStore } from "../lib/stores/utility-store"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardMetrics } from "./dashboard-metrics"
import { DashboardMap } from "./dashboard-map"
import { UtilityAgent } from "./utility-agent"
import { ControlPanel } from "./control-panel"
import { Button } from "@/components/ui/button"
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100">
      <DashboardHeader />

      <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row p-2 gap-2">
        <DashboardSidebar transformerSummaries={transformerSummaries} />

        <main className="flex-1 flex flex-col gap-2 min-w-0">
          <DashboardMetrics metrics={systemMetrics} />

          <section className="flex-1 p-3 bg-white rounded-lg shadow border border-gray-200 flex flex-col min-h-0">
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

            <div className="flex-1 rounded-lg overflow-hidden border border-gray-200">
              <DashboardMap assets={allAssets} filter={selectedFilter} onSelectMeter={handleOpenControlPanel} />
            </div>
          </section>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsAgentOpen(!isAgentOpen)}
          className="bg-blue-600 text-white px-4 py-6 rounded-full shadow-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-150 ease-in-out transform hover:scale-105"
        >
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
            <span className="text-sm font-bold text-blue-600">AI</span>
          </div>
          <span className="text-sm font-medium">Utility Agent</span>
        </Button>
      </div>

      {isAgentOpen && <UtilityAgent onClose={() => setIsAgentOpen(false)} />}

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
