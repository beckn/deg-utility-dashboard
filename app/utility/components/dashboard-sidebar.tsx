import type { TransformerSummaryItem } from "../lib/types";
import { FeederAuditTabs } from "./feeder-audit-tabs";

interface DashboardSidebarProps {
  transformerSummaries: TransformerSummaryItem[];
  onAuditTrailClick?: () => void;
}

export function DashboardSidebar({
  transformerSummaries,
  onAuditTrailClick,
}: DashboardSidebarProps) {
  return (
    <div>
      <FeederAuditTabs feeders={transformerSummaries} onAuditTrailClick={onAuditTrailClick} />
    </div>
  );
}
