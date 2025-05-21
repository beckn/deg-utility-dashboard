import type { StrapiApiRoot,  SimplifiedData,  SubstationWithUtility, TransformerWithSubstation, MeterWithTransformer, StrapiAuditTrail, SimplifiedAuditTrail } from "../types"

export const simplifyUtilData = (data: StrapiApiRoot): SimplifiedData => {
  const substations: SubstationWithUtility[] = [];
  const transformers: TransformerWithSubstation[] = [];
  const meters: MeterWithTransformer[] = [];

  data.utilities.forEach((util) => {
    util.substations.forEach((sub) => {
      // Substation with utility context
      const subWithUtility = {
        ...sub,
        utilityId: util.id,
        utilityName: util.name,
        utilityCity: util.city,
        utilityState: util.state,
        utilityLatitude: util.latitude,
        utilityLongtitude: util.longtitude,
        utilityPincode: util.pincode,
      };
      substations.push(subWithUtility);
      sub.transformers.forEach((tr) => {
        // Transformer with substation (with utility) context
        const trWithSubstation = {
          ...tr,
          ...subWithUtility,
        };
        // transformers.push(trWithSubstation);
        tr.meters.forEach((meter) => {
          // Meter with transformer (with substation and utility) context
          const meterWithTransformer = {
            ...meter
          };
          meters.push(meterWithTransformer);
        });
      });
    });
  });

  return { substations, transformers, meters };
}

export const simplifyUtilDataForDashboard = (data: StrapiApiRoot) => {
  return data.utilities.flatMap((utility) =>
    utility.substations.flatMap((substation) => substation.transformers)
  )
}

export const simplifyAuditTrailData = (data: StrapiApiRoot): SimplifiedAuditTrail[] => {
  return data.orders.map((item) => ({
    id: item.id,
    name: item.name || "",
    meterId: item.meter_id,
    orderId: item.order.id,
    consumption: item.current_consumption_kwh,
    percent: Math.abs(item.consumption_change_percentage),
    up: item.consumption_change_percentage > 0 ? false : true,
    accepted: item.dfp_accepted
  }))
}