// app/utility/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Menu } from "lucide-react";
import UtilityAgent from "@/components/UtilityAgent";
import CircularProgress from "@/components/ui/CircularProgress";
import StatusBadge from "@/components/ui/StatusBadge";
import MapWrapper from "@/components/MapWrapper";
import { api } from "@/lib/api";

const UtilityDashboard = () => {
  const { data, error, isLoading } = api.useQuery("get", "/api/utilities", {
    params: {
      query: {
        "pagination[page]": 1,
        "pagination[pageSize]": 100,
        populate: "substations.transformers.meters.energyResource"
      }
    },
    cache: "force-cache"
  });

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  // Process API data into feeders for display
  const { feeders, systemMetrics } = useMemo(() => {
    if (!data?.data) {
      return { feeders: [], systemMetrics: { der: { current: 0, peak: 0, total: 0 }, load: { current: 0, peak: 0, total: 0 }, mitigation: { current: 0, peak: 0, total: 0 } } };
    }

    const processedFeeders: FeederData[] = [];
    let totalCapacity = 0;
    let totalCurrentLoad = 0;
    let totalActiveMeters = 0;
    let totalMeters = 0;

    data.data.forEach((utility) => {
      utility.attributes.substations.data.forEach((substation) => {
        const substationMeters: ProcessedMeter[] = [];
        let substationLoad = 0;
        let substationCapacity = 0;

        substation.attributes.transformers.data.forEach((transformer) => {
          transformer.attributes.meters.data.forEach((meter) => {
            const currentLoad = Math.round(
              meter.attributes.max_capacity_KW * 
              meter.attributes.consumptionLoadFactor * 
              (0.3 + Math.random() * 0.6) // Random load between 30-90%
            );
            
            substationLoad += currentLoad;
            substationCapacity += meter.attributes.max_capacity_KW;
            totalMeters++;

            if (meter.attributes.energyResource) {
              totalActiveMeters++;
            }

            const meterLoadPercentage = (currentLoad / meter.attributes.max_capacity_KW) * 100;
            const meterStatus: "Critical" | "Warning" | "Normal" = 
              meterLoadPercentage > 85 ? "Critical" : 
              meterLoadPercentage > 60 ? "Warning" : "Normal";

            substationMeters.push({
              id: meter.id,
              code: meter.attributes.code,
              currentLoad,
              capacity: meter.attributes.max_capacity_KW,
              status: meterStatus,
              energyResourceName: meter.attributes.energyResource?.data.attributes.name
            });
          });
        });

        totalCapacity += substationCapacity;
        totalCurrentLoad += substationLoad;

        const loadPercentage = substationCapacity > 0 ? (substationLoad / substationCapacity) * 100 : 0;
        const status: "Critical" | "Warning" | "Normal" = 
          loadPercentage > 85 ? "Critical" : 
          loadPercentage > 60 ? "Warning" : "Normal";

        processedFeeders.push({
          id: substation.id.toString(),
          name: substation.attributes.name,
          region: substation.attributes.city,
          currentLoad: Math.round(loadPercentage),
          status,
          coordinates: [
            parseFloat(substation.attributes.latitude),
            parseFloat(substation.attributes.longtitude)
          ],
          meters: substationMeters
        });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading utility data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Error loading data</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Substation Summary
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
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
              <MapWrapper feeders={feeders} />
            </div>
          </div>
        </div>
      </div>

      {/* Utility Agent */}
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

      {isAgentOpen && <UtilityAgent onClose={() => setIsAgentOpen(false)} />}
    </div>
  );
};

export default UtilityDashboard;