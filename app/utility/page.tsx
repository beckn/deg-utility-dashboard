// app/utility/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import UtilityAgent from "@/components/UtilityAgent";
import CircularProgress from "@/components/ui/CircularProgress";
import StatusBadge from "@/components/ui/StatusBadge";
import MapWrapper from "@/components/MapWrapper";

interface Feeder {
  id: string;
  name: string;
  region: string;
  currentLoad: number;
  status: "Critical" | "Warning" | "Normal";
  coordinates: [number, number];
}

interface MetricData {
  current: number;
  peak: number;
  total: number;
}

const UtilityDashboard = () => {
  const [feeders, setFeeders] = useState<Feeder[]>([]);
  const [derUtilization, setDerUtilization] = useState<MetricData>({
    current: 50,
    peak: 93,
    total: 100,
  });
  const [systemLoad, setSystemLoad] = useState<MetricData>({
    current: 50,
    peak: 93,
    total: 100,
  });
  const [mitigationEvents, setMitigationEvents] = useState<MetricData>({
    current: 50,
    peak: 93,
    total: 100,
  });
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const mockFeeders: Feeder[] = [
      {
        id: "1",
        name: "Central Feeder Hub",
        region: "Central",
        currentLoad: 92,
        status: "Critical",
        coordinates: [37.4419, -122.143],
      },
      {
        id: "2",
        name: "SoMA District Feeder",
        region: "North",
        currentLoad: 70,
        status: "Warning",
        coordinates: [37.4389, -122.1436],
      },
      {
        id: "3",
        name: "Mission District Feeder",
        region: "West",
        currentLoad: 80,
        status: "Warning",
        coordinates: [37.435, -122.144],
      },
      {
        id: "4",
        name: "Marina District Feeder",
        region: "East",
        currentLoad: 50,
        status: "Normal",
        coordinates: [37.438, -122.146],
      },
      {
        id: "5",
        name: "Sunset District Feeder",
        region: "Centre",
        currentLoad: 30,
        status: "Normal",
        coordinates: [37.436, -122.147],
      },
    ];

    setTimeout(() => {
      setFeeders(mockFeeders);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filterTabs = ["All", "Substations", "Feeders", "Households", "DER's"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-white via-blue-100 to-blue-200">
      {/* Header */}
      <header className="flex items-center justify-between p-4  h-16">
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

      <div className="h-[calc(100vh-4rem)] flex ">
        {/* Left Sidebar - Fixed Width */}
        <div className="w-80 shadow-lg flex flex-col bg-blue-100/50 p-2 m-4 rounded-lg">
          {/* Navigation Tabs */}
          <div className="p-2">
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Feeder Summary
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                Audit Trail
              </button>
            </div>
          </div>

          {/* Scrollable Feeder List */}
          <div className="flex-1 overflow-y-auto p-4 ">
            <div className="space-y-3">
              {feeders.length > 0 ? (
                feeders.map((feeder) => (
                  <div key={feeder.id} className=" p-3 rounded-lg bg-blue-50">
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
                        <span className="font-medium">
                          {feeder.currentLoad}%
                        </span>
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
                  No feeders available
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
                    percentage={derUtilization.current}
                    color="#10b981"
                    size={80}
                    strokeWidth={6}
                  >
                    <span className="text-lg font-bold text-gray-800">
                      {derUtilization.current}%
                    </span>
                  </CircularProgress>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium">
                      {derUtilization.current} %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium">{derUtilization.peak} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium">
                      {derUtilization.total} %
                    </span>
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
                    percentage={systemLoad.current}
                    color="#3b82f6"
                    size={80}
                    strokeWidth={6}
                  >
                    <span className="text-lg font-bold text-gray-800">
                      {systemLoad.current}%
                    </span>
                  </CircularProgress>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium">{systemLoad.current} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak</span>
                    <span className="font-medium">{systemLoad.peak} %</span>
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
                    percentage={mitigationEvents.current}
                    color="#f59e0b"
                    size={80}
                    strokeWidth={6}
                  >
                    <span className="text-lg font-bold text-gray-800">
                      {mitigationEvents.current}%
                    </span>
                  </CircularProgress>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium">
                      {mitigationEvents.current} %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak</span>
                    <span className="font-medium">
                      {mitigationEvents.peak} %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="flex-1 p-4 pt-0">
            <div className=" rounded-lg shadow-sm h-full flex flex-col">
              {/* Map Header */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <select
                    value="Stanford University"
                    onChange={() => {}}
                    className="px-3 py-1.5  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>Stanford University</option>
                  </select>
                  <div className="flex space-x-2">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          selectedFilter === tab
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

              {/* Map */}
              {/* <div className="flex-1 "> */}
              <MapWrapper feeders={feeders} />
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Utility Agent - Bottom Right Corner */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsAgentOpen(!isAgentOpen)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <span className="text-xs text-blue-600">AI</span>
          </div>
          <span className="text-sm font-medium">Utility Agent</span>
        </button>
      </div>

      {/* Utility Agent Chat */}
      {isAgentOpen && <UtilityAgent onClose={() => setIsAgentOpen(false)} />}
    </div>
  );
};

export default UtilityDashboard;
