import { create } from 'zustand';
import type { SimplifiedItem } from './convetor';
import { simplifyData } from './convetor';
import { strapiClient } from './strapi';

type SimplifiedDataState = {
    data: SimplifiedItem[];
    setData: (data: SimplifiedItem[]) => void;
    clear: () => void;
    fetchAndStore: () => Promise<void>;
    selectedHouse: SimplifiedItem | null;
    setSelectedHouse: (house: SimplifiedItem | null) => void;
};

export const useSimplifiedData = create<SimplifiedDataState>((set) => ({
    data: [],

    selectedHouse: null,
    setSelectedHouse: (house) => set({ selectedHouse: house }),
    
    setData: (data) => set({ data }),
    clear: () => set({ data: [] }),
    fetchAndStore: async () => {
        // Adjust the endpoint and params as needed
        const { data, error } = await strapiClient.GET('/api/energy-resources', {
            params: {
                // @ts-ignore: If type mismatch, adjust as needed
                query: {
                    "pagination[page]": 1,
                    "pagination[pageSize]": 2,
                    populate: "ders,meter"
                }
            }
        });
        if (error) {
            // handle error as needed
            set({ data: [] });
            return;
        }
        if (data) {
            // @ts-ignore: If type mismatch, adjust as needed
            const simplified = simplifyData(data as any);
            console.log('simplified', simplified);
            set({ data: simplified });
        }
    }
}));