import { create } from 'zustand';
import { strapiClient } from './strapi';
import { type SimplifiedMeter, simplifyUtilData } from './utility';

type SimplifiedDataState = {
    data: SimplifiedMeter[];
    setData: (data: SimplifiedMeter[]) => void;
    clear: () => void;
    fetchAndStore: () => Promise<void>;
    selectedHouse: SimplifiedMeter | null;
    setSelectedHouse: (house: SimplifiedMeter | null) => void;
};

export const useSimplifiedUtilData = create<SimplifiedDataState>((set) => ({
    data: [],

    selectedHouse: null,
    setSelectedHouse: (house) => set({ selectedHouse: house }),
    
    setData: (data) => set({ data }),
    clear: () => set({ data: [] }),
    fetchAndStore: async () => {
        // @ts-ignore
        const { data, error } = await strapiClient.GET("/meter-data-simulator/utility/detailed", {
            // params: {
            //     // @ts-ignore: If type mismatch, adjust as needed
            //     query: {
            //         "pagination[page]": 1,
            //         "pagination[pageSize]": 100,
            //         populate: "substations.transformers.meters.energyResource"
            //     }
            // }
        });
        console.log('simplified util', data);
        
        if (error) {
            // handle error as needed
            set({ data: [] });
            return;
        }
        if (data) {
            // @ts-ignore: If type mismatch, adjust as needed
            const simplified = simplifyUtilData(data);
            console.log('simplified util', simplified);
            set({ data: simplified });
        }
    }
}));