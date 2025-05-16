// components/HouseList.tsx
import { useMeterDataStream } from "@/lib/api";
import { useSimplifiedData } from "@/lib/useSimplifiedData";
import { useLoadSimulation } from "@/lib/useLoadSimulation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React from "react";
import { SimplifiedItem } from "@/lib/convetor";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

const HouseList = () => {
  const { data: houses, selectedHouse, setSelectedHouse } = useSimplifiedData();
  const simulation = useLoadSimulation(houses);

  const getStatusColor = (currentLoad: number, maxCapacity: number | undefined) => {
    if (!maxCapacity) return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white">
        Unknown
      </span>
    );
    
    const ratio = currentLoad / maxCapacity;
    if (ratio >= 0.9) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">
          Critical
        </span>
      );
    } 
    if (ratio >= 0.7) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500 text-white">
          Warning
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-green-500 text-white">
        Normal
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Houses</h2>
      
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="space-y-4 p-2">
          {houses.map((house, index) => {
            const currentLoad = simulation.getCurrentLoad(house.id);
            const maxCapacity = house.max_capacity_KW ?? 0;
            
            return (
              <Dialog key={house.id}>
                <DialogTrigger asChild>
                  <div
                    onClick={() => setSelectedHouse(house)}
                    className={`p-4 bg-white/90 rounded-lg cursor-pointer transition-all hover:bg-white shadow-sm ${
                      selectedHouse?.id === house.id ? "ring-2 ring-blue-500 scale-105" : ""
                    }`}
                  >
                    <div className="font-semibold text-gray-800 mb-2 flex justify-between">
                      {house.name}
                      <LiveScore 
                        load={currentLoad} 
                        isFirst={index === 0}
                      />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Meter Code</span>
                        <span className="font-medium">{house.meterCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Capacity</span>
                        <span className="font-medium">{maxCapacity} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Load</span>
                        <span className="font-medium">{currentLoad.toFixed(2)} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total DER's</span>
                        <span className="font-medium">{house.ders.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type</span>
                        <span className="font-medium">{house.type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Status</span>
                        {getStatusColor(currentLoad, house.max_capacity_KW)}
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      DER Control - {house.name}
                      {index === 0 && (
                        <span className="text-red-500 text-sm ml-2">(Demo House)</span>
                      )}
                    </DialogTitle>
                    
                    <div className="space-y-3">
                      {house.ders.map((der, i) => (
                        <DERComponent 
                          key={der.id}
                          count={i + 1}
                          der={der}
                          isOn={simulation.getDERStatus(house.id, der.id.toString())}
                          onToggle={() => simulation.toggleDER(house.id, der.id.toString())} // Now passing number directly
                        />
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Current Load:</span>
                        <span className={`font-bold ${
                          currentLoad > maxCapacity ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {currentLoad.toFixed(2)} kW / {maxCapacity} kW
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentLoad > maxCapacity ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, maxCapacity > 0 ? (currentLoad / maxCapacity) * 100 : 0)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LiveScore = ({ load, isFirst }: { load: number; isFirst: boolean }) => {
  return (
    <Card className="px-3 py-1">
      <div className="flex items-center space-x-2">
        <span className="text-sm">Load</span>
        <span className={`font-medium text-sm ${
          isFirst ? 'text-red-500' : 'text-gray-700'
        }`}>
          {load.toFixed(1)} kW
        </span>
      </div>
    </Card>
  );
};

const DERComponent = ({ 
  der, 
  count, 
  isOn, 
  onToggle 
}: { 
  der: SimplifiedItem["ders"][0]; 
  count: number;
  isOn: boolean;
  onToggle: () => void;
}) => {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="font-medium">DER {count}</span>
            <span className="text-sm text-gray-500">{der.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isOn ? 'text-green-600' : 'text-red-600'}`}>
              {isOn ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <Switch 
              checked={isOn}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseList;