// components/ControlPanel.tsx
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ControlPanelProps {
  house: House;
  isLoading: boolean;
  onClose: () => void;
  onApplySettings: (house: House) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  house,
  isLoading,
  onClose,
  onApplySettings,
}) => {
  const [ders, setDers] = useState<DER[]>(house.ders);

  const handleDerToggle = (derId: number) => {
    setDers((prev) =>
      prev.map((der) =>
        der.id === derId ? { ...der, isEnabled: !der.isEnabled } : der
      )
    );
  };

  const handleApply = () => {
    onApplySettings({ ...house, ders });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{house.name} Control Panel</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {ders.map((der) => (
            <div
              key={der.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium">{der.name}</div>
                <div className="text-sm text-gray-600">
                  Current Load: {der.currentLoad} kW
                </div>
              </div>
              <Switch
                checked={der.isEnabled}
                onCheckedChange={() => handleDerToggle(der.id)}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleApply}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying Settings...
              </>
            ) : (
              "Apply Settings"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
