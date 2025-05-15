export interface SimplifiedMeter {
    [x: string]: any;
    utilityId: number;
    utilityName: string;
    utilityCity: string;
    utilityState: string;
    substationId: number;
    substationName: string;
    substationCity: string;
    substationState: string;
    transformerId: number;
    transformerName: string;
    transformerCity: string;
    transformerState: string;
    meterId: number;
    meterCode: string;
    meterType: string;
    meterMaxCapacityKW: number;
    meterCity: string;
    meterState: string;
    meterLatitude: number;
    meterLongitude: number;
    meterPincode: string;
    meterConsumptionLoadFactor: number;
    meterProductionLoadFactor: number;
    energyResourceId: number | undefined;
    energyResourceName: string | undefined;
    energyResourceType: string | undefined;
    ders: {
        id: number;
        switched_on: boolean;
        applianceId: number;
        applianceName: string;
        appliancePowerRating: number;
        applianceBaseKWh: number;
        applianceDescription: string;
    }[];
}

export const simplifyUtilData = (data: Root): SimplifiedMeter[] => {
    const result: SimplifiedMeter[] = [];
    // biome-ignore lint/complexity/noForEach: <explanation>
    data.utilities.forEach(util => {
      // biome-ignore lint/complexity/noForEach: <explanation>
        util.substations.forEach(sub => {
          // biome-ignore lint/complexity/noForEach: <explanation>
            sub.transformers.forEach(tr => {
                // biome-ignore lint/complexity/noForEach: <explanation>
                tr.meters.forEach(meter => {
                    result.push({
                        utilityId: util.id,
                        utilityName: util.name,
                        utilityCity: util.city,
                        utilityState: util.state,
                        substationId: sub.id,
                        substationName: sub.name,
                        substationCity: sub.city,
                        substationState: sub.state,
                        transformerId: tr.id,
                        transformerName: tr.name,
                        transformerCity: tr.city,
                        transformerState: tr.state,
                        meterId: meter.id,
                        meterCode: meter.code,
                        meterType: meter.type,
                        meterMaxCapacityKW: meter.max_capacity_KW,
                        meterCity: meter.city,
                        meterState: meter.state,
                        meterLatitude: meter.latitude,
                        meterLongitude: meter.longitude,
                        meterPincode: meter.pincode,
                        meterConsumptionLoadFactor: meter.consumptionLoadFactor,
                        meterProductionLoadFactor: meter.productionLoadFactor,
                        energyResourceId: meter.energyResource?.id,
                        energyResourceName: meter.energyResource?.name,
                        energyResourceType: meter.energyResource?.type,
                        ders: meter.energyResource?.ders?.map(der => ({
                            id: der.id,
                            switched_on: der.switched_on,
                            applianceId: der.appliance.id,
                            applianceName: der.appliance.name,
                            appliancePowerRating: der.appliance.powerRating,
                            applianceBaseKWh: der.appliance.baseKWh,
                            applianceDescription: der.appliance.description,
                        })) || [],
                    });
                });
            });
        });
    });
    return result;
}

export interface Root {
  utilities: Utility[]
}

export interface Utility {
  id: number
  name: string
  city: string
  state: string
  latitude: string
  longtitude: string
  pincode: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  substations: Substation[]
}

export interface Substation {
  id: number
  name: string
  city: string
  state: string
  latitude: string
  longtitude: string
  pincode: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  max_capacity_KW: number
  transformers: Transformer[]
}

export interface Transformer {
  id: number
  name: string
  city: string
  state: string
  latitude: string
  longtitude: string
  pincode: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  max_capacity_KW: number
  meters: Meter[]
}

export interface Meter {
  id: number
  code: string
  consumptionLoadFactor: number
  productionLoadFactor: number
  type: string
  city: string
  state: string
  latitude: number
  longitude: number
  pincode: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  max_capacity_KW: number
  energyResource: EnergyResource
}

export interface EnergyResource {
  id: number
  name: string
  type: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  ders: Der[]
}

export interface Der {
  id: number
  switched_on: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
  appliance: Appliance
}

export interface Appliance {
  id: number
  name: string
  powerRating: number
  baseKWh: number
  description: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}
