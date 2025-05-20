"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MeterWithTransformer } from "../lib/types"

interface ControlPanelProps {
  house: MeterWithTransformer
  isLoading: boolean
  onClose: () => void
  onApplySettings: (houseData: MeterWithTransformer, newDersSettings: Array<{ id: number; isEnabled: boolean }>) => void
}

export function ControlPanel({ house, isLoading, onClose, onApplySettings }: ControlPanelProps) {
  // Initialize local DER state from house.ders
  const [dersState, setDersState] = useState(() =>
    house.ders.map((der) => ({
      id: der.id,
      name: der.appliance.name,
      currentLoad: der.appliance.powerRating,
      isEnabled: der.switched_on,
    })),
  )

  const handleDerToggle = (derId: number) => {
    setDersState((prev) => prev.map((der) => (der.id === derId ? { ...der, isEnabled: !der.isEnabled } : der)))
  }

  const handleApply = () => {
    const newDersSettings = dersState.map((d) => ({ id: d.id, isEnabled: d.isEnabled }))
    onApplySettings(house, newDersSettings)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{house.code} Control Panel</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
          <div className="space-y-4">
            {dersState.length > 0 ? (
              dersState.map((der) => (
                <div
                  key={der.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-700">{der.name || `DER ${der.id}`}</div>
                    <div className="text-sm text-gray-500">
                      Load: {der.currentLoad || 0} kW - Status: {der.isEnabled ? "ON" : "OFF"}
                    </div>
                  </div>
                  <Switch
                    checked={der.isEnabled}
                    onCheckedChange={() => handleDerToggle(der.id)}
                    disabled={isLoading}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No controllable DERs for this meter.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={handleApply}
            disabled={isLoading || dersState.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying...
              </>
            ) : (
              "Apply Settings"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
