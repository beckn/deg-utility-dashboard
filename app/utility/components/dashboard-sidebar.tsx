import { useEffect, useState, useRef } from "react";
import type {
  TransformerSummaryItem,
  SimplifiedAuditTrail,
} from "../lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./status-badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import { useSimplifiedUtilDataStore } from "../lib/stores/utility-store";

interface DashboardSidebarProps {
  transformerSummaries: TransformerSummaryItem[];
  auditTrail: SimplifiedAuditTrail[];
  fetchAuditTrails: (loader?: boolean) => Promise<void>;
}

export function DashboardSidebar({
  transformerSummaries,
  auditTrail,
  fetchAuditTrails,
}: DashboardSidebarProps) {
  const [tab, setTab] = useState<"feeder" | "audit">("feeder");
  const { isLoading: isFeederSummaryLoading, isAuditTrailLoading } =
    useSimplifiedUtilDataStore();
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]);
  const prevAuditTrailRef = useRef<typeof auditTrail>([]);
  const [isFirstAuditLoad, setIsFirstAuditLoad] = useState(true);

  useEffect(() => {
    if (tab === "audit") {
      if (isFirstAuditLoad && auditTrail.length > 0) {
        prevAuditTrailRef.current = auditTrail;
        setIsFirstAuditLoad(false);
        return;
      }
      const prevIds = new Set(prevAuditTrailRef.current.map(item => item.id));
      const newItems = auditTrail.filter(item => !prevIds.has(item.id));
      if (newItems.length > 0) {
        setHighlightedIds(ids => [...ids, ...newItems.map(item => item.id)]);
        setTimeout(() => {
          setHighlightedIds(ids => ids.filter(id => !newItems.map(item => item.id).includes(id)));
        }, 3000);
      }
      prevAuditTrailRef.current = auditTrail;
    }
  }, [auditTrail, tab, isFirstAuditLoad]);

  // useEffect(() => {
  //   if (tab === "audit") {
  //     const fetchData = async () => {
  //       await fetchAuditTrails();
  //     };

  //     fetchData();

  //     const auditTrailInterval = setInterval(
  //       () => fetchAuditTrails(false),
  //       5000
  //     );

  //     return () => clearInterval(auditTrailInterval);
  //   }
  // }, [fetchAuditTrails, tab]);

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
        {(tab === "feeder" && isFeederSummaryLoading) ||
        (tab === "audit" && isAuditTrailLoading) ? (
          <div className="flex-1 w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center mb-3">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          </div>
        ) : (
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
                {auditTrail.length > 0 ? (
                  auditTrail.map((item) => (
                    <div
                      key={item.id}
                      className={`relative transition-all duration-500 ${
                        highlightedIds.includes(item.id)
                          ? 'bg-green-300/30 animate-pulse ring-2 ring-green-400 border border-green-400 rounded-lg'
                          : ''
                      }`}
                    >
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
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>
                          Meter ID :{" "}
                          <span className="truncate">
                            {item.meterId.toString().length > 10
                              ? `${item.meterId.toString().slice(0, 10)}...`
                              : item.meterId.toString()}
                          </span>
                        </span>
                        <span>
                          Order ID :{" "}
                          <span className="truncate">
                            {item.orderId.toString().length > 10
                              ? `${item.orderId.toString().slice(0, 10)}...`
                              : item.orderId.toString()}
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
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm text-center py-10">
                    No audit trail data available.
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
    </aside>
  );
}
