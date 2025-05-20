import type { TransformerSummaryItem } from "../lib/types"
import { FeederAuditTabs } from "./feeder-audit-tabs"

interface DashboardSidebarProps {
  transformerSummaries: TransformerSummaryItem[]
}

export function DashboardSidebar({ transformerSummaries }: DashboardSidebarProps) {
  return (
    <div>
     <FeederAuditTabs />  
    </div>
  )
}
