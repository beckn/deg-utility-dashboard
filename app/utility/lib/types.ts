// General Types
export type DERInfo = {
  id: number
  name: string
  currentLoad: number
  isEnabled: boolean
}

export type House = {
  id: number
  name: string
  currentLoad: number
  totalDERs: number
  status: "Critical" | "Warning" | "Normal"
  ders: DERInfo[]
  coordinates: [number, number]
}

// FeederData is used by UtilityDashboard and UtilityMap
export interface FeederData {
  id: string
  name: string
  region: string
  currentLoad: number
  status: "Critical" | "Warning" | "Normal"
  coordinates: [number, number]
  meters: ProcessedMeter[]
}

// New interface for Transformer Summary in the sidebar
export interface TransformerSummaryItem {
  id: string // transformerId
  name: string // transformerName
  substationName: string // Parent substation name
  city: string // Transformer's city
  currentLoad: number // Percentage load for this transformer
  status: "Critical" | "Warning" | "Normal"
  metersCount: number
  maxCapacity: number
  margin: number
  emergencyService?: boolean
}

export type MetricData = {
  current: number
  peak: number
  total: number
}

export type AssetType = "DER" | "household" | "substation" | "transformer" | "feeder" | "transformer_emergency_service"

export type AssetMarker = {
  id: string
  name: string
  type: AssetType
  coordinates: [number, number]
  status?: "Critical" | "Warning" | "Normal"
  hasDers?: boolean // For filtering households with DERs
  emergencyService?: boolean
}

// Strapi API Response Types
export interface StrapiEnergyResource {
  id: number
  name: string
  type: string
  ders?: StrapiDer[]
}

export interface StrapiDer {
  id: number
  switched_on: boolean
  appliance: StrapiAppliance
}

export interface StrapiAppliance {
  id: number
  name: string
  powerRating: number
  baseKWh: number
  description: string
}

export interface StrapiMeter {
  id: number
  code: string
  type: string
  max_capacity_KW: number
  city: string
  state: string
  latitude: number
  longitude: number
  pincode: string
  consumptionLoadFactor: number
  productionLoadFactor: number
  energyResource?: StrapiEnergyResource
  ders: StrapiDer[]
}

export interface StrapiTransformer {
  id: number
  name: string
  city: string
  state: string
  latitude: string
  longtitude: string
  pincode: string
  max_capacity_KW: number
  status?: "Critical" | "Warning" | "Normal"
  currentLoad?: number
  margin?: number
  meters: StrapiMeter[]
  emergencyService?: boolean
}

export interface StrapiSubstation {
  id: number
  name: string
  city: string
  state: string
  latitude: string
  longtitude: string
  pincode: string
  max_capacity_KW: number
  transformers: StrapiTransformer[]
}

export interface StrapiUtility {
  id: number
  name: string
  city: string
  state: string
  latitude: string
  longtitude: string
  pincode: string
  substations: StrapiSubstation[]
}

export interface StrapiApiRoot {
  utilities: StrapiUtility[]
  orders: StrapiAuditTrail[]
}

// Processed data types
export interface SimplifiedMeter {
  utilityId: number
  utilityName: string
  utilityCity: string
  utilityState: string
  substationId: number
  substationName: string
  substationCity: string
  substationState: string
  substationLatitude?: string
  substationLongtitude?: string
  transformerId: number
  transformerName: string
  transformerCity: string
  transformerState: string
  transformerMaxCapacityKW: number
  meterId: number
  meterCode: string
  meterType: string
  meterMaxCapacityKW: number
  meterCity: string
  meterState: string
  meterLatitude: number
  meterLongitude: number
  meterPincode: string
  meterConsumptionLoadFactor: number
  meterProductionLoadFactor: number
  energyResourceId?: number
  energyResourceName?: string
  energyResourceType?: string
  energyResource?: StrapiEnergyResource | null
  ders: {
    id: number
    switched_on: boolean
    applianceId: number
    applianceName: string
    appliancePowerRating: number
    applianceBaseKWh: number
    applianceDescription: string
  }[]
}

export interface ProcessedMeter {
  id: number
  code: string
  currentLoad: number
  capacity: number
  status: "Critical" | "Warning" | "Normal"
  energyResourceName?: string
}

export type SubstationWithUtility = StrapiSubstation & {
  utilityId: number;
  utilityName: string;
  utilityCity: string;
  utilityState: string;
  utilityLatitude: string;
  utilityLongtitude: string;
  utilityPincode: string;
};

export type TransformerWithSubstation = StrapiTransformer & SubstationWithUtility;

export type MeterWithTransformer = StrapiMeter;

export interface SimplifiedData {
  substations: SubstationWithUtility[];
  transformers: TransformerWithSubstation[];
  meters: MeterWithTransformer[];
}

export interface StrapiAuditTrail {
  id: number;
  name: string;
  meter_id: number | string;
  order: {
    id: number | string;
  };
  dfp_accepted: boolean;
  current_consumption_kwh: number;
  consumption_change_percentage: number;
  up: boolean;
}

export interface SimplifiedAuditTrail {
  id: number;
  name: string;
  meterId: number | string;
  orderId: number | string;
  consumption: number;
  percent: number;
  up: boolean;
  accepted: boolean;
}