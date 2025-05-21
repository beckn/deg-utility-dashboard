import type { StrapiApiRoot,  SimplifiedData,  SubstationWithUtility, TransformerWithSubstation, MeterWithTransformer } from "../types"

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