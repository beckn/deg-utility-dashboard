// components/HouseList.tsx
import { useMeterDataStream } from "@/lib/api";
import { useSimplifiedData } from "@/lib/useSimplifiedData";
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
  const { data: houses, selectedHouse, setSelectedHouse } = useSimplifiedData()

  const getStatusColor = (value: number, limit: number) => {
    const ratio = value / limit;
    if (ratio >= 0.9) {
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${"bg-red-500 text-white"}`}
        >
          Critical
        </span>
      )
    } if (ratio >= 0.7) {
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${"bg-yellow-500 text-white"}`}
        >
          Warning
        </span>

      )
    }
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${"bg-green-500 text-white"}`}
      >
        Normal
      </span>

    )
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Houses</h2>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="space-y-4 p-2">
          {houses.map((house) => (
            <Dialog
              key={house.id}
            >
              <DialogTrigger asChild>
                <div
                  onClick={() => setSelectedHouse(house)}
                  className={`p-4 bg-white/90 rounded-lg cursor-pointer transition-all hover:bg-white shadow-sm ${selectedHouse?.id === house.id ? "ring-2 ring-blue-500 scale-105" : ""
                    }`}
                >
                  <div className="font-semibold text-gray-800 mb-2 flex justify-between">
                    {house.name}
                    <LiveScore id={house.id} />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Meter Code</span>
                      <span className="font-medium">{house.meterCode} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Capacity</span>
                      <span className="font-medium">{house.max_capacity_KW} kW</span>
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
                      {getStatusColor(1, house.max_capacity_KW ?? 1)}
                    </div>
                  </div>
                </div>

              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>List of DER</DialogTitle>
                  
                  {
                    house.ders.map((der, i) => (
                      <DERComponent count={i} key={der.id} der={der} />
                      
                    ))
                  }
                  <CardFooter className="gap-3 flex ">
                    <Button className="ml-auto">Apply Settings</Button>
                  </CardFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
};

const LiveScore = ({ id }: { id: string | number }) => {
  const { data, error } = useMeterDataStream(id)
  return (
    <div className="flex items-center bg-red-200 animate-pulse px-2">
      <div>
        <span className="text-sm">Load</span>
        <span className="font-medium text-sm ps-2">{data} kW</span>
      </div>
    </div>
  );
}

const DERComponent = ({ der, count }: { der: SimplifiedItem["ders"][0], count: number }) => {
  return (
    <Card>
      <CardFooter className="justify-between">
        <span>{count}</span>
        <span>{der.id}</span>
        <Switch />
      </CardFooter>
    </Card>
  );
}

export default HouseList;
