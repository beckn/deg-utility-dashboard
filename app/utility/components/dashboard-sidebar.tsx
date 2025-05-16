import type { TransformerSummaryItem } from "../lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StatusBadge } from "./status-badge"

interface DashboardSidebarProps {
  transformerSummaries: TransformerSummaryItem[]
}

export function DashboardSidebar({ transformerSummaries }: DashboardSidebarProps) {
  return (
    <aside className="w-full md:w-80 shadow-lg flex flex-col bg-white p-3 rounded-lg border border-gray-200">
      <div className="pb-2 mb-2 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-700">Transformer Summary</span>
      </div>

      <ScrollArea className="flex-1 pr-1">
        <div className="space-y-3">
          {transformerSummaries.length > 0 ? (
            transformerSummaries.map((item) => (
              <Card key={item.id} className="bg-indigo-50 hover:shadow-md transition-shadow border border-indigo-100">
                <CardContent className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1.5 truncate" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="text-xs text-gray-500 mb-1">Substation: {item.substationName}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">City</span>
                      <span className="font-medium text-gray-700">{item.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Load</span>
                      <span className="font-medium text-gray-700">{item.currentLoad}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Meters</span>
                      <span className="font-medium text-gray-700">{item.metersCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-gray-500 text-sm text-center py-10">No transformer data available.</div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
