import { useState } from "react"
import type { TransformerSummaryItem } from "../lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StatusBadge } from "./status-badge"

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
]

interface DashboardSidebarProps {
  transformerSummaries: TransformerSummaryItem[]
}

export function DashboardSidebar({ transformerSummaries }: DashboardSidebarProps) {
  const [tab, setTab] = useState<'feeder' | 'audit'>('feeder')

  return (
    <aside className="w-full h-full flex flex-col bg-card p-0 rounded-lg border border-border shadow-lg">
      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-card rounded-t-lg px-4 pt-4 pb-2">
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${tab === 'feeder' ? 'bg-blue-700 text-white shadow' : 'bg-transparent text-foreground/70 hover:bg-blue-900/30'}`}
            onClick={() => setTab('feeder')}
          >
            Feeder Summary
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${tab === 'audit' ? 'bg-blue-700 text-white shadow' : 'bg-transparent text-foreground/70 hover:bg-blue-900/30'}`}
            onClick={() => setTab('audit')}
          >
            Audit Trail
          </button>
        </div>
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1 min-h-0 px-3 pb-3">
          {tab === 'feeder' ? (
            <div className="space-y-3 mt-2">
              {transformerSummaries.length > 0 ? (
                transformerSummaries.map((item) => (
                  <Card key={item.id} className="bg-card border border-border rounded-xl shadow-none py-1">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground text-base truncate" title={item.name}>
                          {item.name}
                        </h3>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                        <span>Region: {item.city}</span>
                        <span>Margin: {item.margin}%</span>
                      </div>
                      <div className="w-full h-2 rounded bg-white dark:bg-white mb-1">
                        <div
                          className={`h-2 rounded ${item.status === 'Critical' ? 'bg-red-500' : item.status === 'Warning' ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${item.currentLoad}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.currentLoad}%</span>
                        <span>{item.maxCapacity} kW</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-muted-foreground text-sm text-center py-10">No transformer data available.</div>
              )}
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {mockAuditTrail.map((item) => (
                <Card key={item.id} className="bg-card border border-border rounded-xl shadow-none py-1">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-base truncate" title={item.name}>
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Meter ID : {item.meterId}</span>
                      <span>Order ID : {item.orderId}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Current Consumption (kWh): <span className="text-foreground font-semibold">{item.consumption}</span></span>
                      <span className={item.up ? 'text-red-400' : 'text-green-400'}>
                        {item.percent}% {item.up ? '↑' : '↓'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      DFP Accepted: <span className={item.accepted ? 'text-green-400' : 'text-red-400'}>{item.accepted ? 'True' : 'False'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  )
}
