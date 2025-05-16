import { Card, CardContent } from "@/components/ui/card"
import { CircularProgress } from "./circular-progress"

interface MetricData {
  current: number
  peak: number
  total: number
}

interface SystemMetrics {
  der: MetricData
  load: MetricData
  mitigation: MetricData
}

interface DashboardMetricsProps {
  metrics: SystemMetrics
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const metricItems = [
    { title: "DER Utilization", metric: metrics.der, color: "#10b981" },
    { title: "System Load", metric: metrics.load, color: "#3b82f6" },
    { title: "Mitigation Events", metric: metrics.mitigation, color: "#f59e0b" },
  ]

  return (
    <section className="p-3 bg-white rounded-lg shadow border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {metricItems.map((item) => (
          <Card key={item.title} className="bg-blue-50 border border-blue-100">
            <CardContent className="p-3">
              <h3 className="text-xs font-medium text-gray-500 mb-1.5">{item.title}</h3>
              <div className="flex items-center justify-around mb-1.5">
                <CircularProgress percentage={item.metric.current} color={item.color} size={70} strokeWidth={5}>
                  <span className="text-base font-bold text-gray-700">{item.metric.current}%</span>
                </CircularProgress>
                <div className="text-xs space-y-0.5">
                  <div className="flex justify-between w-24">
                    <span className="text-gray-500">Current:</span>
                    <span className="font-medium text-gray-700">{item.metric.current}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Peak:</span>
                    <span className="font-medium text-gray-700">{item.metric.peak}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
