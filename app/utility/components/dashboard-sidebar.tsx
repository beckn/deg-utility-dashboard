import { useState } from "react";
import type { TransformerSummaryItem } from "../lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./status-badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";

const mockAuditTrail = [
  {
    id: 1,
    name: "Jason's Household",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: 10,
    up: false,
    accepted: true,
  },
  {
    id: 2,
    name: "Jackson's Apartment",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: 10,
    up: true,
    accepted: false,
  },
  // ...repeat or add more for demo
];

interface DashboardSidebarProps {
  transformerSummaries: TransformerSummaryItem[];
}

export function DashboardSidebar({
  transformerSummaries,
}: DashboardSidebarProps) {
  const [tab, setTab] = useState<"feeder" | "audit">("feeder");

  return (
    <aside className="w-full h-full flex flex-col bg-card p-0 rounded-lg border border-border shadow-lg">
      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-card rounded-t-lg px-4 pt-3 pb-2">
        <div className="flex gap-2">
          <Tabs
            defaultValue="Transformers"
            value={tab}
            onValueChange={(value) => setTab(value as "feeder" | "audit")}
            className="w-full"
          >
            <TabsList className="flex flex-row justify-between w-full bg-[#232e47] rounded-lg shadow border border-[#232e47]">
              <TabsTrigger
                value="feeder"
                className="custom-tab font-semibold rounded text-white transition-colors cursor-pointer"
              >
                Feeder Summary
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="custom-tab font-semibold rounded text-white transition-colors cursor-pointer"
              >
                Audit Trail
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1 min-h-0 px-3 pb-3">
          {tab === "feeder" ? (
            <div className="space-y-3 mt-2">
              {transformerSummaries.length > 0 ? (
                transformerSummaries.map((item) => (
                  <div key={item.id}>
                    <div className="pt-3 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="font-semibold text-foreground text-base truncate"
                          title={item.name}
                        >
                          {item.name.length > 22
                            ? `${item.name.slice(0, 22)}...`
                            : item.name}
                        </h3>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                        <span>Region: {item.city}</span>
                        <span>Margin: {item.margin}%</span>
                      </div>
                      <div className="w-full h-2 rounded bg-white dark:bg-white mb-1">
                        <div
                          className={`h-2 rounded ${
                            item.status === "Critical"
                              ? "bg-red-500"
                              : item.status === "Warning"
                              ? "bg-yellow-400"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${item.currentLoad}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.currentLoad}%</span>
                        <span>{item.maxCapacity} kW</span>
                      </div>
                    </div>
                    <div className="border-t-2 border-border mt-2"></div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm text-center py-10">
                  No transformer data available.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {mockAuditTrail.map((item) => (
                <div key={item.id}>
                  <div className="pt-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="font-semibold text-foreground text-base truncate"
                        title={item.name}
                      >
                        {item.name.length > 22
                            ? `${item.name.slice(0, 22)}...`
                            : item.name}
                      </h3>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        Meter ID :{" "}
                        <span className="truncate">
                          {item.meterId.length > 10
                            ? `${item.meterId.slice(0, 10)}...`
                            : item.meterId}
                        </span>
                      </span>
                      <span>
                        Order ID :{" "}
                        <span className="truncate">
                          {item.orderId.length > 10
                            ? `${item.orderId.slice(0, 10)}...`
                            : item.orderId}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Current Consumption (kWh): </span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-semibold">
                          {item.consumption}
                        </span>
                        <span
                          className={
                            item.up ? "text-red-400" : "text-green-400"
                          }
                        >
                          {item.percent}% {item.up ? "↑" : "↓"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>DFP Accepted: </span>
                      <span
                        className={
                          item.accepted ? "text-green-400" : "text-red-400"
                        }
                      >
                        {item.accepted ? "True" : "False"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t-2 border-border mt-2"></div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
}
