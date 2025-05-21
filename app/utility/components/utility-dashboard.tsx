"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  const [selectedFilter, setSelectedFilter] = useState("Feeders");
  const [activePanel, setActivePanel] = useState<
    "profile" | "audit" | "controls"
  >("profile");
  const [mapZoom, setMapZoom] = useState(12);
  const [showAuditTrailMessages, setShowAuditTrailMessages] = useState(false);
  const [statusPhase, setStatusPhase] = useState<
    "Normal" | "Warning" | "Critical"
  >("Normal");
  const [forceNormal, setForceNormal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");
  const [dynamicLoads, setDynamicLoads] = useState<{ [key: string]: number }>({
    transformer_2: 80,
    transformer_3: 82,
    transformer_4: 60,
    transformer_5: 64,
  });
  const agentRef = useRef<any>(null);

  // const { allAssets, systemMetrics, transformerSummaries } = useProcessedData();

  // California coordinates for each tab
  const tabCoordinates = {
    // All: { lat: 36.7783, lng: -119.4179 }, // Central California
    Feeders: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    Transformers: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    Households: { lat: 32.7157, lng: -117.1611 }, // San Diego
    "DER's": { lat: 38.5816, lng: -121.4944 }, // Sacramento
  };

  const tabMarkers = {
    // All: [
    //   { lat: 37.7749, lng: -122.4194, type: "All" },
    //   { lat: 37.7849, lng: -122.4094, type: "All" },
    //   { lat: 37.7649, lng: -122.4294, type: "All" },
    // ],
    Feeders: [
      { lat: 37.7799, lng: -122.4144, type: "Feeders" },
      { lat: 37.7699, lng: -122.4244, type: "Feeders" },
      { lat: 37.7599, lng: -122.4344, type: "Feeders" },
      { lat: 37.7499, lng: -122.4444, type: "Feeders" },
      { lat: 37.7899, lng: -122.4044, type: "Feeders" },
    ],
    Transformers: [
      { lat: 37.768, lng: -122.4376, type: "Transformers" },
      { lat: 37.788, lng: -122.4176, type: "Transformers" },
    ],
    Households: [
      { lat: 37.7749, lng: -122.4194, type: "Households" }, // Downtown / Civic Center
      { lat: 37.7599, lng: -122.4148, type: "Households" }, // Mission District
      { lat: 37.7489, lng: -122.4184, type: "Households" }, // Bernal Heights
      { lat: 37.7648, lng: -122.463, type: "Households" }, // Sunset District
      { lat: 37.7833, lng: -122.4397, type: "Households" }, // Haight-Ashbury
      { lat: 37.7691, lng: -122.4862, type: "Households" }, // Outer Richmond
      { lat: 37.7929, lng: -122.3938, type: "Households" }, // Embarcadero
      { lat: 37.7547, lng: -122.4477, type: "Households" }, // Inner Sunset
      { lat: 37.7793, lng: -122.4192, type: "Households" }, // Market St / SoMa
      { lat: 37.785, lng: -122.4324, type: "Households" }, // Western Addition
      { lat: 37.8078, lng: -122.4177, type: "Households" }, // North Beach
      { lat: 37.8001, lng: -122.4376, type: "Households" }, // Marina District
      { lat: 37.775, lng: -122.45, type: "Households" }, // Lone Mountain
    ],

    "DER's": [
      { lat: 37.78, lng: -122.42, type: "DER's" },
      { lat: 37.77, lng: -122.43, type: "DER's" },
      { lat: 37.76, lng: -122.44, type: "DER's" },
    ],
  };

  const [pingMarkers, setPingMarkers] = useState<
    { lat: number; lng: number; type: string }[]
  >(tabMarkers["Feeders"]);

  const handleTabChange = (value: string) => {
    setSelectedFilter(value);
    if (value === "Critical") {
      // Show only critical transformers/feeders
      setPingMarkers(
        transformerSummaries
          .filter((t) => t.condition === "Critical")
          .map((t) => ({
            lat: t.coordinates[0],
            lng: t.coordinates[1],
            type: "Feeders",
            status: t.status,
            condition: t.condition,
            name: t.name,
            load: t.load,
          }))
      );
    } else {
      setPingMarkers(tabMarkers[value as keyof typeof tabMarkers] || []);
    }
    if (value === "Transformers") {
      setMapZoom(14);
    } else {
      setMapZoom(12);
    }
  };

  useEffect(() => {
    fetchAndStore();
  }, [fetchAndStore]);

  useEffect(() => {
    if (forceNormal) {
      setStatusPhase("Normal");
      return;
    }
    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;
    setStatusPhase("Normal");
    timeout1 = setTimeout(() => {
      setStatusPhase("Warning");
      timeout2 = setTimeout(() => {
        setStatusPhase("Critical");
      }, 5000); // 15 seconds for Warning
    }, 10000); // 30 seconds for Normal
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [forceNormal]);

  // Effect to update loads every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicLoads((prevLoads) => {
        const newLoads = { ...prevLoads };
        // Skip transformer_1 and only update others
        Object.keys(newLoads).forEach((key) => {
          if (key === "transformer_1") return; // Skip first transformer
          const currentLoad = newLoads[key];
          // Randomly decide whether to increase or decrease
          const shouldIncrease = Math.random() > 0.5;
          if (shouldIncrease) {
            newLoads[key] = Math.min(currentLoad + 2, 100);
          } else {
            newLoads[key] = Math.max(currentLoad - 2, 0);
          }
        });
        return newLoads;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getDynamicLoad = (phase: string) => {
    if (phase === "Normal") return 60;
    if (phase === "Warning") return 80;
    return 90; // Critical
  };

  const transformerSummaries = [
    {
      id: "transformer_1",
      name: "Central Feeder Hub",
      substationName: "Mission Substation",
      city: "San Francisco",
      currentLoad: getDynamicLoad(statusPhase),
      load: getDynamicLoad(statusPhase),
      status: statusPhase,
      metersCount: 12,
      coordinates: [37.7599, -122.4148],
      margin: 100 - getDynamicLoad(statusPhase),
      region: "North",
      condition: "Critical",
      capacity: 1000,
    },
    {
      id: "transformer_2",
      name: "SoMA District Feeder",
      substationName: "Marina Substation",
      city: "San Francisco",
      currentLoad: dynamicLoads.transformer_2,
      load: dynamicLoads.transformer_2,
      status: "Warning" as const,
      metersCount: 15,
      coordinates: [37.8037, -122.4368],
      margin: 100 - dynamicLoads.transformer_2,
      region: "North",
      condition: "Normal",
      capacity: 860,
    },
    {
      id: "transformer_3",
      name: "Mission District Feeder ",
      substationName: "Richmond Substation",
      city: "San Francisco",
      currentLoad: dynamicLoads.transformer_3,
      load: dynamicLoads.transformer_3,
      status: "Warning" as const,
      metersCount: 8,
      coordinates: [37.7499, -122.4444],
      margin: 100 - dynamicLoads.transformer_3,
      region: "North",
      condition: "Normal",
      capacity: 430,
    },
    {
      id: "transformer_4",
      name: "Marina District Feeder",
      substationName: "Sunset Substation",
      city: "San Francisco",
      currentLoad: dynamicLoads.transformer_4,
      load: dynamicLoads.transformer_4,
      status: "Normal" as const,
      metersCount: 10,
      coordinates: [37.7534, -122.4944],
      margin: 100 - dynamicLoads.transformer_4,
      region: "North",
      condition: "Normal",
      capacity: 400,
    },
    {
      id: "transformer_5",
      name: "Sunset District Feeder",
      substationName: "Bayview Substation",
      city: "San Francisco",
      currentLoad: dynamicLoads.transformer_5,
      load: dynamicLoads.transformer_5,
      status: "Normal" as const,
      metersCount: 14,
      coordinates: [37.7899, -122.4044],
      margin: 100 - dynamicLoads.transformer_5,
      region: "West",
      warningLight: false,
      condition: "Normal",
      capacity: 200,
    },
  ];

  // Set pingMarkers to these three transformers
  const transformerPingMarkers = transformerSummaries.map((t) => ({
    lat: t.coordinates[0],
    lng: t.coordinates[1],
    type: "Feeders",
    status: t.status,
    condition: t.condition,
    name: t.name,
    load: t.load,
  }));

  // Find the critical transformer for agent chat
  const criticalTransformer = transformerSummaries.find(
    (t) => t.condition === "Critical"
  );

  interface Marker {
    lat: number;
    lng: number;
    type: string;
    condition?: string;
    status?: string;
    name?: string;
    load?: number;
  }

  // Filter markers based on selected tab
  const filteredMarkers = useMemo(() => {
    const allMarkers: Marker[] = Object.values(tabMarkers).flat();
    if (selectedTab === "All") {
      return allMarkers;
    } else if (selectedTab === "Critical") {
      return allMarkers.filter((marker) => marker.condition === "Critical");
    } else {
      return allMarkers.filter((marker) => marker.type === selectedTab);
    }
  }, [selectedTab, tabMarkers]);

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <DashboardHeader
        onSelectPanel={setActivePanel}
        activePanel={activePanel}
      />
      <div className="h-[calc(100vh-4rem)] flex flex-row p-2 gap-2 bg-background">
        {/* Left: Sidebar */}
        <div className="w-[340px] min-w-[280px] max-w-xs flex-shrink-0 bg-card rounded-lg shadow border border-border">
          <DashboardSidebar
            transformerSummaries={transformerSummaries}
            onAuditTrailClick={() => {
              if (statusPhase !== "Normal") {
                agentRef.current?.handleAuditTrailFlow();
              }
            }}
          />
        </div>
        {/* Center: Map and Metrics */}
        <main className="flex-1 flex flex-col gap-2 min-w-0">
          <section className="flex-1 p-3 bg-card rounded-lg shadow border border-border flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 justify-end">
              {/* <Select defaultValue="San Francisco">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                </SelectContent>
              </Select> */}
              <Tabs
                defaultValue="Feeders"
                value={selectedFilter}
                onValueChange={handleTabChange}
                className="w-full sm:w-auto"
              >
                <TabsList className="flex bg-[#181A20] rounded-xl p-1 shadow border border-[#232B3E] w-fit">
                  <TabsTrigger
                    value="Feeders"
                    className="px-4 ml-2 mr-2 py-1 rounded-l-lg font-semibold text-base data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=inactive]:bg-[#232B3E] data-[state=inactive]:text-white/70"
                  >
                    Feeders
                  </TabsTrigger>
                  <TabsTrigger
                    value="Critical"
                    className="px-4 ml-2 mr-2 py-1 rounded-r-lg font-semibold text-base data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=inactive]:bg-[#232B3E] data-[state=inactive]:text-white/70"
                  >
                    Emergency Services
                  </TabsTrigger>
                  <TabsTrigger
                    value="Transformers"
                    className="px-4 ml-2 mr-2 py-1 font-semibold text-base data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=inactive]:bg-[#232B3E] data-[state=inactive]:text-white/70"
                  >
                    Substations
                  </TabsTrigger>
                  <TabsTrigger
                    value="Households"
                    className="px-4 ml-2 mr-2 py-1 rounded-r-lg font-semibold text-base data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=inactive]:bg-[#232B3E] data-[state=inactive]:text-white/70"
                  >
                    Households
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border border-border">
              <DashboardMap
                assets={[]}
                filter={selectedFilter}
                pingMarkers={
                  selectedFilter === "Feeders"
                    ? transformerPingMarkers
                    : pingMarkers
                }
                zoom={mapZoom}
              />
            </div>
          </section>
        </main>
        {/* Right: UtilityAgent Chat Panel */}
        <div className="w-[400px] min-w-[320px] max-w-md flex-shrink-0 h-full bg-card rounded-lg shadow border border-border">
          <div className="h-full flex flex-col">
            <UtilityAgent
              ref={agentRef}
              initialMessage={
                criticalTransformer
                  ? `Alert: ${criticalTransformer.name} – Status: ${criticalTransformer.status}. Load: ${criticalTransformer.currentLoad}%. Meters: ${criticalTransformer.metersCount}`
                  : "All transformers normal."
              }
              onClose={() => {}}
              onDDRComplete={() => setForceNormal(true)}
              onGridNormalized={() => {
                setStatusPhase("Normal");
                setForceNormal(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
