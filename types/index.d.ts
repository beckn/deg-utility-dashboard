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



declare global {
  // API Response Types
  interface ApiResponse<T> {
    data: T[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }

  // Energy Resource Types
  interface EnergyResource {
    id: number;
    attributes: {
      name: string;
      type: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  }

  interface DER {
    id: number;
    attributes: {
      switched_on: boolean;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  }

  interface Meter {
    id: number;
    attributes: {
      code: string;
      consumptionLoadFactor: number;
      productionLoadFactor: number;
      type: string;
      city: string;
      state: string;
      latitude: number;
      longitude: number;
      pincode: string;
      max_capacity_KW: number;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      energyResource?: {
        data: EnergyResource;
      };
    };
  }

  interface Transformer {
    id: number;
    attributes: {
      name: string;
      city: string;
      state: string;
      latitude: string;
      longtitude: string;
      pincode: string;
      max_capacity_KW: number;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      meters: {
        data: Meter[];
      };
    };
  }

  interface Substation {
    id: number;
    attributes: {
      name: string;
      city: string;
      state: string;
      latitude: string;
      longtitude: string;
      pincode: string;
      max_capacity_KW: number;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      transformers: {
        data: Transformer[];
      };
    };
  }

  interface Utility {
    id: number;
    attributes: {
      name: string;
      city: string;
      state: string;
      latitude: string;
      longtitude: string;
      pincode: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      substations: {
        data: Substation[];
      };
    };
  }

  // UI Types for Dashboard
  interface FeederData {
    id: string;
    name: string;
    region: string;
    currentLoad: number;
    status: "Critical" | "Warning" | "Normal";
    coordinates: [number, number];
    meters: ProcessedMeter[];
  }

  interface ProcessedMeter {
    id: number;
    code: string;
    currentLoad: number;
    capacity: number;
    status: "Critical" | "Warning" | "Normal";
    energyResourceName?: string;
  }

  interface SystemMetrics {
    current: number;
    peak: number;
    total: number;
  }

  // Energy Resources for Aggregator
  interface EnergyResourceWithDERS {
    id: number;
    attributes: {
      name: string;
      type: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      ders: {
        data: DER[];
      };
      meter: {
        data: Meter;
      };
    };
  }

  // Processed types for UI
  interface House {
    id: number;
    name: string;
    currentLoad: number;
    totalDERs: number;
    status: "Critical" | "Warning" | "Normal";
    coordinates: [number, number];
    ders: ProcessedDER[];
  }

  interface ProcessedDER {
    id: number;
    name: string;
    currentLoad: number;
    isEnabled: boolean;
  }
}

export {};