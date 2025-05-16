import type { StrapiApiRoot, SimplifiedMeter } from "../types"

export const simplifyUtilData = (data: StrapiApiRoot): SimplifiedMeter[] => {
  const result: SimplifiedMeter[] = []

  data.utilities.forEach((util) => {
    util.substations.forEach((sub) => {
      sub.transformers.forEach((tr) => {
        tr.meters.forEach((meter) => {
          result.push({
            utilityId: util.id,
            utilityName: util.name,
            utilityCity: util.city,
            utilityState: util.state,
            substationId: sub.id,
            substationName: sub.name,
            substationCity: sub.city,
            substationState: sub.state,
            substationLatitude: sub.latitude,
            substationLongtitude: sub.longtitude,
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
            ders:
              meter.energyResource?.ders?.map((der) => ({
                id: der.id,
                switched_on: der.switched_on,
                applianceId: der.appliance.id,
                applianceName: der.appliance.name,
                appliancePowerRating: der.appliance.powerRating,
                applianceBaseKWh: der.appliance.baseKWh,
                applianceDescription: der.appliance.description,
              })) || [],
          })
        })
      })
    })
  })

  return result
}
