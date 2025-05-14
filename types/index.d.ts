declare type DER = {
  id: number;
  name: string;
  currentLoad: number;
  isEnabled: boolean;
};

declare type House = {
  id: number;
  name: string;
  currentLoad: number;
  totalDERs: number;
  status: "Critical" | "Warning" | "Normal";
  ders: DER[];
  coordinates: [number, number];
};

// Utility Dashboard Types
declare type Feeder = {
  id: string;
  name: string;
  region: string;
  currentLoad: number;
  status: "Critical" | "Warning" | "Normal";
  coordinates: [number, number];
};

declare type MetricData = {
  current: number;
  peak: number;
  total: number;
};

declare type AssetType = "DER" | "household" | "substation" | "feeder";

declare type AssetMarker = {
  id: string;
  name: string;
  type: AssetType;
  coordinates: [number, number];
  status?: "Critical" | "Warning" | "Normal";
};
