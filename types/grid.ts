export interface DER {
  id: number;
  name: string;
  currentLoad: number;
  isEnabled: boolean;
}

export interface House {
  id: number;
  name: string;
  currentLoad: number;
  totalDERs: number;
  status: "Critical" | "Warning" | "Normal";
  ders: DER[];
  coordinates: [number, number];
}
