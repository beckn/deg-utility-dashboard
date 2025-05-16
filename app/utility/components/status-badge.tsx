import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "Critical" | "Warning" | "Normal"
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "Critical":
        return "bg-red-200 text-red-700 hover:bg-red-200"
      case "Warning":
        return "bg-yellow-300 text-yellow-700 hover:bg-yellow-300"
      case "Normal":
        return "bg-green-300 text-green-700 hover:bg-green-300"
      default:
        return "bg-gray-200 text-gray-700 hover:bg-gray-200"
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
    <Badge variant="outline" className={cn("font-medium rounded", getStatusColor(), getSizeClasses())}>
      {status}
    </Badge>
  )
}
