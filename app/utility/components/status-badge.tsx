import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "Critical" | "Warning" | "Normal"
  size?: "sm" | "md" | "lg"
  pill?: boolean
}

export function StatusBadge({ status, size = "md", pill = false }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "Critical":
        return "bg-[#983535] text-white hover:bg-[#983535]";
      case "Warning":
        return "bg-[#D8A603] text-white hover:bg-[#D8A603]";
      case "Normal":
        return "bg-[#4F9835] text-white hover:bg-[#4F9835]";
      default:
        return "bg-gray-200 text-gray-700 hover:bg-gray-200";
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs"
      case "md":
        return "px-3 py-1 text-sm"
      case "lg":
        return "px-4 py-2 text-base"
      default:
        return "px-3 py-1 text-sm"
    }
  }

  return (
    <Badge variant="outline" className={cn("font-medium", pill ? "rounded-full" : "rounded", getStatusColor(), getSizeClasses())}>
      {status}
    </Badge>
  )
}
