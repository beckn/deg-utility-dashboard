/**
 * Type of energy resource.
 */
export type EnergyResourceType = "CONSUMER" | "PRODUCER";

/**
 * Type of meter.
 */
export type MeterType = "SMART" | "CONVENTIONAL";

/**
 * Represents an electrical appliance.
 */
export interface Appliance {
    /** Unique identifier for the appliance
     * @example 8
     */
    id: number;
    /** Name of the appliance
     * @example "Air Conditioner (1.5 Ton)"
     */
    name: string;
    /** Power rating in watts
     * @example 1500
     */
    powerRating: number;
    /** Base energy consumption in kWh
     * @example 0.025
     */
    baseKWh: number;
    /** Description of the appliance
     * @example "High-power appliance"
     */
    description: string;
    /** ISO timestamp when created
     * @example "2025-05-11T05:38:13.724Z"
     */
    createdAt: string;
    /** ISO timestamp when last updated
     * @example "2025-05-11T05:38:13.724Z"
     */
    updatedAt: string;
    /** ISO timestamp when published
     * @example "2025-05-11T05:38:13.723Z"
     */
    publishedAt: string;
}

/**
 * Distributed Energy Resource (DER) instance.
 */
export interface Der {
    /** Unique identifier for the DER
     * @example 1
     */
    id: number;
    /** Whether the DER is switched on
     * @example true
     */
    switched_on: boolean;
    /** ISO timestamp when created
     * @example "2025-05-12T18:29:30.523Z"
     */
    createdAt: string;
    /** ISO timestamp when last updated
     * @example "2025-05-12T20:18:16.579Z"
     */
    updatedAt: string;
    /** ISO timestamp when published
     * @example "2025-05-12T18:29:31.496Z"
     */
    publishedAt: string;
    /** Associated appliance
     * @example { "id": 8, "name": "Air Conditioner (1.5 Ton)", ... }
     */
    appliance: Appliance;
}

/**
 * Represents an energy resource (consumer or producer).
 */
export interface EnergyResource {
    /** Unique identifier for the resource
     * @example 3
     */
    id: number;
    /** Name of the resource
     * @example "John Doe Home"
     */
    name: string;
    /** Type of resource (e.g., CONSUMER, PRODUCER)
     * @example "CONSUMER"
     */
    type: EnergyResourceType;
    /** ISO timestamp when created
     * @example "2025-05-12T18:36:15.836Z"
     */
    createdAt: string;
    /** ISO timestamp when last updated
     * @example "2025-05-12T18:36:16.400Z"
     */
    updatedAt: string;
    /** ISO timestamp when published
     * @example "2025-05-12T18:36:16.395Z"
     */
    publishedAt: string;
    /** List of DERs associated with this resource
     * @example [ { "id": 1, "switched_on": true, ... } ]
     */
    ders: Der[];
}

/**
 * Represents a smart or conventional meter.
 */
export interface Meter {
    /** Unique identifier for the meter
     * @example 2
     */
    id: number;
    /** Meter code or serial number
     * @example "METER001"
     */
    code: string;
    /** Load factor for consumption
     * @example 1
     */
    consumptionLoadFactor: number;
    /** Load factor for production
     * @example 0
     */
    productionLoadFactor: number;
    /** Type of meter (e.g., SMART)
     * @example "SMART"
     */
    type: MeterType;
    /** City where the meter is located
     * @example "San Francisco"
     */
    city: string;
    /** State where the meter is located
     * @example "CA"
     */
    state: string;
    /** Latitude coordinate
     * @example 37.78
     */
    latitude: number;
    /** Longitude coordinate
     * @example -122.42
     */
    longitude: number;
    /** Postal code
     * @example "94103"
     */
    pincode: string;
    /** ISO timestamp when created
     * @example "2025-05-12T18:38:36.496Z"
     */
    createdAt: string;
    /** ISO timestamp when last updated
     * @example "2025-05-12T18:38:37.073Z"
     */
    updatedAt: string;
    /** ISO timestamp when published
     * @example "2025-05-12T18:38:37.062Z"
     */
    publishedAt: string;
    /** Maximum capacity in kW, if applicable
     * @example null
     */
    max_capacity_KW: number | null;
    /** Associated energy resource
     * @example { "id": 3, "name": "John Doe Home", ... }
     */
    energyResource: EnergyResource;
}

/**
 * Represents a transformer in the grid.
 */
export interface Transformer {
    /** Unique identifier for the transformer
     * @example 1
     */
    id: number;
    /** Name of the transformer
     * @example "Transformer1"
     */
    name: string;
    /** City where the transformer is located
     * @example "San Francisco"
     */
    city: string;
    /** State where the transformer is located
     * @example "CA"
     */
    state: string;
    /** Latitude coordinate
     * @example "37.801"
     */
    latitude: string;
    /** Longitude coordinate
     * @example "-122.429"
     */
    longtitude: string;
    /** Postal code
     * @example "94123"
     */
    pincode: string;
    /** ISO timestamp when created
     * @example "2025-05-12T18:28:02.459Z"
     */
    createdAt: string;
    /** ISO timestamp when last updated
     * @example "2025-05-12T18:38:43.909Z"
     */
    updatedAt: string;
    /** ISO timestamp when published
     * @example "2025-05-12T18:28:03.022Z"
     */
    publishedAt: string;
    /** Maximum capacity in kW
     * @example 120
     */
    max_capacity_KW: number;
    /** List of meters connected to this transformer
     * @example [ { "id": 2, "code": "METER001", ... } ]
     */
    meters: Meter[];
}

/**
 * Represents a substation in the grid.
 */
export interface Substation {
    /** Unique identifier for the substation
     * @example 2
     */
    id: number;
    /** Name of the substation
     * @example "SF Mission Substation"
     */
    name: string;
    /** City where the substation is located
     * @example "San Francisco"
     */
    city: string;
    /** State where the substation is located
     * @example "CA"
     */
    state: string;
    /** Latitude coordinate
     * @example "37.7668"
     */
    latitude: string;
    /** Longitude coordinate
     * @example "-122.4215"
     */
    longtitude: string;
    /** Postal code
     * @example "94103"
     */
    pincode: string;
    /** ISO timestamp when created
     * @example "2025-05-12T18:14:59.313Z"
     */
    createdAt: string;
    /** ISO timestamp when last updated
     * @example "2025-05-12T18:15:10.056Z"
     */
    updatedAt: string;
    /** ISO timestamp when published
     * @example "2025-05-12T18:15:10.044Z"
     */
    publishedAt: string;
    /** Maximum capacity in kW
     * @example 1000
     */
    max_capacity_KW: number;
    /** List of transformers in this substation
     * @example [ { "id": 1, "name": "Transformer1", ... } ]
     */
    transformers: Transformer[];
}

/**
 * Represents a utility company.
 */
export interface Utility {
    /** Unique identifier for the utility
     * @example 1
     */
    id: number;
    /** Name of the utility
     * @example "Pacific Gas and Electric Company"
     */
    name: string;
    /** City where the utility is based
     * @example "San Francisco"
     */
    city: string;
    /** State where the utility is based
     * @example "CA"
     */
    state: string;
    /** Latitude coordinate
     * @example "37.7929"
     */
    latitude: string;
    /** Longitude coordinate
     * @example "-122.3969"
     */
    longtitude: string;
    /** Postal code
     * @example "94105"
     */
    pincode: string;
    /** ISO timestamp when created
     * @example "2025-05-12T18:00:05.040Z"
     */
    createdAt: string;
    /** ISO timestamp when last updated
     * @example "2025-05-12T18:00:05.683Z"
     */
    updatedAt: string;
    /** ISO timestamp when published
     * @example "2025-05-12T18:00:05.678Z"
     */
    publishedAt: string;
    /** List of substations managed by this utility
     * @example [ { "id": 2, "name": "SF Mission Substation", ... } ]
     */
    substations: Substation[];
}

/**
 * Root data structure containing all utilities.
 */
export interface Data {
    /** List of utility companies
     * @example [ { "id": 1, "name": "Pacific Gas and Electric Company", ... } ]
     */
    utilities: Utility[];
}