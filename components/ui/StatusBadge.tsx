// components/ui/StatusBadge.tsx
import React from "react";

interface StatusBadgeProps {
  status: "Critical" | "Warning" | "Normal";
  size?: "sm" | "md" | "lg";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Critical":
        return "text-red-700 bg-red-200";
      case "Warning":
        return "text-yellow-700 bg-yellow-300";
      case "Normal":
        return "text-green-700 bg-green-300";
      default:
        return "text-gray-700 bg-gray-200";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "md":
        return "px-3 py-1 text-sm";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${getStatusColor()} ${getSizeClasses()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
