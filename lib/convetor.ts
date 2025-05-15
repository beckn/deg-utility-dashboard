type Der = {
    id: number;
    attributes: {
        switched_on: boolean;
        max_capacity_KW: number;
        // ...other fields...
    };
};

type Meter = {
    data: {
        id: number;
        attributes: {
            code: string;
            city: string;
            state: string;
            max_capacity_KW: number;
            latitude?: number;
            longitude?: number;
            // ...other fields...
        };
    };
};

type Attributes = {
    name: string;
    type: string;
    meter?: Meter;
    ders?: {
        data: Der[];
    };
    // ...other fields...
};

type DataItem = {
    id: number;
    attributes: Attributes;
};

type InputJson = {
    data: DataItem[];
};

type SimplifiedDer = {
    id: number;
    switched_on: boolean;
};

export type SimplifiedItem = {
    id: number;
    name: string;
    type: string;
    meterCode?: string;
    max_capacity_KW?: number;
    city?: string;
    state?: string;
    coordinates: {
        lat: number;
        lng: number;
    }
    ders: SimplifiedDer[];
};

/**
 * Simplifies the input data array.
 * @param json The original JSON object.
 * @returns Array of simplified objects.
 */
export function simplifyData(json: InputJson): SimplifiedItem[] {
    return json.data.map(item => {
        const attr = item.attributes;
        return {
            id: item.id,
            name: attr.name,
            type: attr.type,
            meterCode: attr.meter?.data?.attributes?.code,
            city: attr.meter?.data?.attributes?.city,
            max_capacity_KW: attr.meter?.data?.attributes?.max_capacity_KW,
            state: attr.meter?.data?.attributes?.state,
            coordinates: {
                lat: attr.meter?.data?.attributes?.latitude ?? 0,
                lng: attr.meter?.data?.attributes?.longitude ?? 0,
            },
            ders: (attr.ders?.data || []).map((der: Der) => ({
                id: der.id,
                switched_on: der.attributes.switched_on
            }))
        };
    });
}

// Example usage:
// const simplified = simplifyData(yourDataVariable);
// console.log(simplified);