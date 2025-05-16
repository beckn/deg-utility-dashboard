// lib/useLoadSimulation.ts
import { useState, useEffect, useCallback } from 'react';
import { SimplifiedItem } from './convetor';

interface LoadState {
  [houseId: string]: number;
}

interface DERState {
  [houseId: string]: {
    [derId: string]: boolean;
  };
}

export const useLoadSimulation = (houses: SimplifiedItem[]) => {
  const [loadStates, setLoadStates] = useState<LoadState>({});
  const [derStates, setDerStates] = useState<DERState>({});
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize states
  useEffect(() => {
    if (houses.length === 0) return;

    const initialLoads: LoadState = {};
    const initialDERs: DERState = {};

    houses.forEach((house, index) => {
      const houseId = house.id.toString(); // Convert to string
      const maxCapacity = house.max_capacity_KW ?? 0;
      
      // Set first house to critical (overloaded)
      if (index === 0) {
        initialLoads[houseId] = maxCapacity * 1.1; // 110% of capacity
      } else {
        // Random load between 60-80% of capacity for other houses
        initialLoads[houseId] = maxCapacity * (0.6 + Math.random() * 0.2);
      }

      // Initialize all DERs as ON
      initialDERs[houseId] = {};
      house.ders.forEach(der => {
        initialDERs[houseId][der.id] = true;
      });
    });

    setLoadStates(initialLoads);
    setDerStates(initialDERs);
  }, [houses]);

  // Calculate actual load based on DER states
  const calculateActualLoad = useCallback((house: SimplifiedItem, baseLoad: number, activeDERs: number) => {
    const maxCapacity = house.max_capacity_KW ?? 0;
    
    // Each DER reduces load by approximately 15% when active
    const derReductionPerUnit = maxCapacity * 0.15;
    const totalReduction = activeDERs * derReductionPerUnit;
    return Math.max(0, baseLoad - totalReduction);
  }, []);

  // Toggle DER state - now accepts both string and number
  const toggleDER = useCallback((houseId: string | number, derId: string) => {
    const houseIdStr = houseId.toString(); // Convert to string
    
    setDerStates(prev => {
      const newState = {
        ...prev,
        [houseIdStr]: {
          ...prev[houseIdStr],
          [derId]: !prev[houseIdStr][derId]
        }
      };

      // Recalculate load for this house
      const house = houses.find(h => h.id.toString() === houseIdStr);
      if (house) {
        const maxCapacity = house.max_capacity_KW ?? 0;
        const activeDERs = Object.values(newState[houseIdStr]).filter(Boolean).length;
        const isFirstHouse = house.id.toString() === houses[0]?.id.toString();
        const baseLoad = maxCapacity * (isFirstHouse ? 1.1 : (0.6 + Math.random() * 0.2));
        const actualLoad = calculateActualLoad(house, baseLoad, activeDERs);
        
        setLoadStates(prevLoads => ({
          ...prevLoads,
          [houseIdStr]: actualLoad
        }));
      }

      return newState;
    });
  }, [houses, calculateActualLoad]);

  // Get current load for a house
  const getCurrentLoad = useCallback((houseId: string | number) => {
    return loadStates[houseId.toString()] || 0;
  }, [loadStates]);

  // Get DER status
  const getDERStatus = useCallback((houseId: string | number, derId: string) => {
    return derStates[houseId.toString()]?.[derId] || false;
  }, [derStates]);

  // Real-time load simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setLoadStates(prev => {
        const newLoads = { ...prev };
        houses.forEach(house => {
          const houseId = house.id.toString();
          const isFirstHouse = house.id.toString() === houses[0]?.id.toString();
          
          if (!isFirstHouse) { // Don't simulate first house randomly
            const maxCapacity = house.max_capacity_KW ?? 0;
            const activeDERs = Object.values(derStates[houseId] || {}).filter(Boolean).length;
            const baseLoad = maxCapacity * (0.6 + Math.random() * 0.2);
            newLoads[houseId] = calculateActualLoad(house, baseLoad, activeDERs);
          }
        });
        return newLoads;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isSimulating, houses, derStates, calculateActualLoad]);

  return {
    getCurrentLoad,
    getDERStatus,
    toggleDER,
    isSimulating,
    setIsSimulating,
    loadStates,
    derStates
  };
};