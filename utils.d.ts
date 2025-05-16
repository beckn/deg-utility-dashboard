export interface Main {
    utilities: Utility[];
}

export interface Utility {
    id:               number;
    name:             string;
    city:             City;
    state:            State;
    latitude:         string;
    longtitude:       string;
    pincode:          string;
    createdAt:        Date;
    updatedAt:        Date;
    publishedAt:      Date;
    substations?:     Utility[];
    max_capacity_KW?: number;
    transformers?:    Utility[];
    meters?:          Meter[];
}

export enum City {
    SANFrancisco = "San Francisco",
}

export interface Meter {
    id:                    number;
    code:                  string;
    consumptionLoadFactor: number;
    productionLoadFactor:  number;
    type:                  MeterType;
    city:                  City;
    state:                 State;
    latitude:              number;
    longitude:             number;
    pincode:               string;
    createdAt:             Date;
    updatedAt:             Date;
    publishedAt:           Date;
    max_capacity_KW:       number;
    energyResource:        EnergyResource;
}

export interface EnergyResource {
    id:          number;
    name:        string;
    type:        EnergyResourceType;
    createdAt:   Date;
    updatedAt:   Date;
    publishedAt: Date;
    ders:        Der[];
}

export interface Der {
    id:          number;
    switched_on: boolean;
    createdAt:   Date;
    updatedAt:   Date;
    publishedAt: Date;
    appliance:   Appliance;
}

export interface Appliance {
    id:          number;
    name:        Name;
    powerRating: number;
    baseKWh:     number;
    description: Description;
    createdAt:   Date;
    updatedAt:   Date;
    publishedAt: Date;
}

export enum Description {
    CommonResidentialUsage = "Common residential usage",
    CompressorCyclesONOFF = "Compressor cycles ON/OFF",
    ConstantHighPower = "Constant high power",
    Empty = "",
    Entertainment = "Entertainment",
    HighPowerAppliance = "High-power appliance",
    HighPowerButShortUsage = "High-power but short usage",
    ModerateMechanicalLoad = "Moderate mechanical load",
    MotorWaterHeaterLoad = "Motor + water heater load",
    VariesByModel = "Varies by model",
    VeryHighDemandHeating = "Very high-demand heating",
    VeryLowPowerAppliance = "Very low-power appliance",
}

export enum Name {
    AirConditioner15Ton = "Air Conditioner (1.5 Ton)",
    CeilingFan = "Ceiling Fan",
    ElectricGeyser = "Electric Geyser",
    LEDBulb10W = "LED Bulb (10W)",
    LaptopCharger = "Laptop Charger",
    MicrowaveOven = "Microwave Oven",
    Refrigerator = "Refrigerator",
    RoomHeater = "Room Heater",
    SolarPanelProduction = "Solar Panel (production)",
    TelevisionLED = "Television (LED)",
    WashingMachine = "Washing Machine",
    WaterPump = "Water Pump",
}

export enum EnergyResourceType {
    Consumer = "CONSUMER",
}

export enum State {
    CA = "CA",
}

export enum MeterType {
    Smart = "SMART",
}
