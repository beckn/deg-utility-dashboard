// app/utility/page.tsx
"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { Menu } from "lucide-react";
import UtilityAgent from "@/components/UtilityAgent";
import CircularProgress from "@/components/ui/CircularProgress";
import StatusBadge from "@/components/ui/StatusBadge";
import MapWrapper from "@/components/MapWrapper";
import { useSimplifiedUtilData } from "@/lib/useSimplifiedUtilData";
import type { SimplifiedMeter } from "@/lib/utility";

type ProcessedMeter = {
  id: number;
  code: string;
  currentLoad: number;
  capacity: number;
  status: "Critical" | "Warning" | "Normal";
  energyResourceName?: string;
};

type FeederData = {
  id: string;
  name: string;
  region: string;
  currentLoad: number;
  status: "Critical" | "Warning" | "Normal";
  coordinates: [number, number];
  meters: ProcessedMeter[];
};

const UtilityDashboard = () => {
  const { data, fetchAndStore } = useSimplifiedUtilData();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [gridLoadData, setGridLoadData] = useState(null);
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);
  const [chatInitiated, setChatInitiated] = useState(false);

  useEffect(() => {
    fetchAndStore();
  }, []);

  // Modify the existing useEffect for grid load polling
  useEffect(() => {
    const checkGridLoad = async () => {
      try {
        const response = await fetch('/api/grid-load');
        const data = await response.json();
        
        if (data.success && data.data) {
          setGridLoadData(data.data);
          
          // Only initiate chat if we haven't done it yet and there's no existing conversation
          if (!chatInitiated && !isAgentOpen) {
            try {
              const chatResponse = await fetch('https://api-deg-agents.becknprotocol.io/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  query: `ALERT: Transformer ${data.data.transformer.name} at ${data.data.transformer.city} (ID: ${data.data.transformer.id}) 
                  connected to ${data.data.transformer.substation.name} is approaching its maximum capacity of ${data.data.transformer.max_capacity_KW}KW. 
                  Current load is at critical levels. Would you like to initiate load balancing measures?`,
                  client_id: "test_123",
                  is_utility: true
                })
              });
              
              const chatData = await chatResponse.json();
              setInitialChatMessage(chatData.message || chatData.response.message || chatData);
              setChatInitiated(true);
              setIsAgentOpen(true);
            } catch (chatError) {
              console.error('Error initiating chat:', chatError);
              // Don't set fallback message or open chat if API fails
              setChatInitiated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking grid load:', error);
      }
    };

    // Check immediately and then every 5 seconds
    checkGridLoad();
    const interval = setInterval(checkGridLoad, 5000);

    return () => clearInterval(interval);
  }, [chatInitiated, isAgentOpen]); // Added isAgentOpen to dependencies

  // Process API data into feeders for display
  const { feeders, systemMetrics } = useMemo(() => {
    if (!data) {
      return { feeders: [], systemMetrics: { der: { current: 0, peak: 0, total: 0 }, load: { current: 0, peak: 0, total: 0 }, mitigation: { current: 0, peak: 0, total: 0 } } };
    }

    // Group meters by substation
    const substationMap = new Map<string, { meters: SimplifiedMeter[], substation: SimplifiedMeter }>();

    // biome-ignore lint/complexity/noForEach: <explanation>
    data.forEach((meter: SimplifiedMeter) => {
      const key = meter.substationId.toString();
      if (!substationMap.has(key)) {
        substationMap.set(key, { meters: [], substation: meter });
      }
      substationMap.get(key)?.meters.push(meter);
    });
    
    const processedFeeders: FeederData[] = [];
    let totalCapacity = 0;
    let totalCurrentLoad = 0;
    let totalActiveMeters = 0;
    let totalMeters = 0;
    
    // biome-ignore lint/complexity/noForEach: <explanation>
    substationMap.forEach(({ meters, substation }) => {
      const substationMeters: ProcessedMeter[] = [];
      let substationLoad = 0;
      let substationCapacity = 0;
      
      // biome-ignore lint/complexity/noForEach: <explanation>
      meters.forEach((meter) => {
        const currentLoad = Math.round(
          meter.meterMaxCapacityKW *
          meter.meterConsumptionLoadFactor *
          (0.3 + Math.random() * 0.6) // Random load between 30-90%
        );

        substationLoad += currentLoad;
        substationCapacity += meter.meterMaxCapacityKW;
        totalMeters++;

        if (meter.energyResourceId) {
          totalActiveMeters++;
        }

        const meterLoadPercentage = (currentLoad / (meter.meterMaxCapacityKW || 1)) * 100;
        const meterStatus: "Critical" | "Warning" | "Normal" =
          meterLoadPercentage > 85 ? "Critical" :
            meterLoadPercentage > 60 ? "Warning" : "Normal";

        substationMeters.push({
          id: meter.meterId,
          code: meter.meterCode,
          currentLoad,
          capacity: meter.meterMaxCapacityKW,
          status: meterStatus,
          energyResourceName: meter.energyResourceName
        });
      });

      totalCapacity += substationCapacity;
      totalCurrentLoad += substationLoad;

      const loadPercentage = substationCapacity > 0 ? (substationLoad / substationCapacity) * 100 : 0;
      const status: "Critical" | "Warning" | "Normal" =
        loadPercentage > 85 ? "Critical" :
          loadPercentage > 60 ? "Warning" : "Normal";

      const coordinates = [
        Number.parseFloat(substation.substationLatitude ?? "0"),
        Number.parseFloat(substation.substationLongtitude ?? "0")
      ] as [number, number];
      console.log("Substation:", substation.substationName, "Coordinates:", coordinates);

      processedFeeders.push({
        id: substation.substationId.toString(),
        name: substation.substationName,
        region: substation.substationCity,
        currentLoad: Math.round(loadPercentage),
        status,
        coordinates,
        meters: substationMeters
      });
    });

    // Calculate system metrics
    const overallLoadPercentage = totalCapacity > 0 ? (totalCurrentLoad / totalCapacity) * 100 : 0;
    const derUtilizationPercentage = totalMeters > 0 ? (totalActiveMeters / totalMeters) * 100 : 0;
    const mitigationPercentage = Math.round(25 + Math.random() * 25); // Simulated mitigation events

    const systemMetrics = {
      der: {
        current: Math.round(derUtilizationPercentage),
        peak: Math.round(derUtilizationPercentage + 10 + Math.random() * 20),
        total: 100
      },
      load: {
        current: Math.round(overallLoadPercentage),
        peak: Math.round(Math.max(overallLoadPercentage + 10, 95)),
        total: 100
      },
      mitigation: {
        current: mitigationPercentage,
        peak: Math.round(mitigationPercentage + 15),
        total: 100
      }
    };

    return { feeders: processedFeeders, systemMetrics };
  }, [data]);

  const filterTabs = ["All", "Substations", "Feeders", "Households", "DER's"];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-white via-blue-100 to-blue-200">
      {/* Header */}
      <header className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center space-x-3">
          <Menu className="w-6 h-6 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-800">
            Utility Admin Dashboard
          </h1>
        </div>
        <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">A</span>
        </div>
      </header>

      <div className="h-[calc(100vh-4rem)] flex">
        {/* Left Sidebar */}
        <div className="w-80 shadow-lg flex flex-col bg-blue-100/50 p-2 m-4 rounded-lg">
          <div className="p-2">
            <div className="flex space-x-2">
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Substation Summary
              </button>
              <button type="button" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                Audit Trail
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {feeders.length > 0 ? (
                feeders.map((feeder) => (
                  <div key={feeder.id} className="p-3 rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">
                      {feeder.name}
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region</span>
                        <span className="font-medium">{feeder.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Load</span>
                        <span className="font-medium">{feeder.currentLoad}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Meters</span>
                        <span className="font-medium">{feeder.meters.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <StatusBadge status={feeder.status} size="sm" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  No substations available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Metrics Row */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* DER Utilization */}
              <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-xs font-medium text-gray-600 mb-2">
                  DER Utilization
                </h3>
                <div className="flex justify-center mb-2">
                  <CircularProgress
                    percentage={systemMetrics.der.current}
                    color="#10b981"
                    size={80}
                    strokeWidth={6}
                  >
                    <span className="text-lg font-bold text-gray-800">
                      {systemMetrics.der.current}%
                    </span>
                  </CircularProgress>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium">{systemMetrics.der.current}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak</span>
                    <span className="font-medium">{systemMetrics.der.peak}%</span>
                  </div>
                </div>
              </div>

              {/* System Load */}
              <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-xs font-medium text-gray-600 mb-2">
                  System Load
                </h3>
                <div className="flex justify-center mb-2">
                  <CircularProgress
                    percentage={systemMetrics.load.current}
                    color="#3b82f6"
                    size={80}
                    strokeWidth={6}
                  >
                    <span className="text-lg font-bold text-gray-800">
                      {systemMetrics.load.current}%
                    </span>
                  </CircularProgress>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium">{systemMetrics.load.current}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak</span>
                    <span className="font-medium">{systemMetrics.load.peak}%</span>
                  </div>
                </div>
              </div>

              {/* Mitigation Events */}
              <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
                <h3 className="text-xs font-medium text-gray-600 mb-2">
                  Mitigation Events
                </h3>
                <div className="flex justify-center mb-2">
                  <CircularProgress
                    percentage={systemMetrics.mitigation.current}
                    color="#f59e0b"
                    size={80}
                    strokeWidth={6}
                  >
                    <span className="text-lg font-bold text-gray-800">
                      {systemMetrics.mitigation.current}%
                    </span>
                  </CircularProgress>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium">{systemMetrics.mitigation.current}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak</span>
                    <span className="font-medium">{systemMetrics.mitigation.peak}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="flex-1 p-4 pt-0">
            <div className="rounded-lg shadow-sm h-full flex flex-col">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <select
                    value="San Francisco"
                    className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>San Francisco</option>
                  </select>
                  <div className="flex space-x-2">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSelectedFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${selectedFilter === tab
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <MapWrapper feeders={feeders} />
            </div>
          </div>
        </div>
      </div>

      {/* Utility Agent */}
      <div className="fixed bottom-6 right-6">
        <button
          type="button"
          onClick={() => setIsAgentOpen(!isAgentOpen)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <span className="text-xs text-blue-600">AI</span>
          </div>
          <span className="text-sm font-medium">Utility Agent</span>
        </button>
      </div>

      {isAgentOpen && <UtilityAgent 
        onClose={() => setIsAgentOpen(false)} 
        initialMessage={initialChatMessage as string}
      />}
    </div>
  );
};

export default UtilityDashboard;