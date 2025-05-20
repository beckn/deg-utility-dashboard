"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSimplifiedUtilDataStore } from "../lib/stores/utility-store";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardMetrics } from "./dashboard-metrics";
import { DashboardMap } from "./dashboard-map";
import { ControlPanel } from "./control-panel";
import { Button } from "@/components/ui/button";
import UtilityAgent from "@/components/UtilityAgent";
import { ProfilePanel } from "../components/profile-panel";
import { AuditLogsPanel } from "../components/audit-logs-panel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllMarker } from "@/components/markers/AllMarker";
import { SubstationMarker } from "@/components/markers/SubstationMarker";
import { TransformerMarker } from "@/components/markers/TransformerMarker";
import { HouseholdMarker } from "@/components/markers/HouseholdMarker";
import { DERMarker } from "@/components/markers/DERMarker";

export default function UtilityDashboard() {
  const { fetchAndStore, isLoading, selectedHouse, setSelectedHouse } =
    useSimplifiedUtilDataStore();
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activePanel, setActivePanel] = useState<
    "profile" | "audit" | "controls"
  >("profile");

  // const { allAssets, systemMetrics, transformerSummaries } = useProcessedData();

  // California coordinates for each tab
  const tabCoordinates = {
    All: { lat: 36.7783, lng: -119.4179 }, // Central California
    Substations: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    Transformers: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    Households: { lat: 32.7157, lng: -117.1611 }, // San Diego
    "DER's": { lat: 38.5816, lng: -121.4944 }, // Sacramento
  };

  const tabMarkers = {
    All: [
      { lat: 37.7749, lng: -122.4194, type: "All" },
      { lat: 37.7849, lng: -122.4094, type: "All" },
      { lat: 37.7649, lng: -122.4294, type: "All" },
    ],
    Substations: [
      { lat: 37.7799, lng: -122.4144, type: "Substations" },
      { lat: 37.7699, lng: -122.4244, type: "Substations" },
      { lat: 37.7599, lng: -122.4344, type: "Substations" },
    ],
    Transformers: [
      { lat: 37.768, lng: -122.4376, type: "Transformers" },
      { lat: 37.778, lng: -122.4276, type: "Transformers" },
      { lat: 37.788, lng: -122.4176, type: "Transformers" },
    ],
    Households: [
      { lat: 37.775, lng: -122.4183, type: "Households" },
      { lat: 37.765, lng: -122.4283, type: "Households" },
      { lat: 37.755, lng: -122.4383, type: "Households" },
    ],
    "DER's": [
      { lat: 37.78, lng: -122.42, type: "DER's" },
      { lat: 37.77, lng: -122.43, type: "DER's" },
      { lat: 37.76, lng: -122.44, type: "DER's" },
    ],
  };

  const [pingMarkers, setPingMarkers] = useState<
    { lat: number; lng: number; type: string }[]
  >(tabMarkers["All"]);

  const handleTabChange = (value: string) => {
    setSelectedFilter(value);
    setPingMarkers(tabMarkers[value as keyof typeof tabMarkers] || []);
  };

  useEffect(() => {
    fetchAndStore();
  }, [fetchAndStore]);

  // Three transformers in San Francisco (JSON array)
  const transformerSummaries = [
    {
      id: "transformer_1",
      name: "Mission District Transformer",
      substationName: "Mission Substation",
      city: "San Francisco",
      currentLoad: 100,
      load: 110,
      status: "Critical" as const,
      metersCount: 12,
      coordinates: [37.7599, -122.4148],
    },
    {
      id: "transformer_2",
      name: "Marina District Transformer",
      substationName: "Marina Substation",
      city: "San Francisco",
      currentLoad: 68,
      load: 68,
      status: "Warning" as const,
      metersCount: 15,
      coordinates: [37.8037, -122.4368],
    },
    {
      id: "transformer_3",
      name: "Sunset District Transformer",
      substationName: "Sunset Substation",
      city: "San Francisco",
      currentLoad: 46,
      load: 46,
      status: "Normal" as const,
      metersCount: 10,
      coordinates: [37.7534, -122.4944],
    },
  ];

  // Set pingMarkers to these three transformers
  const transformerPingMarkers = transformerSummaries.map((t) => ({
    lat: t.coordinates[0],
    lng: t.coordinates[1],
    type: "Transformers",
  }));

  // Find the critical transformer for agent chat
  const criticalTransformer = transformerSummaries.find(
    (t) => t.status === "Critical"
  );

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <DashboardHeader
        onSelectPanel={setActivePanel}
        activePanel={activePanel}
      />
      <div className="h-[calc(100vh-4rem)] flex flex-row p-2 gap-2 bg-background">
        {/* Left: Sidebar */}
        <div className="w-[340px] min-w-[280px] max-w-xs flex-shrink-0 bg-card rounded-lg shadow border border-border">
          <DashboardSidebar transformerSummaries={transformerSummaries} />
        </div>
        {/* Center: Map and Metrics */}
        <main className="flex-1 flex flex-col gap-2 min-w-0">
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
                onValueChange={handleTabChange}
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
              <DashboardMap
                assets={[]}
                filter={selectedFilter}
                pingMarkers={
                  selectedFilter === "Transformers"
                    ? transformerPingMarkers
                    : pingMarkers
                }
              />
            </div>
          </section>
        </main>
        {/* Right: UtilityAgent Chat Panel */}
        <div className="w-[400px] min-w-[320px] max-w-md flex-shrink-0 h-full bg-card rounded-lg shadow border border-border">
          <div className="h-full flex flex-col">
            <UtilityAgent
              initialMessage={
                criticalTransformer
                  ? `Alert: ${criticalTransformer.name} – Status: ${criticalTransformer.status}. Load: ${criticalTransformer.currentLoad}%. Meters: ${criticalTransformer.metersCount}`
                  : "All transformers normal."
              }
              onClose={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
